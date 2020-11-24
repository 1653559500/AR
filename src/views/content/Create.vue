<template>
    <div>
        <el-form
                :model="createForm"
                ref="createForm"
                :rules="formRules"
                label-position="right"
                label-width="125px"
                v-loading="dialogLoading"
        >
            <el-form-item label="内容名称" prop="name">
                <el-input size="medium"
                          v-model="createForm.name"
                          placeholder="请输入内容名称"></el-input>
            </el-form-item>
            <el-form-item label="目标图片" prop="imageID">
                <el-select v-model="createForm.imageID"
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
            <!--<el-form-item label="素材" prop="materialID">-->
                <!--<el-select v-model="createForm.materialID"-->
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
            <el-button class="white-btn" size="medium" @click="dialogClose('createForm')" :disabled="dialogLoading">取 消</el-button>
            <el-button class="blue-btn" size="medium" type="primary" @click="create" :disabled="dialogLoading">确 定</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Create",
        data(){
            return {
                createForm: {},
                formRules: {
                    name: [
                        {required: true, message: '请输入素材名称', trigger: 'blur'}
                    ],
                    imageID: [
                        {required: true, message: '请选择目标图片', trigger: 'change'}
                    ],
                    // materialID: [
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
        methods: {
            //关闭弹窗
            dialogClose(){
                this.createForm = {}
                this.$emit('closeCreate')
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
            // getMaterial(){
            //     if(this.material.length > 0) return
            //     this.materialLoading = true
            //     this.$api.restfulApi.list("material").then(res => {
            //         console.log(res)
            //         this.material = res.data
            //         this.materialLoading = false
            //     }).catch(() => {
            //         this.materialLoading = false
            //     })
            // },
            //创建
            create(){
                this.$refs['createForm'].validate(valid => {
                    if(!valid) return
                    this.dialogLoading = true
                    this.createForm.projectID = this.$route.params.id
                    this.$api.restfulApi.create('content', this.createForm).then(() => {
                        this.dialogLoading = false
                        this.$message.success('添加成功!');
                        this.createForm = {}
                        this.$emit('create')
                    }).catch(() => {
                        this.dialogLoading = false
                    })
                })
            },
        }
    }
</script>

<style scoped>

</style>
