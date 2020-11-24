<template>
    <div>
        <el-form
                :model="editForm"
                ref="editForm"
                :rules="formRules"
                label-position="right"
                label-width="125px"
                v-loading="dialogLoading"
        >
            <el-form-item label="内容名称" prop="name">
                <el-input size="medium"
                          v-model="editForm.name"
                          placeholder="请输入内容名称"></el-input>
            </el-form-item>
            <el-form-item label="目标图片" prop="ImageID">
                <el-select v-model="editForm.ImageID"
                           placeholder="请选择目标图片"
                           :loading="imagesLoading"
                           @visible-change="getImages">
                    <el-option
                            v-for="item in imagesOptions"
                            :key="item.ID"
                            :label="item.name"
                            :value="item.ID">
                    </el-option>
                </el-select>
            </el-form-item>
            <!--<el-form-item label="素材" prop="MaterialID">-->
                <!--<el-select v-model="editForm.MaterialID"-->
                           <!--:loading="materialLoading"-->
                           <!--@visible-change="getMaterial"-->
                           <!--placeholder="请选择素材">-->
                    <!--<el-option-->
                            <!--v-for="item in material"-->
                            <!--:key="item.ID"-->
                            <!--:label="item.name"-->
                            <!--:value="item.ID">-->
                    <!--</el-option>-->
                <!--</el-select>-->
            <!--</el-form-item>-->
        </el-form>
        <el-divider></el-divider>
        <div slot="footer" class="dialog-footer dialog-btn-group" style="text-align: right;">
            <el-button class="white-btn" size="medium" @click="closeEdit('editForm')" :disabled="dialogLoading">取 消</el-button>
            <el-button class="blue-btn" size="medium" type="primary" @click="edit" :disabled="dialogLoading">确 定</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['editData'],
        name: "Edit",
        data(){
            return {
                editForm: {},
                formRules: {
                    name: [
                        {required: true, message: '请输入素材名称', trigger: 'blur'}
                    ],
                    ImageID: [
                        {required: true, message: '请选择目标图片', trigger: 'change'}
                    ],
                    // MaterialID: [
                    //     {required: true, message: '请选择素材', trigger: 'change'}
                    // ]
                },
                dialogLoading: false,
                imagesOptions: [],
                imagesLoading: false,
                material: [],
                materialLoading: false
            }
        },
        created(){
            this.initEdit()
            this.getImages()
            this.getMaterial()
        },
        watch: {
            editData: function (newValue) {
                this.editData = newValue
                this.initEdit()
            }
        },
        methods: {
            //初始化编辑数据
            initEdit(){
                console.log(this.editData)
                this.editForm.name = this.editData.name
                this.editForm.ImageID = this.editData.imageId
            },

            //edit
            edit(){
                console.log('---editForm---',this.editForm)
                this.$refs.editForm.validate(valid => {
                    if (!valid) return;
                    this.dialogLoading = true;
                    this.$api.restfulApi
                        .edit("content", this.editForm.ID, this.editForm)
                        .then(res => {
                            this.$message.success('编辑成功!');
                            this.dialogLoading = false;
                            this.$emit("edit");
                        }).catch(err => {
                        this.dialogLoading = false;
                    })
                });
            },
            //获取目标图片
            getImages(){
                if(this.imagesOptions.length > 0) return
                this.imagesLoading = true
                this.$api.restfulApi.list("image").then(res => {
                    console.log(res)
                    this.imagesOptions = res.data
                    this.imagesLoading = false
                }).catch(() => {
                    this.imagesLoading = false
                })

            },
            //获取素材
            getMaterial(){
                if(this.material.length > 0) return
                this.materialLoading = true
                this.$api.restfulApi.list("material").then(res => {
                    console.log(res)
                    this.material = res.data
                    this.materialLoading = false
                }).catch(() => {
                    this.materialLoading = false
                })
            },
            //关闭弹窗
            closeEdit(formName){
                this.editForm = {}
                this.$emit('closeEdit')
            }
        }
    }
</script>

<style scoped>

</style>
