<template>
    <div class="app-wrapper">
        <Navbar></Navbar>
        <div class="main-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    import Navbar from './Navbar'
    export default {
        name: "Layout",
        data(){
            return{

            }
        },
        components: {
            Navbar
        }
    }
</script>

<style scoped lang="scss">
    .app-wrapper{
        position: relative;
        .main-content{
            margin:  20px;
            padding: 30px;
            background: #fff;
        }
    }
</style>
