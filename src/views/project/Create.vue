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
            <el-form-item label="项目名称" prop="name">
                <el-input size="medium"
                          v-model="createForm.name"
                          placeholder="请输入项目名称"></el-input>
            </el-form-item>
            <el-form-item label="项目描述">
                <el-input size="medium"
                          type="textarea"
                          v-model="createForm.describe"
                          placeholder="请输入项目描述"></el-input>
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
    export default {
        name: "Create",
        data(){
            return {
                createForm: {},
                formRules: {
                    name: [
                        {required: true, message: '请输入项目名称', trigger: 'change'}
                    ]
                },
                dialogLoading: false,
            }
        },
        methods: {
            //关闭弹窗
            dialogClose(){
                this.createForm = {}
                this.$emit('closeCreate')
            },
            //创建
            create(){
                this.$refs['createForm'].validate(valid => {
                    if(!valid) return
                    this.dialogLoading = true
                    this.$api.restfulApi.create('project', this.createForm).then(() => {
                        this.dialogLoading = false
                        this.$message.success('添加成功!');
                        this.createForm = {}
                        this.$emit('create')
                    }).catch(() => {
                        this.dialogLoading = false
                    })
                })
            }
        }
    }
</script>

<style scoped>

</style>
