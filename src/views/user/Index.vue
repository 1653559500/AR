<template>
    <div>
        <!-- Tab标签页 -->
        <el-tabs class="tab-style" v-model="tabActiveName" @tab-click="tabClick">
            <el-tab-pane v-for="tab in tabArray" :key="tab.name" :label="tab.label" :name="tab.name"></el-tab-pane>
        </el-tabs>

        <router-view></router-view>
    </div>
</template>

<script>

    import tabMixinJs from "@/utils/tabMixin.js";

    export default {
        mixins:[tabMixinJs],
        data() {
            return {
                tabActiveName: 'userManage',
                tabArray: [
                    {label: '用户管理', name:'userManage', path: '/user/index/user'},
                    {label: '角色管理', name: 'userRole', path:'/user/index/role'}
                ]
            }
        }
    }
</script>

<style lang="sass" rel="stylesheet/sass">

</style>