<template>
    <div>
        <div id="container" v-loading="tableLoading"></div>
    </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import {OBJLoader, MTLLoader} from 'three-obj-mtl-loader'
import JSZip from "jszip";
let request = require("request");
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

import { Message } from "element-ui";
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            textMesh: null,
            imageMesh: null,
            videoMesh: null,
            controls: null,
            container: null,
            tableLoading: false,
            data: null,
            materialUrl: null, //素材地址
            imageUrl: null, //目标图片地址
            analyser: null, // 声明一个分析器变量
            group: null, //创建多个网格模型组成的组对象 ==== 音频可视化
            audio: null,
            video: null,
            info3DUrl: null, //3D渲染用到的路径
            showTimer: null, //显示时间定时器
            clockTimer: null, //计时器
            playTime: 0, //实时的音视频播放次数/显示时间
            object3D: null, //最终模型
            fbxMixer: null,
            fbxClock: null,
        };
    },
    mounted() {
        // this.init();
    },
    created() {
        this.getData();
        console.log(this.$route);
    },
    beforeDestroy() {
        console.log("destroy");
        if (this.audio !== null) {
            this.audio.stop();
        }
        if (this.video !== null) {
            // this.scene.remove(this.videoMesh)
            this.video.pause();
        }
    },
    methods: {
        getData() {
            this.tableLoading = true;

            this.$api.restfulApi
                .item("content/one", this.$route.params.id)
                .then((res) => {
                    console.log("content", res);
                    this.data = res;
                    this.materialUrl =
                        window.location.origin + "/" + res.Material.path;
                    this.imageUrl =
                        window.location.origin + "/" + res.Image.path; //目标图片地址
                    console.log("素材地址：", this.materialUrl);
                    console.log("目标图片地址：", this.imageUrl);

                    // this.tableLoading = false;
                    this.init();
                })
                .catch((err) => {
                    this.tableLoading = false;
                });
        },
        // 初始化
        init() {
            this.container = document.getElementById("container")

            this.createScene(); // 创建场景
            console.log("素材类型:", this.data.Material.type);
            switch (this.data.Material.type) {
                case "1":
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
                case "5":
                    if (this.isJSON(this.data.Material.dest)) {
                        this.info3DUrl = JSON.parse(this.data.Material.dest);
                    } else {
                        Message.error(
                            "解析模型生成的json字符串格式错误，可尝试重新上传符合要求的素材"
                        );
                    }
                    this.createObj(); //创建obj模型
                    break;
                default:
                    break;
            }
            this.createLight(); // 创建光源
            this.createCamera(); // 创建相机
            this.createRender(); // 创建渲染器
            this.createControls(); // 创建控件对象
            this.render(); // 渲染
        },
        // 创建场景
        createScene() {
            this.scene = new THREE.Scene();

            // 辅助坐标系  参数250表示坐标系大小，可以根据场景大小去设置
            var axisHelper = new THREE.AxesHelper(300);
            this.scene.add(axisHelper);
            const loader = new THREE.TextureLoader();

            const bgTexture = loader.load(this.imageUrl);

            this.scene.background = bgTexture;
        },
        // 创建图网格模型
        createImageMesh() {
            let geometry = new THREE.BoxGeometry(
                1,
                this.container.clientHeight / 2,
                this.container.clientWidth / 2
            ); // 创建一个矩形Geometry
            // geometry.translate(0, 100, 0);
            console.log(geometry.vertices);

            let ImageLoader = new THREE.ImageLoader();
            let that = this;
            ImageLoader.load(this.materialUrl, function (img) {
                // image对象作为参数，创建一个纹理对象Texture
                let texture = new THREE.Texture(img);
                // 下次使用纹理时触发更新
                texture.needsUpdate = true;
                let material = new THREE.MeshLambertMaterial({
                    map: texture, //设置纹理贴图
                });
                that.imageMesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                // that.imageMesh.rotateY(Math.PI / 4 +30)
                // that.scene.add(that.imageMesh); //网格模型添加到场景中
                that.addModel(that.imageMesh);
            });
        },
        //创建视频网关模型
        createVideoMesh() {
            let that = this;
            // 创建video对象
            that.video = document.createElement("video");
            that.video.src = this.materialUrl; // 设置视频地址
            that.video.autoplay = "autoplay"; //要设置播放
            console.log(that.video);
            // video对象作为VideoTexture参数创建纹理对象
            var texture = new THREE.VideoTexture(that.video);
            // texture.needsUpdate = true;
            var geometry = new THREE.BoxGeometry(
                1,
                this.container.clientHeight / 2,
                this.container.clientWidth / 2
            ); //矩形平面
            var material = new THREE.MeshPhongMaterial({
                map: texture, // 设置纹理贴图
            }); //材质对象Material
            this.videoMesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
            // this.videoMesh.rotateY(Math.PI / 4 +30)
            // this.scene.add(this.videoMesh); //网格模型添加到场景中
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

                var message = that.data.Material.text;

                var shapes = font.generateShapes(message, 1); //第二个参数是size，其实是缩放的大小

                var geometry = new THREE.ShapeBufferGeometry(shapes);
                geometry.computeBoundingBox();
                that.textMesh = new THREE.Mesh(geometry, matLite);
                // that.textMesh.rotateY(Math.PI / 4)
                // that.scene.add(that.textMesh);
                that.addModel(that.textMesh);
            }); //end load function
        },
        //创建音频网格模型
        createMusic() {
            let that = this;

            this.group = new THREE.Group();
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
                this.group.add(mesh);
            }
            // this.group.rotateY(Math.PI / 4)
            // this.scene.add(this.group);
            this.addModel(this.group);

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
            if (that.audio) {
                //音频
                console.log("audio");
                // that.audio.addEventListener('ended', function () {
                //     console.log('ended')
                //     that.audio.play()
                //     that.playTime++
                //     console.log(that.playTime)
                //     // playTime == this.data.Material.interTime && that.audio.pause()
                // })

                this.$watch("audio.isPlaying", function (newVal) {
                    console.log("11111", newVal);
                    if (!newVal) {
                        that.playTime++;
                        console.log("audio播放次数", that.playTime);
                        if (that.playTime < this.data.Material.interTime) {
                            that.audio.play();
                        }
                    }
                });
            }
        },
        //创建obj网格模型
        createObj() {
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
                setInterval(function () {
                    that.set3DRotate();
                }, 20);
            }
        },
        // 创建光源
        createLight() {
            // 点光源
            const point1 = new THREE.PointLight(0xffffff);
            point1.position.set(400, 200, 300); // 点光源位置
            this.scene.add(point1); // 点光源添加到场景中
            const point2 = new THREE.PointLight(0xffffff);
            point2.position.set(-400, -200, -300); // 点光源位置
            this.scene.add(point2); // 点光源添加到场景中
            // 环境光
            const ambient = new THREE.AmbientLight(0x66666);
            this.scene.add(ambient);
        },
        // 创建相机
        createCamera() {
            // const element = document.getElementById("container");
            const width = this.container.clientWidth; // 窗口宽度
            const height = this.container.clientHeight; // 窗口高度
            // const k = width / height; // 窗口宽高比
            // const s = 200; // 三维场景显示范围控制系数，系数越大，显示的范围越大
            // // OrthographicCamera(left, right, top, bottom, near, far)
            // this.camera = new THREE.OrthographicCamera(
            //     -s * k,
            //     s * k,
            //     s,
            //     -s,
            //     1,
            //     1000
            // );
            // this.camera.position.set(200, 300, 200); // 设置相机位置
            // this.camera.lookAt(this.scene.position); // 设置相机方向
            const aspect = width / height;
            this.camera = new THREE.PerspectiveCamera(450, aspect, 0.1, 20000);
            this.camera.position.set(600, 60, 0);
            this.camera.lookAt(this.scene.position);
            // this.scene.add(this.camera);
        },
        // 创建渲染器
        createRender() {
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(
                this.container.clientWidth,
                this.container.clientHeight
            ); // 设置渲染区域尺寸
            this.renderer.setClearColor(0x3f3f3f, 0.4); // 设置背景颜色
            this.container.appendChild(this.renderer.domElement);
        },
        render() {
            requestAnimationFrame(this.render);
            this.renderer.render(this.scene, this.camera); //执行渲染操作

            //音频可视化
            if (this.analyser) {
                // 获得频率数据N个
                var arr = this.analyser.getFrequencyData();
                // console.log(arr);
                // 遍历组对象，每个网格子对象设置一个对应的频率数据
                this.group.children.forEach((elem, index) => {
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
        // 创建控件对象
        createControls() {
            this.controls = new OrbitControls(
                this.camera,
                this.renderer.domElement
            );
        },
        //添加素材
        addModel(model) {
            this.initModifyByData(model);

            console.log("默认参数", model);
            //加入到场景
            this.scene.add(model);
            this.object3D = model;
            console.log(this.scene);
            this.tableLoading = false;
            this.setShowTime(model);
        },
        //根据data，初始化模型
        initModifyByData(model) {
            //初始化模型对象旋转平移缩放变换
            model.position.set(
                this.data.Material.positionX,
                this.data.Material.positionY,
                this.data.Material.positionZ
            );
            model.rotateY(this.data.Material.angleY);
            model.rotateX(this.data.Material.angleX);
            model.rotateZ(this.data.Material.angleZ);
            model.scale.set(
                this.data.Material.size,
                this.data.Material.size,
                this.data.Material.size
            );
            model.name = this.data.Material.name;
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
        //设置显示时间/次数
        setShowTime(model) {
            let that = this;
            clearTimeout(that.showTimer);
            clearInterval(that.clockTimer);
            let timeT = ["1", "2", "5"]; // 显示时间 文字、图片、3D
            // var timesT = ["3", "4"]; //显示重复次数视频、音乐
            if (timeT.indexOf(this.data.Material.type) > -1) {
                if (this.data.Material.interTime > 0) {
                    this.showTimer = setTimeout(() => {
                        that.scene.remove(model);
                        // clearInterval(this.clockTimer);
                    }, this.data.Material.interTime * 1000);
                }
            } else {
                // console.log('视频')
                if (this.video) {
                    //视频
                    this.video.addEventListener("ended", function () {
                        that.playTime++;
                        console.log("video播放次数", that.playTime);
                        if (that.playTime < that.data.Material.interTime) {
                            that.video.play();
                        }
                    });
                }
            }
        },
        //设置3D模型旋转
        set3DRotate() {
            if (this.data.Material.type == "5" && this.object3D) {
                let angle = Math.PI * (this.data.Material.rotate / 180);
                switch (this.data.Material.rotateD) {
                    case "x":
                        this.object3D.rotateX(angle);
                        break;
                    case "y":
                        this.object3D.rotateY(angle);

                        break;
                    case "z":
                        this.object3D.rotateZ(angle);

                        break;
                    default:
                        break;
                }
            }
        },
    },
};
</script>

<style scoped>
#container {
    height: 600px;
    margin-bottom: 30px;
}
</style>
