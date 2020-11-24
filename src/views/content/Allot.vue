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
            <el-form-item label="选择用户" prop="userIds">
                <el-select v-model="createForm.userIds"
                           placeholder="请选择用户"
                           multiple
                           :loading="userLoading"
                           @visible-change="getUser">
                    <el-option
                            v-for="item in userOptions"
                            :key="item.ID"
                            :label="item.username"
                            :value="item.ID">
                    </el-option>
                </el-select>
            </el-form-item>

        </el-form>
        <el-divider></el-divider>
        <div slot="footer" class="dialog-footer dialog-btn-group" style="text-align: right;">
            <el-button class="white-btn" size="medium" @click="dialogClose('createForm')" :disabled="dialogLoading">取 消</el-button>
            <el-button class="blue-btn" size="medium" type="primary" @click="allot" :disabled="dialogLoading">确 定</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Allot",
        props: ['allotId'],
        data(){
            return {
                createForm: {},
                formRules: {
                    userIds: [
                        {required: true, message: '请选择用户', trigger: 'blur'}
                    ]
                },
                dialogLoading: false,
                userLoading: false,
                userOptions: []

            }
        },
        methods: {
            //关闭弹窗
            dialogClose(){
                this.createForm = {}
                this.$emit('closeAllot')
            },
            //获取用户列表
            getUser(){
                this.userLoading = true
                this.$api.restfulApi.list("content/unassignUser",{id:this.allotId}).then(res => {
                    console.log(res)
                    this.userOptions = res
                    this.userLoading = false
                }).catch(() => {
                    this.userLoading = false
                })

            },
            //分配
            allot(){
                this.$refs['createForm'].validate(valid => {
                    if(!valid) return
                    this.dialogLoading = true
                    this.createForm.id = this.allotId
                    console.log(this.createForm)
                    this.$api.restfulApi.create('content/assign', this.createForm).then(() => {
                        this.dialogLoading = false
                        this.$message.success('分配成功!');
                        this.createForm = {}
                        this.$emit('allot')
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
