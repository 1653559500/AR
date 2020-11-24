<template>
    <div>
        <div class="head">
            <div class="left">
                素材名称：<span>{{ data.name }}</span>
            </div>
            <div class="right">
                <saveButton :editData="modelParam"></saveButton>
            </div>
        </div>
        <div id="gui-head">参数设置</div>
        <div id="close-gui">
            <el-button type="text" @click="guiShowHide"
                ><i class="el-icon-arrow-right"></i
            ></el-button>
        </div>
        <div class="bottom">
            <div class="right">
                <p class="draw">
                    <el-button type="text" @click="adaptCanvas"
                        ><i class="el-icon-aim"></i>
                        <span> 适合画布</span></el-button
                    >
                </p>
                <p class="range">
                    <span>缩放 </span>
                    <!-- <input type="range" name="points" min="0" max="10" /> -->
                    <el-slider
                        v-model="slideValue"
                        :min="0.1"
                        :max="100"
                        :step="0.1"
                        @input="changeSlide()"
                    ></el-slider>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import saveButton from "./save";

import * as THREE from "three";

import * as dat from "dat.gui";

export default {
    name: "guiEdit",
    props: [
        "value",
        "isDragPosition",
        "isInitGui",
        "isInitGuiData",
        "data",
        "sceneF",
        "audioF",
        "videoF",
        "innerWidth",  //画布宽
        "innerHeight",  //画布高
        "modelBox",  ////存放THREE.box3对象，这个的主要目的是表示对象的最小边界框
    ],
    data() {
        return {
            object3D: this.value, //最终模型
            scene: this.sceneF, //父级场景
            audio: this.audioF,
            video: this.videoF,

            gui: null,
            modelParam: {
                id: this.$route.params.id,
                position: { x: 0, y: 0, z: 0 }, //位置
                scale: 1, //大小
                angle: { x: 0, y: 0, z: 0 }, //默认旋转角度
                direction: "x", //旋转方向
                rotation: 0, //旋转角度
                showTime: 0,
                timer: 0, //实时查看音视频播放的次数/已经的显示时间
            },

            showTimer: null, //显示时间定时器
            clockTimer: null, //计时器
            playTime: 0, //实时的音视频播放次数/显示时间
            isListenEnded: false, //判断是否监听video的ended
          
            
            guiShow: true,  //控制gui显示隐藏
            slideValue: 0,  //滑动缩放值
            rotateTimer: null,  //3D模型旋转计时器
        };
    },

    mounted() {},
    destroyed() {
        if (typeof this.gui.destroy === "function") this.gui.destroy();
    },
    components: {
        saveButton,
    },
    watch: {
        isDragPosition(newVal) {
            this.changePositionByDrag();
        },
        isInitGui(newVal) {
            if (newVal) {
                this.initGUI();
            }
        },
        isInitGuiData(newVal){
            if (newVal){
                this.initGuiData()
            }
        },
        value(newVal) {
            this.object3D = newVal;
        },
        object3D(newVal) {
            this.$emit("input", newVal);
        },
        sceneF(newVal) {
            this.scene = newVal;
        },
        scene(newVal) {
            this.$emit("update:sceneF", newVal);
        },

        audioF(newVal) {
            this.audio = newVal;
        },
        audio(newVal) {
            this.$emit("update:audioF", newVal);
        },

        videoF(newVal) {
            this.video = newVal;
        },
        video(newVal) {
            this.$emit("update:videoF", newVal);
        },
        //监听GUI参数，并修改模型参数
        "modelParam.angle.x": {
            handler: function () {
                if (this.object3D) {
                    this.object3D.rotateX(-this.object3D.rotation._x);
                    this.object3D.rotateY(-this.object3D.rotation._y);
                    this.object3D.rotateZ(-this.object3D.rotation._z);

                    this.object3D.rotateX(
                        Math.PI * (this.modelParam.angle.x / 180)
                    );
                    this.object3D.rotateY(
                        Math.PI * (this.modelParam.angle.y / 180)
                    );
                    this.object3D.rotateZ(
                        Math.PI * (this.modelParam.angle.z / 180)
                    );
                }
            },
        },
        "modelParam.angle.y": {
            handler: function () {
                if (this.object3D) {
                    this.object3D.rotateX(-this.object3D.rotation._x);
                    this.object3D.rotateY(-this.object3D.rotation._y);
                    this.object3D.rotateZ(-this.object3D.rotation._z);

                    this.object3D.rotateX(
                        Math.PI * (this.modelParam.angle.x / 180)
                    );
                    this.object3D.rotateY(
                        Math.PI * (this.modelParam.angle.y / 180)
                    );
                    this.object3D.rotateZ(
                        Math.PI * (this.modelParam.angle.z / 180)
                    );
                }
            },
        },
        "modelParam.angle.z": {
            handler: function () {
                if (this.object3D) {
                    this.object3D.rotateX(-this.object3D.rotation._x);
                    this.object3D.rotateY(-this.object3D.rotation._y);
                    this.object3D.rotateZ(-this.object3D.rotation._z);

                    this.object3D.rotateX(
                        Math.PI * (this.modelParam.angle.x / 180)
                    );
                    this.object3D.rotateY(
                        Math.PI * (this.modelParam.angle.y / 180)
                    );
                    this.object3D.rotateZ(
                        Math.PI * (this.modelParam.angle.z / 180)
                    );
                }
            },
        },
        "modelParam.scale": {
            handler: function (newV, oldV) {
                if (this.object3D) {
                    this.object3D.scale.set(newV, newV, newV);
                }
                this.slideValue = newV;
            },
        },
        "modelParam.position": {
            handler: function (newV, oldV) {
                if (this.object3D) {
                    this.object3D.position.set(newV.x, newV.y, newV.z);
                }
            },
            deep: true,
        },
        "modelParam.showTime": {
            handler: function () {
                let that = this
                this.playTime = 0;
                this.setShowTimer(this);
                if (this.video) {
                    this.video.play();
                }
                if (this.audio) {
                    this.audio.stop();
                    this.audio.play();
                }
                if (this.object3D) {
                    this.setShowTime();
                }
            },
        },
        "modelParam.rotation": {
            handler: function (val) {
                var that = this;
                clearInterval(this.rotateTimer);

                this.object3D.rotateX(-this.object3D.rotation._x);
                this.object3D.rotateY(-this.object3D.rotation._y);
                this.object3D.rotateZ(-this.object3D.rotation._z);

                this.object3D.rotateX(this.modelParam.angle.x);
                this.object3D.rotateY(this.modelParam.angle.y);
                this.object3D.rotateZ(this.modelParam.angle.z);
                if (this.modelParam.rotation != 0) {
                    this.rotateTimer = setInterval(function () {
                        that.set3DRotateByGui();
                    }, 20);
                }
            },
        },
    },

    created() {},
    methods: {
        /****--------------------------------创建GUI-------------------------------****/
        initGUI() {
            this.gui = new dat.GUI({
                closeOnTop: false,
                width: 350,
                closed: false,
            });

            this.gui.domElement.style =
                "position:absolute;top:112px;right:-15px;background: #ffffff;height: calc(100vh);overflow:scroll;";
            console.log(this.gui);
            //添加位置参数
            var folder = this.gui.addFolder("f_position");
            folder.name = "模型位置";
            folder.add(this.modelParam.position, "x").step(0.00001);
            folder.add(this.modelParam.position, "y").step(0.00001);
            folder.add(this.modelParam.position, "z").step(0.00001);
            folder.open();

            //添加缩放参数
            folder = this.gui.addFolder("f_scale");
            folder.name = "模型缩放";
            folder.add(this.modelParam, "scale", 0.1).name("值");
            folder.open();

            //添加默认旋转角度
            folder = this.gui.addFolder("f_angle");
            folder.name = "模型角度";
            folder.add(this.modelParam.angle, "x", 0, 360, 0.1);
            folder.add(this.modelParam.angle, "y", 0, 360, 0.1);
            folder.add(this.modelParam.angle, "z", 0, 360, 0.1);
            folder.open();

            //添加旋转参数
            var that = this;
            folder = this.gui.addFolder("f_rotate");
            folder.name = "模型旋转";
            folder
                .add(this.modelParam, "direction", {
                    x轴: "x",
                    y轴: "y",
                    z轴: "z",
                })
                .name("方向");
            folder.add(this.modelParam, "rotation", 0, 360, 0.1).name("角度");
            folder.open();

            //添加显示时间
            folder = this.gui.addFolder("f_showTime");
            folder.name = "显示时间/秒";
            folder.add(this.modelParam, "showTime", 0).step(1).name("值");
            folder
                .add(this.modelParam, "timer")
                .name("展示/秒")
                .onChange(this.setShowTimer(this));
            folder.open(); //文件夹folder下面的菜单选项展开显示

            this.setGuiColor();
        },
        setGuiColor() {
            let that = this;
            //设置f_position xyz颜色
            console.log(
                that.gui.__folders.f_position.__ul.children[1].children[0]
                    .children[0]
            );
            that.gui.__folders.f_position.__ul.children[1].children[0].children[0].style =
                "color:red";
            that.gui.__folders.f_position.__ul.children[2].children[0].children[0].style =
                "color:green";
            that.gui.__folders.f_position.__ul.children[3].children[0].children[0].style =
                "color:blue";

            //设置f_angle xyz颜色
            that.gui.__folders.f_angle.__ul.children[1].children[0].children[0].style =
                "color:red";
            that.gui.__folders.f_angle.__ul.children[2].children[0].children[0].style =
                "color:green";
            that.gui.__folders.f_angle.__ul.children[3].children[0].children[0].style =
                "color:blue";

            //设置 f_rotate xyz颜色
            that.gui.__folders.f_rotate.__controllers[0].onFinishChange(
                function () {
                    console.log(
                        that.gui.__folders.f_rotate.__controllers[0].domElement
                            .children[0].value
                    );

                    if (
                        that.gui.__folders.f_rotate.__controllers[0].domElement
                            .children[0].value == "x"
                    ) {
                        that.gui.__folders.f_rotate.__controllers[0].domElement.children[0].style =
                            "color:red";
                    }
                    if (
                        that.gui.__folders.f_rotate.__controllers[0].domElement
                            .children[0].value == "y"
                    ) {
                        that.gui.__folders.f_rotate.__controllers[0].domElement.children[0].style =
                            "color:green";
                    }
                    if (
                        that.gui.__folders.f_rotate.__controllers[0].domElement
                            .children[0].value == "z"
                    ) {
                        that.gui.__folders.f_rotate.__controllers[0].domElement.children[0].style =
                            "color:blue";
                    }
                }
            );
            that.gui.__folders.f_rotate.__controllers[0].domElement.children[0][0].style =
                "color:red";
            that.gui.__folders.f_rotate.__controllers[0].domElement.children[0][1].style =
                "color:green";
            that.gui.__folders.f_rotate.__controllers[0].domElement.children[0][2].style =
                "color:blue";
        },
        guiShowHide() {
            var closeGui = document.getElementById("close-gui");
            var headGui = document.getElementById("gui-head");
            if (this.guiShow) {
                this.guiShow = false;
                this.gui.hide();
                closeGui.style.right = "0";
                headGui.style.right = "-350px";
                this.container.style.margin = "20px auto";
            } else {
                this.guiShow = true;
                this.gui.show();
                closeGui.style.right = "350px";
                headGui.style.right = "0px";
                this.container.style.margin = "20px 40px";
            }
        },

        /*****-------------------------------场景搭建 camera、light、grid、grag-------------------------------****/

        //拖拽结束修改GUI参数
        changePositionByDrag() {
            console.log("平移结束时模型位置", this.object3D.position);
        
            let Pcontrollers = this.gui.__folders.f_position.__controllers;
            Pcontrollers.forEach((item) => {
                if (item) {
                    switch (item.property) {
                        case "x":
                            item.setValue(this.object3D.position.x);

                            break;
                        case "y":
                            item.setValue(this.object3D.position.y);

                            break;
                        case "z":
                            item.setValue(this.object3D.position.z);
                            break;
                        default:
                            break;
                    }
                }
            });
        },

        /*****-------------------------------事件-------------------------------****/

        /** -------------------------------模型创建、添加-------------------------------------**/

        //设置显示时间/次数
        setShowTime() {
            let that = this;
            clearTimeout(that.showTimer);
            clearInterval(that.clockTimer);
            var timeT = ["1", "2", "5"]; // 显示时间 文字、图片、3D
            var timesT = ["3", "4"]; //显示重复次数视频、音乐

            if (timeT.indexOf(this.data.type) > -1) {
                this.scene.add(this.object3D);
                // 显示时间
                //计算时间
                if (this.modelParam.showTime > 0) {
                    this.clockTimer = setInterval(() => {
                        that.playTime++;
                        that.setShowTimer(that);
                    }, 1000);
                    //根据gui给定的时间设置定时器
                    this.showTimer = setTimeout(() => {
                        that.scene.remove(that.object3D);
                        clearInterval(this.clockTimer);
                    }, that.modelParam.showTime * 1000);
                    this.$once("hook:beforeDestroy", () => {
                        clearTimeout(that.showTimer);
                        clearInterval(that.clockTimer);
                    });
                }
            } else if (
                timesT.indexOf(this.data.type) > -1 &&
                this.modelParam.showTime > 0
            ) {
                //显示次数
                if (!this.isListenEnded) {
                    if (this.video) {
                        //视频
                        this.video.addEventListener("ended", function () {
                            that.isListenEnded = true;
                            that.playTime++;
                            that.setShowTimer(that);
                            console.log("video播放次数", that.playTime);
                            if (that.playTime < that.modelParam.showTime) {
                                that.video.play();
                            }
                        });
                    }

                    if (this.audio) {
                        //音频

                        this.$watch("audio.isPlaying", function (newVal) {
                            // console.log(that.audio.isPlaying);
                            that.isListenEnded = true;
                            console.log(newVal);
                            if (!newVal) {
                                that.playTime++;
                                that.setShowTimer(that);
                                console.log("audio播放次数", that.playTime);
                                if (that.playTime < that.modelParam.showTime) {
                                    that.audio.play();
                                }
                            }
                        });
                    }
                }
            }
        },
        //根据gui设置3D模型旋转
        set3DRotateByGui() {
            if (this.data && this.object3D) {
                var angle = Math.PI * (this.modelParam.rotation / 180);
                switch (this.modelParam.direction) {
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
        //根据显示时间/此时设置gui值
        setShowTimer(that) {
            that.gui.__folders.f_showTime.__controllers[1].setValue(
                this.playTime
            );
        },
        //缩放滑块触发
        changeSlide() {
            if(this.gui){
                this.gui.__folders.f_scale.__controllers[0].setValue(
                    this.slideValue
                );
            }
            
        },
        //点击适应画布触发
        adaptCanvas() {
            var target = new THREE.Vector3(); // x:宽， y：高，z:深度
            this.modelBox.getSize(target);
            var modelMaxBorder = target.y > target.z ? target.y : target.z;
            var modelMaxBorder =
                target.x > modelMaxBorder ? target.x : modelMaxBorder;
            var innerMaxBorder =
                this.innerHeight > this.innerWidth
                    ? this.innerHeight
                    : this.innerWidth;

            var mul = innerMaxBorder / modelMaxBorder; //获取边与画布边比值
            console.log("比列", mul);
            this.gui.__folders.f_scale.__controllers[0].setValue(
                mul * this.data.size
            );
             let Pcontrollers = this.gui.__folders.f_position.__controllers;
            Pcontrollers.forEach((item) => {
                if (item) {
                    switch (item.property) {
                        case "x":
                            item.setValue(0);

                            break;
                        case "y":
                            item.setValue(0);

                            break;
                        case "z":
                            item.setValue(0);
                            break;
                        default:
                            break;
                    }
                }
            });
        },
        //根据data，初始化模型和gui
        initGuiData() {
           console.log("initGuiData",this.data)
            this.slideValue = this.data.size;
            //gui参数初始化
            //位置
            this.gui.__folders.f_position.__controllers[0].setValue(
                this.data.positionX
            );
            this.gui.__folders.f_position.__controllers[1].setValue(
                this.data.positionY
            );
            this.gui.__folders.f_position.__controllers[2].setValue(
                this.data.positionZ
            );

            //大小
            this.gui.__folders.f_scale.__controllers[0].setValue(
                this.data.size
            );

            //角度
            this.gui.__folders.f_angle.__controllers[0].setValue(
                this.data.angleX
            );
            this.gui.__folders.f_angle.__controllers[1].setValue(
                this.data.angleY
            );
            this.gui.__folders.f_angle.__controllers[2].setValue(
                this.data.angleZ
            );

            //显示时间
            this.gui.__folders.f_showTime.__controllers[0].setValue(
                this.data.interTime
            );

            if (this.data.type === "1") {
                this.gui.__folders.f_scale.name = "模型大小";
            }
            if (this.data.type != "5") {
                this.gui.__folders.f_rotate.hide();
            } else {
                this.gui.__folders.f_rotate.__controllers[0].setValue(
                    this.data.rotateD
                );
                this.gui.__folders.f_rotate.__controllers[1].setValue(
                    this.data.rotate
                );
            }
            var T1 = ["1", "2", "5"]; // 显示时间 文字、图片、3D
            var T2 = ["3", "4"]; //显示重复次数视频、音乐
            if (T2.indexOf(this.data.type) > -1) {
                //显示次数
                this.gui.__folders.f_showTime.name = "重复次数";
                console.log(this.gui.__folders.f_showTime.__controllers);
                this.gui.__folders.f_showTime.__controllers[1].name(
                    "展示/次数"
                );
            }
        },
    },
};
</script>

<style scoped lang="scss">
.head {
    padding: 0 47px;
    height: 60px;
    line-height: 60px;
    background: #293c4e;
    z-index: 999;
    .left {
        float: left;
        color: #fff;
    }
    .right {
        float: right;
    }
}
#gui-head {
    border-bottom: 1px solid #f4f4f5;
    position: absolute;
    right: 0;
    top: 60px;
    height: 52px;
    width: 350px;
    background: #ffffff;
    font-size: 14px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #30a3f4;
    line-height: 22px;
    padding-top: 22px;
    padding-left: 30px;
}
#close-gui {
    width: 22px;
    height: 57px;
    background: #ffffff;
    color: #30a3f4;
    position: absolute;
    right: 350px;
    top: calc(100vh / 2);
    line-height: 57px;
    padding-left: 5px;
    i {
        font-weight: 700;
    }
}
.bottom {
    position: fixed;
    left: 0;
    bottom: 0;
    background: #fff;
    height: 36px;
    width: 100%;
    line-height: 36px;
    .right {
        color: #666666;
        padding-right: 400px;
        font-size: 14px;
        display: flex;
        justify-content: flex-end;
        .draw {
        }
        .range {
            margin-left: 46px;
            width: 150px;
            display: flex;
            span {
                margin-right: 20px;
            }
            .el-slider {
                width: 100px !important;
            }
        }
    }
}
</style>

