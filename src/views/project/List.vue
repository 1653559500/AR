<template>
    <div>
        <el-row>
            <el-col :span="24">
                <div class="right-btn">
                    <el-button type="primary" size="medium" @click="dialogAddVisible = true">添加项目</el-button>
                </div>
            </el-col>
        </el-row>

        <!--   table     -->
        <el-row class="table-row" v-loading="tableLoading">
            <el-col>
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column type="index" label="编号"></el-table-column>
                    <el-table-column prop="name" label="项目名称"></el-table-column>
                    <el-table-column label="项目描述">
                        <template slot-scope="scope">
                            <span v-if="scope.row.describe ==''">--</span>
                            <span>{{scope.row.describe}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" width="150" label="操作">
                        <template slot-scope="scope">
                            <div class="table-icon-group">
                                <img
                                        src="@/assets/images/icon/add.png"
                                        @click="toContent(scope.row)"
                                        title="添加内容"
                                />
                                <img
                                        src="@/assets/images/icon/edit.png"
                                        @click="openEdit(scope.$index)"
                                        title="编辑"
                                />
                                <img
                                        src="@/assets/images/icon/delete.png"
                                        @click="handleDelete(scope.row.ID)"
                                        title="删除"
                                />
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
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
        <el-dialog class="dialog-form" title="添加项目" :visible.sync="dialogAddVisible">
            <create @closeCreate="dialogClose" @create="createHandle"></create>
        </el-dialog>
        <!--   编辑    -->
        <el-dialog class="dialog-form" title="编辑项目" :visible.sync="dialogEditVisible">
            <Edit :edit-data="editData" @closeEdit="closeEdit" @edit="editConfirm"></Edit>
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
                dialogAddVisible: false,
                tableLoading: false,
                tableData: [],
                currentPage: 1,
                pageSize: 20,
                totalNumber: 0,
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
            getList(params){
                this.tableLoading = true;
                let baseParams = {
                    page: this.currentPage,
                    pageSize: this.pageSize
                };

                this.$api.restfulApi
                    .list("project", Object.assign(baseParams, params))
                    .then(res => {
                        console.log("project", res);
                        this.tableData = res.data;
                        this.tableLoading = false;
                        this.currentPage = res.meta.page;
                        this.totalNumber = res.meta.total;
                    }).catch(err => {
                    this.tableLoading = false;
                })
            },
            handleDelete(id){
                console.log(id);
                this.$confirm('确定删除？', '提示', {
                    confirmButtonText: '确 定',
                    cancelButtonText: '取 消',
                    type: "warning"
                }).then(() => {
                    this.$api.restfulApi.delete("project", id).then(res => {
                        this.$message.success('删除成功!');
                        this.getList();
                    }).catch(err => {
                        this.tableLoading = false;
                    })
                });
            },
            //内容
            toContent(row){
                console.log(row);
                this.$router.push({path: `/content/index/${row.ID}`})
            },
            //打开编辑
            openEdit(index){
                this.dialogEditVisible = true
                this.editData = _.clone(this.tableData[index]);
                console.log(this.editData);
            },
            //关闭编辑
            closeEdit(){
                this.dialogEditVisible = false
            },
            //编辑成功
            editConfirm(){
                this.dialogEditVisible = false;
                this.getList();
            },
            //关闭创建弹窗
            dialogClose(){
                this.dialogAddVisible = false
            },
            //创建完成更新
            createHandle(){
                this.dialogAddVisible = false
                this.getList()
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getList();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getList();
            },
        }
    }
</script>

<style scoped>

</style>
