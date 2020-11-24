<template>
    <div>
        <el-form
                :model="editForm"
                ref="editForm"
                :rules="formRules"
                label-position="right"
                label-width="125px"
                v-loading="dialogLoading"
        >
            <el-form-item label="素材名称" prop="showName">
                <el-input size="medium"
                          v-model="editForm.showName"
                          placeholder="请输入素材名称"></el-input>
            </el-form-item>
            <el-form-item label="素材类型" prop="type">
                <el-select v-model="editForm.type" placeholder="请选择素材类型">
                    <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.name"
                            :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item
                    v-if="editForm.type == '1'"
                    label="文字"
                    prop="text"
            >
                <el-input
                        size="medium"
                        v-model="editForm.text"
                        placeholder="请输入文字"
                ></el-input>
            </el-form-item>
            <el-form-item v-if="editForm.type != '1'" label="上传素材">
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

        </el-form>
        <el-divider></el-divider>
        <div slot="footer" class="dialog-footer dialog-btn-group" style="text-align: right;">
            <el-button class="white-btn" size="medium" @click="closeEdit('editForm')" :disabled="dialogLoading">取 消</el-button>
            <el-button class="blue-btn" size="medium" type="primary" @click="edit" :disabled="dialogLoading">确 定</el-button>
        </div>
    </div>
</template>

<script>
    import tokenFactory from "@/utils/tokenfactory";
    export default {
        props: ['editData'],
        name: "Edit",
        data(){
            return {
                editForm: {},
                dialogLoading: false,
                formRules: {
                    showName: [
                        {required: true, message: '请输入素材名称', trigger: 'change'}
                    ],
                    type: [
                        {required: true, message: '请选择素材类型', trigger: 'change'}
                    ]
                },
                options: [
                    {name: '文字', value: '1'},
                    {name: '图片', value: '2'},
                    {name: '音频', value: '3'},
                    {name: '视频', value: '4'},
                    {name: '3D模型', value: '5'},
                ],
                fileList: [],
                token: "",
                uploadApi: "/api/upload/0",
                fileParams: {},
                beforeUploadRuslt: true,
                acceptType: "",
                tip: "",
            }
        },
        mounted() {
            this.token = tokenFactory.getToken();
        },
        created(){
            this.initEdit()
        },
        watch: {
            editData(){
                this.initEdit()
            },
            "editForm.type": {
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
                }
            }
        },
        methods: {
            //初始化编辑数据
            initEdit(){
                console.log(this.editData)
                this.editForm.showName = this.editData.showName
                this.editForm.type = this.editData.type
                this.editForm.ID = this.editData.ID
            },

            //edit
            edit(){
                console.log('---editForm---',this.editForm)
                this.$refs.editForm.validate(valid => {
                    if (!valid) return;
                    this.dialogLoading = true;
                    this.$api.restfulApi
                        .edit("material", this.editForm.ID, Object.assign(this.editForm, this.fileParams))
                        .then(res => {
                            this.$message.success('编辑成功!');
                            this.fileList = [];
                            this.tip = "";
                            this.dialogLoading = false;
                            this.$emit("edit");
                        }).catch(err => {
                        this.dialogLoading = false;
                    })
                });
            },
            //关闭弹窗
            closeEdit(formName){
                // this.editForm = {}
                this.$emit('closeEdit')
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
                if (this.editForm.type == undefined) {
                    this.$message.error("请先选择素材类型");
                    this.beforeUploadRuslt = false;
                    return this.beforeUploadRuslt;
                }
                this.beforeUploadRuslt = true;
                return this.beforeUploadRuslt;
            },
        }
    }
</script>

<style scoped>

</style>
