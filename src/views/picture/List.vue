<template>
    <div>
        <el-row>
            <el-col :span="24">
                <div class="right-btn">
                    <el-button type="primary" size="medium" @click="dialogAddVisible = true">添加目标图片</el-button>
                </div>
            </el-col>
        </el-row>

        <!--   table     -->
        <el-row class="table-row" v-loading="tableLoading">
            <el-col>
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column type="index" label="编号"></el-table-column>
                    <el-table-column prop="showName" label="图片名称"></el-table-column>
                    <el-table-column prop="format" label="图片格式"></el-table-column>
                    <el-table-column fixed="right" width="150" label="操作">
                        <template slot-scope="scope">
                            <div class="table-icon-group">
                                <img
                                        src="@/assets/images/icon/see.png"
                                        @click="preview(scope.row)"
                                        title="预览"
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
        <el-dialog class="dialog-form" title="添加目标图片" :visible.sync="dialogAddVisible">
            <create @closeCreate="dialogClose" @create="createHandle"></create>
        </el-dialog>
        <!--    图片预览    -->
        <el-dialog class="dialog-form" title="图片预览" :visible.sync="previewVisible">
<!--            <img :src="imgSrc" alt="">-->
            <el-image :src="imgSrc" fit="contain">
                <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                </div>
            </el-image>
        </el-dialog>
    </div>
</template>

<script>
    import Create from './Create'
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
                previewVisible: false,
                imgSrc: ''
            }
        },
        components: {
            Create
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
                    .list("image", Object.assign(baseParams, params))
                    .then(res => {
                        console.log("image", res);
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
                    this.$api.restfulApi.delete("image", id).then(res => {
                        this.$message.success('删除成功!');
                        this.getList();
                    }).catch(err => {
                        this.tableLoading = false;
                    })
                });
            },
            //预览
            preview(row){
                console.log(row);
                this.imgSrc = row.path
                this.previewVisible = true
                // window.open(row.path)
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
