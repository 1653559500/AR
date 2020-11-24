<template>
    <div>
        <el-form
            :model="createForm"
            ref="createForm"
            :rules="formRules"
            label-position="right"
            label-width="125px"
            v-loading="dialogLoading"
        >
            <el-form-item label="素材名称" prop="showName">
                <el-input size="medium"
                          v-model="createForm.showName"
                          placeholder="请输入素材名称"></el-input>
            </el-form-item>
            <el-form-item label="素材类型" prop="type">
                <el-select
                    v-model="createForm.type"
                    placeholder="请选择素材类型"
                >
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item
                v-if="createForm.type == '1'"
                label="文字"
                prop="text"
            >
                <el-input
                    size="medium"
                    v-model="createForm.text"
                    placeholder="请输入文字"
                ></el-input>
            </el-form-item>
            <el-form-item v-if="createForm.type != '1'" label="上传素材">
                <el-upload
                    class="upload-demo"
                    :action="uploadApi"
                    :headers="{
                        'X-Requested-With': 'XMLHttpRequest',
                        authorization: token,
                    }"
                    :on-success="handleUpSuccess"
                    :on-error="handleUpError"
                    :on-remove="handleUpRemove"
                    :before-remove="beforeRemove"
                    :before-upload="beforeUpload"
                    :limit="1"
                    :accept="acceptType"
                    :file-list="fileList"
                >
                    <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
                <div v-html="tip" id="tip"></div>
            </el-form-item>
            <!-- <el-form-item label="素材位置" prop="position">
                <el-input size="medium"
                          v-model="createForm.position"
                          placeholder="请输入素材显示位置"></el-input>
            </el-form-item>
            <el-form-item label="素材大小" prop="size">
                <el-input size="medium"
                          v-model="createForm.size"
                          placeholder="请输入素材大小"></el-input>
            </el-form-item>
            <el-form-item label="素材方向" prop="direction">
                <el-input size="medium"
                          v-model="createForm.direction"
                          placeholder="请输入素材方向"></el-input>
            </el-form-item>
            <el-form-item label="交互时间" prop="interTime">
                <el-date-picker
                        v-model="createForm.interTime"
                        type="datetime"
                        format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择交互时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="素材角度" prop="angle">
                <el-input size="medium"
                          v-model="createForm.angle"
                          placeholder="请输入素材显示角度"></el-input>
            </el-form-item>
            <el-form-item label="素材旋转" prop="rotate">
                <el-input size="medium"
                          v-model="createForm.rotate"
                          placeholder="请输入素材旋转角度"></el-input>
            </el-form-item> -->
        </el-form>
        <el-divider></el-divider>
        <div
            slot="footer"
            class="dialog-footer dialog-btn-group"
            style="text-align: right"
        >
            <el-button
                class="white-btn"
                size="medium"
                @click="dialogClose('createForm')"
                :disabled="dialogLoading"
                >取 消</el-button
            >
            <el-button
                class="blue-btn"
                size="medium"
                type="primary"
                @click="create"
                :disabled="dialogLoading"
                >确 定</el-button
            >
        </div>
    </div>
</template>

<script>
import tokenFactory from "@/utils/tokenfactory";
import JSZip from "jszip";

export default {
    name: "Create",
    data() {
        return {
            createForm: {},
            formRules: {
                name: [
                    {
                        required: true,
                        message: "请输入素材名称",
                        trigger: "blur",
                    },
                ],
                type: [
                    {
                        required: true,
                        message: "请选择素材类型",
                        trigger: "change",
                    },
                ],
                showName: [
                    {required: true, message: '请输入素材名称', trigger: 'change'}
                ],
                // position: [
                //     {required: true, message: '请输入素材显示位置', trigger: 'blur'}
                // ],
                // size: [
                //     {required: true, message: '请输入素材大小', trigger: 'blur'}
                // ],
                // direction: [
                //     {required: true, message: '请输入素材方向', trigger: 'blur'}
                // ],
                // inter_time: [
                //     {required: true, message: '请输入素材交互时间', trigger: 'blur'}
                // ],
                // angle: [
                //     {required: true, message: '请输入素材显示角度', trigger: 'blur'}
                // ],
                // rotate: [
                //     {required: true, message: '请输入素材旋转角度', trigger: 'blur'}
                // ],
                text: [
                    { required: true, message: "请输入文字", trigger: "blur" },
                ],
            },
            dialogLoading: false,
            options: [
                { name: "文字", value: "1" },
                { name: "图片", value: "2" },
                { name: "音频", value: "3" },
                { name: "视频", value: "4" },
                { name: "3D模型", value: "5" },
            ],
            fileList: [],
            token: "",
            uploadApi: "/api/upload/0",
            fileParams: {},
            beforeUploadRuslt: true,
            acceptType: "",
            tip: "",
        };
    },
    mounted() {
        this.token = tokenFactory.getToken();
    },
    watch: {
        "createForm.type": {
            handler: function () {
                if (this.createForm.type == "2") {
                    this.acceptType = ".jpg, .png, .jpeg, image/bmp";
                    this.tip = "支持.jpg, .png, .jpeg, image/bmp图片格式";
                    this.uploadApi = "/api/upload/2";
                }
                if (this.createForm.type == "3") {
                    this.acceptType = "audio/*,.ogv"; //mp3===>audio/mpeg
                    this.tip = "支持.mp3等音频格式";
                    this.uploadApi = "/api/upload/3";
                }
                if (this.createForm.type == "4") {
                    this.acceptType = "video/*,"; //mp4,mkv,mov,avi,flv.wmv
                    this.tip = "支持mp4,mkv,mov,avi,flv.wmv等视频格式";
                    this.uploadApi = "/api/upload/4";
                }
                if (this.createForm.type == "5") {
                    this.acceptType = ".zip"; //zip
                    this.uploadApi = "/api/upload/5";
                    this.tip =
                        "1、请把素材资料打包成zip格式上传。<br/>" +
                        "2、只支持obj或者fbx其中一种格式<br/>" +
                        "3、FBX格式的版本要大于 7000";
                }
            },
        },
    },
    methods: {
        //关闭弹窗
        dialogClose() {
            this.createForm = {};
            this.fileList = [];
            this.tip = "";
            this.$emit("closeCreate");
        },
        //创建
        create() {
            this.$refs["createForm"].validate((valid) => {
                if (!valid) return;
                this.dialogLoading = true;
                this.$api.restfulApi
                    .create(
                        "material",
                        Object.assign(this.createForm, this.fileParams)
                    )
                    .then(() => {
                        this.dialogLoading = false;
                        this.createForm = {};
                        this.fileList = [];
                        this.tip = "";

                        this.$message.success("添加成功!");
                        this.$emit("create");
                    })
                    .catch(() => {
                        this.dialogLoading = false;
                    });
            });
        },
        //文件上传成功
        handleUpSuccess(res, file, fileList) {
            console.log(res);
            this.fileParams = res;
        },
        //文件上传失败
        handleUpError(err, file, fileList) {
            this.$message({
                showClose: true,
                message:"文件上传失败" + err,
                type:'error',
                duration:6000
            })
        },
        //移除文件
        handleUpRemove(file, fileList) {},
        beforeRemove(file) {
            if (this.beforeUploadRuslt == false) return;
            return this.$confirm(`确定移除 ${file.name}？`);
        },
        beforeUpload(file, fileList) {
            console.log(file);
            if (this.createForm.type == undefined) {
                this.$message.error("请先选择素材类型");
                this.beforeUploadRuslt = false;
                return this.beforeUploadRuslt;
            }
            this.beforeUploadRuslt = true;
            return this.beforeUploadRuslt;
        },

        // parseZip(file) {
        //     let that = this;
        //     JSZip.loadAsync(file).then(function (zip) {
        //         console.log("zip文件", zip);
        //         var FBXfile = zip.file(/^\S+\.FBX$/);
        //         var OBJfile = zip.file(/^\S+\.obj$/);
        //         if (FBXfile.length > 0 && OBJfile.length > 0) {
        //             that.$message.error(
        //                 "上传的压缩包中不能同时包含.FBX文件和.obj文件"
        //             );
        //             that.beforeUploadRuslt = false;
        //             that.beforeRemove(file);
        //             return
        //         }
        //         if (FBXfile.length > 1) {
        //             that.$message.error("上传的压缩包中不能包含多个.FBX文件");
        //             that.beforeUploadRuslt = false;
        //             that.beforeRemove(file);
        //             return
        //         }
        //         if (OBJfile.length > 1) {
        //             that.$message.error("上传的压缩包中不能包含多个.obj文件");
        //             that.beforeUploadRuslt = false;
        //             that.beforeRemove(file);
        //             return
        //         }

        //         // return false;
        //     });
        // },
    },
};
</script>

<style scoped>
#tip {
    color: #a8a8a8;
}
</style>
