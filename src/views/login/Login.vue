<template>
    <div class="login">
        <div class="web_bg">
            <img src="../../assets/images/left.png" alt="">
        </div>
        <div class="login-box">
            <h4>
                <img src="../../assets/images/icon/ar.png" alt="">
                AR效果编辑平台
            </h4>
            <p class="title">账号登录</p>
            <el-form :model="loginForm" :rules="formRulrs"  ref="loginForm">
                <el-form-item prop="loginname">
                    <el-input
                            size="medium"
                            prefix-icon="el-icon-user"
                            v-model="loginForm.loginname"
                            placeholder="请输入登录账号"
                            @focus="clearMsg"
                    ></el-input>
                    <div class="el-form-item__error">{{nameErrorMsg}}</div>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                            size="medium"
                            prefix-icon="el-icon-lock"
                            v-model="loginForm.password"
                            show-password
                            placeholder="请输入密码"
                    ></el-input>
                    <div class="el-form-item__error" style="width:150%">{{pwdErrorMsg}}</div>
                </el-form-item>
                <div class="btn">
                    <el-button
                            type="primary"
                            @click="login"
                            :loading="loginLoading"
                    >{{loginText}}</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
    import TokenFactory from "../../utils/tokenfactory";
    export default {
        name: "Login",
        data(){
            return {
                loginForm: {},
                formRulrs: {
                    loginname: [
                        {
                            required: true,
                            message: '请输入登录账号',
                            trigger: "blur"
                        }
                    ],
                    password: [
                        {
                            required: true,
                            message: '请输入登录密码',
                            trigger: "blur"
                        }
                    ]
                },
                nameErrorMsg: "",
                pwdErrorMsg: "",
                loginLoading: false,
                loginText: '登 录'
            }
        },
        methods: {
            login(){
                this.$refs.loginForm.validate(valid => {
                    if(!valid) return
                    this.loginLoading = true
                    this.loginText = '登录中'
                    this.$api.restfulApi.post('login', this.loginForm).then(res => {
                        console.log(res)
                        this.loginLoading = false
                        TokenFactory.setToken(res.token)
                        localStorage.setItem('username', res.user.username)
                        localStorage.setItem('url', res.url)
                        this.$router.push('/picture/index')
                    }).catch(error => {
                        console.log(error);
                        this.loginLoading = false
                        this.pwdErrorMsg = '用户名或密码错误'
                    })
                })
            },
            clearMsg(){
                this.pwdErrorMsg = ''
            }
        }
    }
</script>

<style scoped lang="scss">
    .login{
        display: flex;
        align-items: center;
        justify-content: center;
        /*background: rgba(0, 0, 0, 0.2);*/
        position: relative;
        height: 100vh;
        .web_bg{
            width: 586px;
            height: 550px;
            img{
                width: 586px;
                height: 550px;
            }
        }
        .login-box{
            width: 466px;
            height: 550px;
            background: #fff;
            box-sizing: border-box;
            padding: 20px 40px;
            .title{
                color: #4D9AFF;
                font-size: 16px;
                margin-bottom: 40px;
            }
            h4{
                img{
                    width: 40px;
                    height: 40px;
                    vertical-align: middle;
                }
                text-align: center;
                margin: 70px 0 40px;
                color: #4D9AFF;
                letter-spacing: 3px;
                font-size: 22px;
                font-weight: bold;
            }
            .btn{
                margin-top: 10px;
                .el-button{
                    width: 100%;
                    border-radius: 28px;
                }
            }
        }
    }
    .login::before{
        z-index: -999;
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-image: url("../../assets/images/bg3.png");
        background-size: cover;
    }


</style>
