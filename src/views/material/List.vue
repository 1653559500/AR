<template>
    <div>
        <el-row>
            <el-col :span="24">
                <el-input
                        class="search"
                        size="medium"
                        placeholder="请输入素材名称"
                        clearable
                        @blur="search"
                        v-model="searchKey">
                    <i slot="suffix" @click="search" class="el-input__icon el-icon-search"></i>
                </el-input>
                <div class="right-btn">
                    <el-button type="primary" size="medium" @click="dialogAddVisible = true">添加素材</el-button>
                </div>
            </el-col>

            <!--   table     -->
            <el-row class="table-row" style="margin-top: 60px" v-loading="tableLoading">
                <el-col>
                    <el-table :data="tableData" style="width: 100%">
                        <el-table-column type="index" label="编号"></el-table-column>
                        <el-table-column label="素材名称">
                            <template slot-scope="scope">
                                <span v-if="scope.row.showName != ''">{{scope.row.showName}}</span>
                                <span v-else>--</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="素材类型">
                            <template slot-scope="scope">
                                <span v-if="scope.row.type=='1'">文字</span>
                                <span v-if="scope.row.type=='2'">图片</span>
                                <span v-if="scope.row.type=='3'">音频</span>
                                <span v-if="scope.row.type=='4'">视频</span>
                                <span v-if="scope.row.type=='5'">3D模型</span>
                            </template>
                        </el-table-column>
                        <!--<el-table-column label="素材位置">-->
                            <!--<template slot-scope="scope">-->
                                <!--({{scope.row.positionX}},{{scope.row.positionY}},{{scope.row.positionZ}})-->
                            <!--</template>-->
                        <!--</el-table-column>-->
                        <!--<el-table-column prop="size" label="素材大小"></el-table-column>-->
                        <!--<el-table-column prop="interTime" label="显示时间/次数"></el-table-column>-->
                        <!--<el-table-column label="素材角度">-->
                            <!--<template slot-scope="scope">-->
                                <!--({{scope.row.angleX}},{{scope.row.angleY}},{{scope.row.angleZ}})-->
                            <!--</template>-->
                        <!--</el-table-column>-->
                        <!--<el-table-column label="素材旋转">-->
                            <!--<template slot-scope="scope">-->
                                <!--({{scope.row.rotateD}},{{scope.row.rotate}})-->
                            <!--</template>-->
                        <!--</el-table-column>-->
                        <el-table-column fixed="right" width="150" label="操作">
                            <template slot-scope="scope">
                                <div class="table-icon-group">
                                    <img
                                            src="@/assets/images/icon/preview.png"
                                            @click="preview(scope.row.ID)"
                                            title="预览"
                                    />
                                    <img
                                            src="@/assets/images/icon/delete.png"
                                            @click="handleDelete(scope.row.ID)"
                                            title="删除"
                                    />
                                    <img
                                            src="@/assets/images/icon/edit.png"
                                            @click="openEdit(scope.$index)"
                                            title="编辑"
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
        </el-row>
        <!--   create   -->
        <el-dialog class="dialog-form" title="添加素材" :visible.sync="dialogAddVisible">
            <create @closeCreate="dialogClose" @create="createHandle"></create>
        </el-dialog>

        <!--   编辑    -->
        <el-dialog class="dialog-form" title="编辑素材" :visible.sync="dialogEditVisible">
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
                searchKey: '',
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
                    .list("material", Object.assign(baseParams, params))
                    .then(res => {
                        console.log("material", res);
                        this.tableData = res.data;
                        this.tableLoading = false;
                        this.currentPage = res.meta.page;
                        this.totalNumber = res.meta.total;
                    }).catch(err => {
                    this.tableLoading = false;
                })
            },
            search(){
                this.getList({name: this.searchKey})
            },
            handleDelete(id){
                console.log(id);
                this.$confirm('确定删除？', '提示', {
                    confirmButtonText: '确 定',
                    cancelButtonText: '取 消',
                    type: "warning"
                }).then(() => {
                    this.$api.restfulApi.delete("material", id).then(res => {
                        this.$message.success('删除成功!');
                        this.getList();
                    }).catch(err => {
                        this.tableLoading = false;
                    })
                });
            },
            //预览
            preview(id){
                this.$router.push({path: `/material/preview/${id}`})
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
