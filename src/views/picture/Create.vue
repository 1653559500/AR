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
            <el-form-item label="目标图片名称" prop="showName">
                <el-input size="medium"
                          v-model="createForm.showName"
                          placeholder="请输入目标图片名称"></el-input>
            </el-form-item>
            <el-form-item label="上传图片">
                <el-upload
                        class="upload-demo"
                        :action="uploadApi"
                        :headers="{'X-Requested-With': 'XMLHttpRequest', 'authorization': token}"
                        :on-success="handleUpSuccess"
                        :on-error="handleUpError"
                        :on-remove="handleUpRemove"
                        :before-remove="beforeRemove"
                        :limit="1"
                        accept=".jpg, .png, .jpeg, image/bmp"
                        :file-list="fileList">
                    <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
            </el-form-item>
        </el-form>
        <el-divider></el-divider>
        <div slot="footer" class="dialog-footer dialog-btn-group" style="text-align: right;">
            <el-button class="white-btn" size="medium" @click="dialogClose('createForm')" :disabled="dialogLoading">取 消</el-button>
            <el-button class="blue-btn" size="medium" type="primary" @click="create" :disabled="dialogLoading">确 定</el-button>
        </div>
    </div>
</template>

<script>
    import tokenFactory from '@/utils/tokenfactory'
    export default {
        name: "Create",
        data(){
            return {
                createForm: {},
                formRules: {
                    showName: [
                        {required: true, message: '请输入目标图片名称', trigger: 'change'}
                    ]
                },
                dialogLoading: false,
                fileList: [],
                token: '',
                uploadApi: '/api/upload/0'
            }
        },
        mounted(){
            this.token = tokenFactory.getToken()
        },
        methods: {
            //关闭弹窗
            dialogClose(){
                this.createForm = {}
                this.$emit('closeCreate')
                this.fileList = []
            },
            //创建
            create(){
                this.$refs['createForm'].validate(valid => {
                    if(!valid) return
                    this.dialogLoading = true
                    this.$api.restfulApi.create('image', this.createForm).then(() => {
                        this.dialogLoading = false
                        this.$message.success('添加成功!');
                        this.createForm = {}
                        this.fileList= []
                        this.$emit('create')
                    }).catch(() => {
                        this.dialogLoading = false
                    })
                })
            },
            //文件上传成功
            handleUpSuccess(res, file, fileList) {
                console.log(res)
                this.createForm = Object.assign(this.createForm, res)

            },
            //文件上传失败
            handleUpError(err, file, fileList) {
                this.$message.warning('文件上传失败');
            },
            //移除文件
            handleUpRemove(file, fileList) {

            },
            beforeRemove(file, fileList) {
                return this.$confirm(`确定移除 ${ file.name }？`);
            }
        }
    }
</script>

<style scoped>

</style>
