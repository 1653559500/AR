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
            <el-form-item label="项目名称" prop="name">
                <el-input size="medium"
                          v-model="editForm.name"
                          placeholder="请输入素材名称"></el-input>
            </el-form-item>

            <el-form-item label="项目描述">
                <el-input size="medium"
                          type="textarea"
                          v-model="editForm.describe"
                          placeholder="请输入项目描述"></el-input>
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
    export default {
        props: ['editData'],
        name: "Edit",
        data(){
            return {
                editForm: {},
                formRules: {
                    name: [
                        {required: true, message: '请输入项目名称', trigger: 'change'}
                    ]
                },
                dialogLoading: false,
            }
        },
        created(){
            this.initEdit()
        },
        watch: {
            editData: function (newValue) {
                this.editData = newValue
                this.initEdit()
            }
        },
        methods: {
            //初始化编辑数据
            initEdit(){
                console.log(this.editData)
                this.editForm = this.editData
            },

            //edit
            edit(){
                console.log('---editForm---',this.editForm)
                this.$refs.editForm.validate(valid => {
                    if (!valid) return;
                    this.dialogLoading = true;
                    this.$api.restfulApi
                        .edit("project", this.editForm.ID, this.editForm)
                        .then(res => {
                            this.$message.success('编辑成功!');
                            this.dialogLoading = false;
                            this.$emit("edit");
                        }).catch(err => {
                        this.dialogLoading = false;
                    })
                });
            },
            //关闭弹窗
            closeEdit(formName){
                this.editForm = {}
                this.$emit('closeEdit')
            }
        }
    }
</script>

<style scoped>

</style>