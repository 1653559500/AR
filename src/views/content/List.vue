<template>
    <div>
        <el-row>
            <el-col :span="24">
                <el-input
                        class="search"
                        size="medium"
                        placeholder="请输入内容名称"
                        clearable
                        @blur="search"
                        v-model="searchKey">
                    <i slot="suffix" @click="search" class="el-input__icon el-icon-search"></i>
                </el-input>
                <div class="right-btn">
                    <el-button type="primary" size="medium" @click="dialogAddVisible = true">添加内容</el-button>
                </div>
            </el-col>

            <!--   table     -->
            <el-row class="table-row" style="margin-top: 60px" v-loading="tableLoading">
                <el-col>
                    <el-table :data="tableData" style="width: 100%">
                        <el-table-column type="index" label="编号"></el-table-column>
                        <el-table-column prop="name" label="内容名称"></el-table-column>
                        <el-table-column prop="Image.name" label="目标图片"></el-table-column>
                        <!--<el-table-column prop="Material.name" label="素材"></el-table-column>-->
                        <el-table-column fixed="right" width="180" label="操作">
                            <template slot-scope="scope">
                                <div class="table-icon-group">
                                    <img
                                            src="@/assets/images/icon/allot.png"
                                            @click="allot(scope.row.ID)"
                                            title="分配"
                                    />
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
                                    <img
                                            src="@/assets/images/icon/detail.png"
                                            @click="openUser(scope.row.ID)"
                                            title="拥有者"
                                    />
                                    <img
                                            src="@/assets/images/icon/download.png"
                                            @click="download(scope.row)"
                                            title="下载"
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
        <el-dialog class="dialog-form" title="添加内容" :visible.sync="dialogAddVisible">
            <create @closeCreate="dialogClose" @create="createHandle"></create>
        </el-dialog>

        <!--   分配   -->
        <el-dialog class="dialog-form" title="分配内容" :visible.sync="dialogAllotVisible">
            <Allot :allotId="allotId" @closeAllot="closeAllot" @allot="allotHandle"></Allot>
        </el-dialog>

        <!--   编辑    -->
        <el-dialog class="dialog-form" title="编辑内容" :visible.sync="dialogEditVisible">
            <Edit :edit-data="editData" @closeEdit="closeEdit" @edit="editConfirm"></Edit>
        </el-dialog>

        <!-- 拥有者 -->
        <el-dialog class="dialog-form" title="拥有者" :visible.sync="dialogUserVisible" @close="dialogUserVisible=false">
            <AssignUser :contentId="contentId" :visible="dialogUserVisible"></AssignUser>
        </el-dialog>
    </div>
</template>

<script>
    import Create from './Create'
    import Allot from './Allot'
    import Edit from './Edit'
    import AssignUser from './AssignUser'
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
                dialogAllotVisible: false,
                dialogEditVisible: false,
                dialogUserVisible: false,
                searchKey: '',
                editData: {},
                allotId: '',
                contentId: '',
            }
        },
        components: {
            Create,
            Allot,
            Edit,
            AssignUser
        },
        created(){
            this.getList()
        },
        methods: {
            getList(params){
                this.tableLoading = true;
                let baseParams = {
                    page: this.currentPage,
                    pageSize: this.pageSize,
                    id: this.$route.params.id
                };

                this.$api.restfulApi
                    .list("content", Object.assign(baseParams, params))
                    .then(res => {
                        console.log("content", res);
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
                    this.$api.restfulApi.delete("content", id).then(res => {
                        this.$message.success('删除成功!');
                        this.getList();
                    }).catch(err => {
                        this.tableLoading = false;
                    })
                });
            },
            //分配
            allot(id){
                this.allotId = id
                this.dialogAllotVisible = true
            },
            //预览
            preview(id){
                this.$router.push({path: `/content/preview/${id}`})
            },
            openUser(id){
                this.contentId = id
                this.dialogUserVisible = true
            },
            //关闭分配
            closeAllot(){
                this.dialogAllotVisible = false
            },
            //分配后
            allotHandle(){
                this.dialogAllotVisible = false
                this.getList()
            },
            download(data){
                //素材
                this.$api.restfulApi.download('content/file',{id: data.ID, type: '2'}).then(res=>{
                    let blob = new Blob([res]); // 将服务端返回的文件流
                    let fileName = data.Material.name; // 保存的文件名
                    this.downLoadFile(blob, fileName);
                }).catch(err => {

                    console.log(err)
                })
                //图片
                this.$api.restfulApi.download('content/file',{id: data.ID, type: '1'}).then(res=>{
                    let blob = new Blob([res]); // 将服务端返回的文件流
                    let fileName = data.Image.name; // 保存的文件名
                    this.downLoadFile(blob, fileName);
                }).catch(err => {
                    console.log(err)
                })

            },
           downLoadFile (blob, fileName) {
                if (window.navigator.msSaveOrOpenBlob) { // IE10
                    navigator.msSaveBlob(blob, fileName);
                } else {
                    let link = document.createElement('a');
                    link.style.display = 'none';

                    link.href = URL.createObjectURL(blob); //创建一个指向该参数对象的URL
                    link.download = fileName;
                    link.click(); // 触发下载
                    URL.revokeObjectURL(link.href); // 释放通过 URL.createObjectURL() 创建的 URL
                }
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
