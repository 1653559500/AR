<template>
    <div>
        <el-row>
            <el-col :span="24">
                <div class="right-btn">
                    <el-button type="primary" size="medium" @click="dialogAddVisible = true">添加用户</el-button>
                </div>
            </el-col>
        </el-row>

        <!--   table     -->
        <el-row class="table-row" v-loading="tableLoading">
            <el-col>
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column type="index" label="编号"></el-table-column>
                    <el-table-column prop="loginname" label="登录账号"></el-table-column>
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
                    <el-table-column fixed="right" width="150" label="操作">
                        <template slot-scope="scope">
                            <div class="table-icon-group">
                                <img
                                        src="@/assets/images/icon/edit.png"
                                        @click="openEdit(scope.$index)"
                                        title="编辑"
                                />
                                <img
                                        src="@/assets/images/icon/delete.png"
                                        @click="deleteUser(scope.row.ID)"
                                        title="删除"
                                />
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <!--     分页   -->
        <!--  分页 -->
        <el-row class="paginate-row">
            <el-col :span="24">
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="[20, 50, 100, 200]"
                        :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="totalNumber"
                ></el-pagination>
            </el-col>
        </el-row>

        <!--   create   -->
        <el-dialog class="dialog-form" title="添加用户" :visible.sync="dialogAddVisible">
            <create @closeCreate="dialogClose" @create="createHandle"></create>
        </el-dialog>

        <!--Edit-->
        <el-dialog class="dialog-form" title="编辑用户" :visible.sync="dialogEditVisible">
            <Edit :edit-data="editData" @closeEdit="editClose" @edit="editHandle"></Edit>
        </el-dialog>

    </div>
</template>

<script>
    import Create from './Create'
    import Edit from './Edit'
    export default {
        name: "List",
        data(){
            return {
                tableData: [],
                currentPage: 1,
                pageSize: 20,
                totalNumber: 0,
                tableLoading: false,
                dialogAddVisible: false,
                dialogEditVisible: false,
                editData: {}
            }
        },
        components: {
            Create,
            Edit
        },
        created(){
            this.getUserList()
        },
        methods: {
            //获取用户列表
            getUserList(params){
                this.tableLoading = true;
                let baseParams = {
                    page: this.currentPage,
                    pageSize: this.pageSize
                };

                this.$api.restfulApi
                    .list("user", Object.assign(baseParams, params))
                    .then(res => {
                        console.log("userList", res);
                        this.tableData = res.data;
                        this.tableLoading = false;
                        this.currentPage = res.meta.page;
                        this.totalNumber = res.meta.total;
                    }).catch(err => {
                    this.tableLoading = false;
                })
            },

            //打开编辑
            openEdit(index){
                this.dialogEditVisible = true
                this.editData = _.clone(this.tableData[index]);
                console.log(this.editData);
            },
            //关闭编辑
            editClose(){
                this.dialogEditVisible = false
            },
            editHandle(){
                this.dialogEditVisible = false
                this.getUserList()
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getUserList();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getUserList();
            },
            //关闭创建弹窗
            dialogClose(){
                this.dialogAddVisible = false
            },
            //创建完成更新
            createHandle(){
                this.dialogAddVisible = false
                this.getUserList()
            },
            //删除用户
            deleteUser(id){
                console.log(id);
                this.$confirm('确定删除？', '提示', {
                    confirmButtonText: '确 定',
                    cancelButtonText: '取 消',
                    type: "warning"
                }).then(() => {
                    this.$api.restfulApi.delete("user", id).then(res => {
                        this.$message.success('删除成功!');
                        this.getUserList();
                    }).catch(err => {
                        this.tableLoading = false;
                    })
                });
            }
        }
    }
</script>

<style scoped>

</style>
