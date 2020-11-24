<template>
    <div class="space-view-box" id="space-view-box" v-loading="modelLoading">
        <guiEdit
            v-model="object3D"
            :isDragPosition="isDragPosition"
            :isInitGui="isInitGui"
            :isInitGuiData="isInitGuiData"
            :data="data"
            :innerWidth="innerWidth"
            :innerHeight="innerHeight"
            :modelBox="modelBox"
            :sceneF.sync="scene"
            :audioF.sync="audio"
            :videoF.sync="video"
            
        ></guiEdit>

        <div id="CanvasContainer" @drop="handleDrag($event)"></div>

        
    </div>
</template>

<script>
import guiEdit from "./guiEdit";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
// import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";  //太老,已经不维护了
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Message } from "element-ui";

export default {
    name: "SpaceView",
    data() {
        return {
            modelLoading: false,
            /**场景背景 */
            sceneBg: require("@/assets/images/sceneBg.jpg"),
            sceneId: 1,
            oPosition: null, //原点坐标
            /**场景 */
            scene: "",
            /**光线 */
            light: "",
            /**相机 */
            camera: "",
            /**控制器 */
            controls: "",
            /**渲染 */
            renderer: "",
            //拖动控件
            transformControls: "",
            objects: [],
            selectObject: "",
            textMesh: null,
            imageMesh: null,
            videoMesh: null,
            materialUrl: null, //素材地址
            analyser: null, // 声明一个分析器变量
            musicGroup: null, //创建多个网格模型组成的组对象 ==== 音频可视化
            audio: null,
            video: null,

            object3D: null, //最终模型
            gridHelper: null,
            
            info3DUrl: null, //3D渲染用到的路径
            data: {},
            innerWidth: 0,
            innerHeight: 0,
            modelBox: null, //存放THREE.box3对象，这个的主要目的是表示对象的最小边界框
            fbxMixer: null, //为fbx声明一个混合器变量
            fbxClock: null, //为fbx创建一个时钟对象Clock
            isInitGui: false,
            isInitGuiData:false,
            isDragPosition: false,
        };
    },

    mounted() {
        this.init();
        this.getData();
    },
    destroyed() {
        console.log("destroy");
        this.stopAudio();
        this.stopVideo();

        if (this.object3D instanceof THREE.Group) {
            this.object3D.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            this.scene.remove(this.object3D);
            // this.scene.dispose()
        }

        if (this.object3D instanceof THREE.Mesh) {
            this.object3D.geometry.dispose();
            this.object3D.material.dispose();
            this.scene.remove(this.object3D);
            // this.scene.dispose()
        }
        if (typeof this.controls.dispose === "function") {
            this.controls.dispose();
        }
    },
    components: {
        guiEdit,
    },
    watch: {},

    created() {},
    methods: {
        getData() {
            this.modelLoading = true;

            this.$api.restfulApi
                .item("material/one", this.$route.params.id)
                .then((res) => {
                    console.log("material", res);
                    this.data = res;
                    this.materialUrl = window.location.origin + "/" + res.path;
                    console.log("素材地址：", this.materialUrl);
                    console.log("素材类型:", this.data.type);
                    this.initMesh();
                })
                .catch((err) => {
                    this.modelLoading = false;
                });
        },

        /**初始化 */
        init() {
            THREE.Cache.enabled = true;
            this.container = document.getElementById("CanvasContainer");

            this.innerWidth = this.container.clientWidth;
            this.innerHeight = this.container.clientHeight;
            this.initScene();
            this.initCamera();
            this.initLight();
            this.initRenderer();
            this.initGridHelper();
            this.initControls();
            this.isInitGui = true
            // addEventListener("click", this.onMouseClick, false);
            addEventListener("resize", this.onWindowResize, false);
            addEventListener("dblclick", this.onMouseDblclick, false);
            addEventListener("keydown", this.onKeyDown, false);

            //渲染
            this.animate();
        },

        animate() {
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.animate);
            //根据gui设置3D模型旋转参数
            // this.set3DRotateByGui();
            //音频可视化
            if (this.analyser) {
                // 获得频率数据N个
                var arr = this.analyser.getFrequencyData();
                // console.log(arr);
                // 遍历组对象，每个网格子对象设置一个对应的频率数据
                this.musicGroup.children.forEach((elem, index) => {
                    elem.scale.y = arr[index] / 80;
                    elem.material.color.r = arr[index] / 200;
                });
            }

            // 创建一个时钟对象Clock
            if (this.fbxMixer !== null) {
                //clock.getDelta()方法获得两帧的时间间隔
                // 更新混合器相关的时间
                this.fbxMixer.update(this.fbxClock.getDelta());
            }
        },

        /*****-------------------------------场景搭建 camera、light、grid、grag-------------------------------****/
        /** 场景**/
        initScene() {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xffffff);

            //给场景添加天空盒子背景
            // const loader = new THREE.TextureLoader();
            // const bgTexture = loader.load(this.sceneBg);

            // this.scene.background = bgTexture;
        },

        /**相机 */
        initCamera() {
            /****透视相机 */
            const aspect = this.innerWidth / this.innerHeight;
            this.camera = new THREE.PerspectiveCamera(450, aspect, 0.1, 20000);
            this.camera.position.set(600, 60, 0);
            this.camera.lookAt(this.scene.position);
            this.scene.add(this.camera);
        },

        /**渲染器 */
        initRenderer() {
            this.renderer = new THREE.WebGLRenderer({
                // 在 css 中设置背景色透明显示渐变色
                alpha: true,
                //开启抗锯齿
                antialias: true,
            });
            //设置渲染区域尺寸
            this.renderer.setSize(this.innerWidth, this.innerHeight);
            this.renderer.setClearColor(0x050505);
            //插入three.js渲染结果：canvas对象
            document.body.appendChild(this.renderer.domElement);
            this.renderer.setPixelRatio(window.devicePixelRatio); //为了兼容高清屏幕
            this.renderer.domElement.setAttribute(
                "style",
                "height:100%;width:100%;"
            );
        },

        /**初始化灯光 */
        initLight() {
            //半球光就是渐变的光
            var hemisphereLight = new THREE.HemisphereLight(
                0xaaaaaa,
                0x0000000,
                0.9
            );

            //方向光是从一个特定的方向的照射
            // 类似太阳，即所有光源是平行的
            // 第一个参数是关系颜色，第二个参数是光源强度
            var shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

            //设置光源的方向
            //位置不同，方向光作用与物体的面也不同，看到的颜色也不同
            shadowLight.position.set(150, 350, 350);

            //开启光源投影
            shadowLight.castShadow = true;

            //定义可见域的投射阴影
            shadowLight.shadow.camera.left = -400;
            shadowLight.shadow.camera.right = 400;
            shadowLight.shadow.camera.top = 400;
            shadowLight.shadow.camera.bottom = -400;
            shadowLight.shadow.camera.near = 1;
            shadowLight.shadow.camera.far = 1000;

            //定义阴影的分辨率，但是需要付出更加昂贵的代价维持高性能的表现。
            shadowLight.shadow.mapSize.width = 2048;
            shadowLight.shadow.mapSize.height = 2048;
            // 为了使这些光源呈现效果，只需要将它们添加到场景中
            this.scene.add(hemisphereLight);
            this.scene.add(shadowLight);
        },

        /**辅助网格线 以及坐标*/
        initGridHelper() {
            /**
             * 添加地面网格GirdHelper
             * size 网格总边长
             * step 网格个数
             * colorCenterLine  网格中心线颜色
             * colorGrid    网格其他线颜色
             */
            this.gridHelper = new THREE.GridHelper(1000, 100);

            this.scene.add(this.gridHelper);

            // 辅助坐标系  参数250表示坐标系大小，可以根据场景大小去设置
            var axisHelper = new THREE.AxesHelper(300);
            this.scene.add(axisHelper);
        },

        /**初始化控制器 */
        initControls() {
            // console.log("相机", this.camera);
            // console.log("场景", this.scene);

            this.container.append(this.renderer.domElement);

            //初始化相机控制器
            this.controls = new OrbitControls(
                this.camera,
                this.renderer.domElement
            );
            // this.controls.rotateSpeed = 1; // 转速
            // this.controls.autoRotate = false; // 是否自动旋转
            // this.controls.autoRotateSpeed = 1; //自动旋转速度
            this.controls.enableZoom = false; //是否可以缩放
            // this.controls.enablePan = true; //是否开启右键拖拽

            this.controls.target.set(0, 0, 0);
            this.controls.minDistance = 100; // 视角最小距离
            this.controls.maxDistance = 50000; // 视角最远距离
            this.controls.maxPolarAngle = Math.PI / 2; // 最大角度
            this.controls.update();
            let that = this;
            // this.controls.addEventListener("change", function () {
            //     console.log("相机", that.camera.position);
            //     console.log("场景", that.scene);
            // });
        },

        /** 添加拖拽控件**/
        initDragControls(obj) {
            this.transformControls = new TransformControls(
                this.camera,
                this.renderer.domElement
            );
            this.scene.add(this.transformControls);

            this.transformControls.addEventListener("mouseDown", (evt) => {
                // 平移开始时禁用相机控件
                this.controls.enabled = false;
            });
            this.transformControls.addEventListener("mouseUp", (evt) => {
                // 平移结束时启用相机控件
                this.controls.enabled = true;
                //拖拽结束修改GUI参数
                this.isDragPosition = !this.isDragPosition;

                this.transformControls.detach();
                this.transformControls.dispose();
            });

            // 指定某个对象绑定到transformControls上，比如点击物体时可将物体绑定
            // console.log(obj)
            this.transformControls.attach(obj);
        },
        /*****-------------------------------事件-------------------------------****/

        /** 获取与射线相交的对象数组**/
        getIntersects(event) {
            event.preventDefault();

            var mouse = new THREE.Vector2();

            // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            //新建一个三维单位向量 假设z方向就是0.5
            //根据照相机，把这个向量转换到视点坐标系
            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(
                this.camera
            );

            //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
            var raycaster = new THREE.Raycaster(
                this.camera.position,
                vector.sub(this.camera.position).normalize()
            );

            //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
            raycaster.setFromCamera(mouse, this.camera);
            // console.log(raycaster);
            // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前

            var intersects = raycaster.intersectObjects(this.objects, true);
            // console.log("素材信息：",intersects);
            //返回选中的对象
            return intersects;
        },

        /** 鼠标左键点击**/
        onMouseClick(event) {
            // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
            var intersects = this.getIntersects(event);
            // 获取选中最近的 Mesh 对象
            if (
                intersects.length != 0 &&
                intersects[0].object instanceof THREE.Mesh
            ) {
                this.selectObject = intersects[0].object;
                if (this.selectObject.parent.type == "Object3D") {
                    this.selectObject = this.selectObject.parent;
                }
            } else {
                this.selectObject = "";
            }
            console.log(this.selectObject);
        },

        /** 鼠标左键双击**/
        onMouseDblclick(event) {
            // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
            var intersects = this.getIntersects(event);
            console.log("素材信息：", intersects);

            // 获取选中最近的 Mesh 对象
            if (
                intersects.length > 0 // intersects[0].object instanceof THREE.Mesh
            ) {
                let selectObj = intersects[0].object;
                console.log();
                if (
                    selectObj.parent.type == "Object3D" ||
                    selectObj.parent.type == "Group"
                ) {
                    this.initDragControls(selectObj.parent);
                    return;
                }
                this.initDragControls(selectObj);
            } else {
                // alert("未选中 Mesh!");
            }
        },

        /** 窗口变动触发的方法**/
        onWindowResize() {
            this.camera.aspect = this.innerWidth / this.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.innerWidth, this.innerHeight); //设置画布大小
        },

        /** 键盘按下触发的方法**/
        onKeyDown(event) {
            switch (event.keyCode) {
                case 13:
                    this.initCamera();
                    this.initControls();
                    break;
            }
        },

        /** -------------------------------模型创建、添加-------------------------------------**/
        initMesh() {
            switch (this.data.type) {
                case "1":
                    this.camera.position.set(-7, 60, 600);
                    this.camera.lookAt(this.scene.position);
                    this.camera.updateProjectionMatrix();
                    this.createTextMesh(); // 创建文字网格模型

                    break;
                case "2":
                    this.createImageMesh(); // 创建图片网格模型
                    break;
                case "3":
                    this.createMusic();
                    break;
                case "4":
                    this.createVideoMesh(); // 创建视频网格模型
                    break;
                case "5": //3D模型
                    if (this.isJSON(this.data.dest)) {
                        this.info3DUrl = JSON.parse(this.data.dest);
                    } else {
                        Message.error(
                            "解析模型生成的json字符串格式错误，可尝试重新上传符合要求的素材"
                        );
                    }

                    this.create3D();
                    break;
                default:
                    break;
            }
        },
        isJSON(str) {
            if (typeof str == "string") {
                try {
                    var obj = JSON.parse(str);
                    if (typeof obj == "object" && obj) {
                        return true;
                    } else {
                        return false;
                    }
                } catch (e) {
                    console.log("error：" + str + "!!!" + e);
                    return false;
                }
            }
            console.log("It is not a string!");
        },
        
        addModel(model) {
            this.initModifyByData(model);
            //加入到场景
            this.scene.add(model);
            console.log(this.scene);
            //加入objects ,双击用到
            this.objects.push(model);
            this.object3D = model;
            this.modelBox = new THREE.Box3();
            this.modelBox.expandByObject(model); //把模型包围在盒子中
            // console.log("模型的边界框", this.modelBox);
            console.log("模型的边界框", this.modelBox.getSize());

            console.log("默认参数", model);

            this.modelLoading = false;
            this.isInitGuiData = true
        },
        //根据data，初始化模型
        initModifyByData(model) {
            //初始化模型对象旋转平移缩放变换
            model.position.set(
                this.data.positionX,
                this.data.positionY,
                this.data.positionZ
            );
            model.rotateY(this.data.angleY);
            model.rotateX(this.data.angleX);
            model.rotateZ(this.data.angleZ);
            model.scale.set(this.data.size, this.data.size, this.data.size);
            model.name = this.data.name;
        },
        stopAudio() {
            if (this.audio !== null) {
                this.audio.stop();
            }
        },

        stopVideo() {
            if (this.video !== null) {
                this.video.pause();
            }
        },
        // 创建图网格模型

        createImageMesh() {
            let ImageLoader = new THREE.ImageLoader();
            let that = this;
            ImageLoader.load(this.materialUrl, function (img) {
                console.log(
                    "图片原始大小：width:" + img.width + ",height:" + img.height
                );
                let geometry = new THREE.BoxGeometry(1, img.height, img.width); // 创建一个矩形Geometry
                // geometry.translate(0, img.height / 2, 0);
                // geometry.rotateY(Math.PI/2)
                // image对象作为参数，创建一个纹理对象Texture
                let texture = new THREE.Texture(img);
                // 下次使用纹理时触发更新
                texture.needsUpdate = true;
                let material = new THREE.MeshLambertMaterial({
                    map: texture, //设置纹理贴图
                });
                that.imageMesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                // that.imageMesh.rotateY(Math.PI / 4 + 30);
                //网格模型添加到场景中
                that.addModel(that.imageMesh);
            });
        },
        //创建视频网关模型

        createVideoMesh() {
            // 创建video对象
            this.video = document.createElement("video");
            this.video.src = this.materialUrl; // 设置视频地址
            this.video.controls = "controls";
            this.video.autoplay = "autoplay"; //要设置播放

            // console.log(this.video)
            // video对象作为VideoTexture参数创建纹理对象
            var texture = new THREE.VideoTexture(this.video);
            // texture.needsUpdate = true;
            var geometry = new THREE.BoxGeometry(
                1,
                this.container.clientHeight / 2,
                this.container.clientWidth / 2
            ); //矩形平面
            // geometry.translate(0, this.container.clientHeight / 4, 0);

            var material = new THREE.MeshPhongMaterial({
                map: texture, // 设置纹理贴图
            }); //材质对象Material
            this.videoMesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
            // this.videoMesh.rotateY(Math.PI / 4 + 30);
            //网格模型添加到场景中
            this.addModel(this.videoMesh);
        },
        //创建文字网格模型

        createTextMesh() {
            let that = this;

            var loader = new THREE.FontLoader();
            loader.load("fonts/SimHei_Regular.json", function (font) {
                var xMid, text;

                var color = 0x000000;

                var matLite = new THREE.MeshBasicMaterial({
                    color: color,
                    // transparent: true,
                    // opacity: 0.4,
                    side: THREE.DoubleSide,
                });

                var message = that.data.text;

                var shapes = font.generateShapes(message, 1); //第二个参数是size，其实是缩放的大小

                var geometry = new THREE.ShapeBufferGeometry(shapes);
                geometry.computeBoundingBox();
                // console.log(geometry);
                that.textMesh = new THREE.Mesh(geometry, matLite);
                // that.textMesh.rotateY(Math.PI / 4);
                that.addModel(that.textMesh);
            }); //end load function
        },

        createMusic() {
            let that = this;
            this.musicGroup = new THREE.Group();
            let N = 128; //控制音频分析器返回频率数据数量
            for (let i = 0; i < N / 2; i++) {
                var box = new THREE.BoxGeometry(10, 100, 10); //创建一个立方体几何对象
                // box.rotateY(Math.PI / 2)
                var material = new THREE.MeshPhongMaterial({
                    color: 0x0000ff,
                }); //材质对象
                var mesh = new THREE.Mesh(box, material); //网格模型对象
                // 长方体间隔20，整体居中
                mesh.position.set(20 * i - (N / 2) * 10, 0, 0);
                this.musicGroup.add(mesh);
            }
            // this.musicGroup.rotateY(Math.PI / 4);
            // this.scene.add(this.musicGroup);
            this.addModel(this.musicGroup);

            // 非位置音频可用于不考虑位置的背景音乐
            // 创建一个监听者
            var listener = new THREE.AudioListener();
            // camera.add( listener );
            // 创建一个非位置音频对象  用来控制播放
            that.audio = new THREE.Audio(listener);
            // 创建一个音频加载器对象
            var audioLoader = new THREE.AudioLoader();
            // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
            audioLoader.load(this.materialUrl, function (AudioBuffer) {
                // console.log(AudioBuffer);
                // 音频缓冲区对象关联到音频对象audio
                that.audio.setBuffer(AudioBuffer);
                // that.audio.setLoop(true); //是否循环
                that.audio.setVolume(0.5); //音量
                // 播放缓冲区中的音频数据
                that.audio.play(); //play播放、stop停止、pause暂停
                // 音频分析器和音频绑定，可以实时采集音频时域数据进行快速傅里叶变换
                that.analyser = new THREE.AudioAnalyser(that.audio, 2 * N);
            });
        },

        create3D() {
            let that = this;

            console.log("3D目录json", that.info3DUrl);
            let manager = new THREE.LoadingManager();

            if (that.info3DUrl.type == "obj") {
                var mtlLoader = new MTLLoader(manager); //材质文件加载器
                var objLoader = new OBJLoader(manager); //obj加载器

                mtlLoader.setResourcePath(that.info3DUrl.map); //设置其他资源的基础地址
                mtlLoader.load(that.info3DUrl.mtl, function (materials) {
                    // 返回一个包含材质的对象MaterialCreator
                    console.log("材质信息", materials);
                    // materials.preload();

                    objLoader.setMaterials(materials);
                    objLoader.load(that.info3DUrl.obj, function (obj) {
                        // console.log("3D",obj);
                        that.addModel(obj); //返回的组对象插入场景中
                    });
                });
            } else if (that.info3DUrl.type == "fbx") {
                var fbxLoader = new FBXLoader(manager);
                fbxLoader.setResourcePath(that.info3DUrl.map);
                fbxLoader.load(that.info3DUrl.fbx, function (obj) {
                    // console.log("3D",obj);
                    that.addModel(obj); //返回的组对象插入场景中
                    // 查看动画数据

                    console.log("fbx animations", obj.animations);

                    if (obj.animations.length > 0) {
                        that.fbxMixer = new THREE.AnimationMixer(obj);
                        that.fbxClock = new THREE.Clock();

                        console.log(that.fbxMixer);

                        // obj.animations[0]：获得剪辑对象clip
                        var AnimationAction = that.fbxMixer.clipAction(
                            obj.animations[0]
                        );
                        // AnimationAction.timeScale = 1; //默认1，可以调节播放速度
                        // AnimationAction.loop = THREE.LoopOnce; //不循环播放
                        // AnimationAction.clampWhenFinished=true;//暂停在最后一帧播放的状态
                        AnimationAction.play(); //播放动画
                    }
                });
            }
        },
    },
};
</script>

<style scoped lang="scss">

#CanvasContainer {
    margin: 20px 40px;
    width: calc(100vw - 420px);
    height: calc(100vh - 140px);
}
</style>
