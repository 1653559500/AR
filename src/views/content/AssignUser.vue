<template>
    <el-table :data="users" style="width: 100%" v-loading="userLoading">
      <el-table-column type="index" label="编号"></el-table-column>
      <!-- <el-table-column prop="loginname" label="登录账号"></el-table-column> -->
      <el-table-column prop="username" label="用户姓名"></el-table-column>
      <el-table-column label="用户类型">
          <template slot-scope="scope">
              <span v-if="scope.row.type == '0'">管理员</span>
              <span v-else>终端用户</span>
          </template>
      </el-table-column>
      <el-table-column label="终端设备">
          <template slot-scope="scope">
              <span v-if="scope.row.equip == '1'">android</span>
              <span v-if="scope.row.equip == '2'">ios</span>
              <span v-if="scope.row.equip == ''">--</span>
          </template>
      </el-table-column>
  </el-table>
</template>

<script>
    export default {
        name: "Create",
        props: ['contentId','visible'],

        data(){
            return {
                userLoading: true,
                users: []
            }
        },
        created(){
            this.getUser()
        },
        watch: {
          visible:function(val){
            this.getUser()
          }
        },
        methods: {
            getUser(){
                console.log(this.contentId)
                this.$api.restfulApi.list("content/assignUser",{id: this.contentId}).then(res => {
                    console.log(res)
                    this.users = res
                    this.userLoading = false
                }).catch(() => {
                    this.userLoading = false
                })
            },
        }
    }
</script>

<style scoped>

</style>
