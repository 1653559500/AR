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
            <el-form-item label="登录账号" prop="loginname">
                <el-input size="medium"
                          disabled
                          v-model="editForm.loginname"
                          placeholder="请输入登录账号"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input size="medium"
                          v-model="editForm.username"
                          placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="roleId">
                <el-select v-model="editForm.roleId"
                           placeholder="请选择用户角色"
                           :loading="roleLoading"
                           @visible-change="getRole">
                    <el-option
                            v-for="item in roleOptions"
                            :key="item.ID"
                            :label="item.name"
                            :value="item.ID">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="editForm.roleId == -3" label="设备类型" prop="equip">
                <el-select v-model="createForm.equip" placeholder="请选择设备类型">
                    <el-option
                            v-for="item in equipOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
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
                    username: [
                        {required: true, message: '请输入用户姓名', trigger: 'change'}
                    ],
                    roleId: [
                        {required: true, message: '请选择用户角色', trigger: 'change'}
                    ],
                    equip: [
                        {required: true, message: '请选择设备类型', trigger: 'change'}
                    ]
                },
                dialogLoading: false,
                roleLoading: false,
                roleOptions: [],
                equipOptions: [
                    {label: 'android用户', value: '1'},
                    {label: 'ios用户', value: '2'}
                ]
            }
        },
        created(){
            this.initEdit()
            this.getRole()
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
                        .edit("user", this.editForm.ID, this.editForm)
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
            },
            //获取role
            getRole(){
                if(this.roleOptions.length > 0) return
                this.roleLoading = true
                this.$api.restfulApi.list("role/all").then(res => {
                    console.log(res)
                    this.roleOptions = res.data
                    this.roleLoading = false
                }).catch(() => {
                    this.roleLoading = false
                })
            }
        }
    }
</script>

<style scoped>

</style>