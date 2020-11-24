<template>
    <div class="head">
       <div class="left">
           <img src="../../assets/images/icon/ar.png" alt="">
           <span class="title">AR管理平台</span>
       </div>
        <div class="menu">
            <el-menu :default-active="activeIndex"
                     class="el-menu-demo"
                     mode="horizontal"
                     text-color="#fff"
                     active-text-color="#409EFF"
                     background-color="#293C4E"
                     router
                     @select="handleSelect">
                <el-menu-item index="/picture/index">
                    <i class="el-icon-picture" style="color: #fff;"></i>
                    <span slot="title">目标图片管理</span>
                </el-menu-item>

                <el-menu-item index="/material/index">
                    <i class="el-icon-notebook-1" style="color: #fff;"></i>
                    <span slot="title">素材管理</span>
                </el-menu-item>

                <el-menu-item index="/project/index">
                    <i class="el-icon-document" style="color: #fff;"></i>
                    <span slot="title">项目管理</span>
                </el-menu-item>

                <el-menu-item index="/user/index/user">
                    <i class="el-icon-user-solid" style="color: #fff;"></i>
                    <span slot="title">用户管理</span>
                </el-menu-item>
            </el-menu>
            <div class="border_right"></div>
        </div>
        <div class="right">
            <el-dropdown trigger="click" @command="handleCommand">
                <span class="el-dropdown-link" style="margin-right: 12px; color: #fff;">你好，{{username}} <i class="el-icon-arrow-down el-icon--right"></i></span>
                <el-dropdown-menu slot="dropdown">
<!--                    <el-dropdown-item>个人信息</el-dropdown-item>-->
                    <el-dropdown-item command="loginOut">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-avatar style="vertical-align: middle" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
        </div>
    </div>
</template>

<script>
    import TokenFactory from '@/utils/tokenfactory'
    export default {
        name: "Navbar",
        data(){
            return {
                activeIndex: this.$route.path,
                username: localStorage.getItem('username')
            }
        },
        methods: {
            handleSelect(key, keyPath) {
                // console.log(key, keyPath);
            },
            handleCommand(command) {
                console.log(command)
                if(command == 'loginOut'){
                    this.$confirm('确定要退出系统吗?', '提示', {
                        confirmButtonText: '确 定',
                        cancelButtonText: '取 消',
                        type: "warning"
                    }).then(() => {
                        this.$api.restfulApi.post('user/loginout').then(res => {
                            console.log('loginout',res)
                            this.$router.push('/login')
                            TokenFactory.clearToken()
                            localStorage.removeItem('username')
                            localStorage.removeItem('url')
                        });
                    });
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .head{
        height: 62px;
        line-height: 62px;
        padding: 0 40px 0;
        border-bottom: 1px solid #d8dce5;
        box-shadow: 0 1px 3px 0 rgba(0,0,0,.12), 0 0 3px 0 rgba(0,0,0,.04);
        background: #293C4E;
        color: #fff;
        .menu{
            position: absolute;
            right: 260px;
            .el-menu.el-menu--horizontal{
                border-bottom: none;
            }
            .el-menu-item{
                margin-left: 60px;
            }
            .link{
                display: inline-block;
                height: 60px;
            }
            .border_right{
                position: absolute;
                right: -30px;
                top: 15px;
                height: 30px;
                width: 1px;
                background: #C9C3C3;
            }
        }
        .left{
            position: absolute;
            left: 62px;
            font-size: 16px;
            img{
                width: 40px;
                height: 40px;
                vertical-align: middle;
            }
            .title{
                margin-left: 30px;
                color: #fff;
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 3px;
            }
        }
        .right{
            float: right;
        }
    }
</style>
