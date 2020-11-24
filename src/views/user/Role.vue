<template>
    <div>
        <el-row>
            <el-col :span="24">
                <div class="right-btn">
                    <el-button type="primary" size="medium" @click="dialogAddVisible = true">添加角色</el-button>
                </div>
            </el-col>
        </el-row>
        <!--   table     -->
        <el-row class="table-row" v-loading="tableLoading">
            <el-col>
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column type="index" label="编号"></el-table-column>
                    <el-table-column prop="name" label="角色名称"></el-table-column>
                    <el-table-column prop="describe" label="描述"></el-table-column>

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
                                        @click="deleteRole(scope.row.ID)"
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
        <el-dialog class="dialog-form" title="添加角色" :visible.sync="dialogAddVisible">
            <create @closeCreate="dialogClose" @create="createHandle"></create>
        </el-dialog>

        <!--Edit-->
        <el-dialog class="dialog-form" title="编辑角色" :visible.sync="dialogEditVisible">
            <Edit :edit-data="editData" @closeEdit="editClose" @edit="editHandle"></Edit>
        </el-dialog>
    </div>
</template>

<script>
    import Create from './CreateRole'
    import Edit from './EditRole'
    export default {
        name: "Role",
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
            this.getList()
        },
        methods: {
            //获取角色列表
            getList(params){
                this.tableLoading = true;
                let baseParams = {
                    page: this.currentPage,
                    pageSize: this.pageSize
                };

                this.$api.restfulApi
                    .list("role", Object.assign(baseParams, params))
                    .then(res => {
                        console.log("roleList", res);
                        this.tableData = res.data;
                        this.tableLoading = false;
                        this.currentPage = res.meta.page;
                        this.totalNumber = res.meta.total;
                    }).catch(err => {
                    this.tableLoading = false;
                })
            },
            //删除角色
            deleteRole(id){
                console.log(id);
                this.$confirm('确定删除？', '提示', {
                    confirmButtonText: '确 定',
                    cancelButtonText: '取 消',
                    type: "warning"
                }).then(() => {
                    this.$api.restfulApi.delete("role", id).then(res => {
                        this.$message.success('删除成功!');
                        this.getList();
                    }).catch(err => {
                        this.tableLoading = false;
                    })
                });
            },

            //打开编辑
            openEdit(index){
                this.dialogEditVisible = true
                this.editData = _.clone(this.tableData[index]);
                console.log(this.editData);
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
            //关闭编辑
            editClose(){
                this.dialogEditVisible = false
            },
            editHandle(){
                this.dialogEditVisible = false
                this.getList()
            },
            //创建完成更新
            createHandle(){
                this.dialogAddVisible = false
                this.getList()
            }
        }
    }
</script>

<style scoped>

</style>