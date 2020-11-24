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
            <el-form-item label="登录账号" prop="loginname">
                <el-input size="medium"
                          v-model="createForm.loginname"
                          placeholder="请输入登录账号"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="passWord">
                <el-input
                        size="medium"
                        type="password"
                        v-model="createForm.passWord"
                        show-password
                        placeholder="请输入用户密码"
                ></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input size="medium"
                          v-model="createForm.username"
                          placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="roleId">
                <el-select v-model="createForm.roleId"
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
            <el-form-item v-if="createForm.roleId == -3" label="设备类型" prop="equip">
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
            <el-button class="white-btn" size="medium" @click="dialogClose('createForm')" :disabled="dialogLoading">取 消</el-button>
            <el-button class="blue-btn" size="medium" type="primary" @click="create" :disabled="dialogLoading">确 定</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Create",
        data(){
            let validatePassword = (rule, value, callback) => {
                let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,}$/
                if (!value) {
                    callback(new Error('密码长度不小于8,且由数字、字母组成'))
                } else if (!reg.test(value)) {
                    callback(new Error('密码格式有误，请重填（密码为最少8位的数字字母组成）'))
                } else {
                    callback()
                }
            }
            // let validatePhone = (rule, value, callback) => {
            //     if(value){
            //         if (!/^1[3456789]\d{9}$/.test(value)) {
            //             callback(new Error(i18n.t('lang.error-cellphone')))
            //         }else{
            //             callback()
            //         }
            //     }else{
            //         callback()
            //     }
            // }
            return {
                createForm: {},
                formRules: {
                    loginname: [
                        {required: true, message: '请输入账号', trigger: 'change'}
                    ],
                    passWord: [
                        {required: true, validator: validatePassword, trigger: "blur"}
                    ],
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
        methods: {
            //关闭弹窗
            dialogClose(){
                this.createForm = {}
                this.$emit('closeCreate')
            },
            //创建
            create(){
                this.$refs["createForm"].validate(valid => {
                    if (!valid) return
                    this.dialogLoading = true
                    this.$api.restfulApi.create("user", this.createForm).then(() => {
                        this.$message.success('添加成功！')
                        this.dialogLoading = false
                        this.createForm = {}
                        this.$emit('create')
                    }).catch(err => {
                        this.dialogLoading = false
                    })
                });
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
