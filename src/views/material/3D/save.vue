<template>
<div>
    <el-button type="text" @click="edit"> 保存</el-button>
    <el-button type="text" @click="reback">返回</el-button>

</div>
    
</template>

<script>
export default {
    props: ["editData"],
    name: "Edit",
    data() {
        return {
            editForm: {},
        };
    },
    created() {},
    watch: {
        // editData() {
        //     this.initData();
        // },
    },
    methods: {
        initData() {
            this.editForm.ID = this.editData.id;
            this.editForm.positionX = this.editData.position.x;
            this.editForm.positionY = this.editData.position.y;
            this.editForm.positionZ = this.editData.position.z;
            this.editForm.angleX = this.editData.angle.x;
            this.editForm.angleY = this.editData.angle.y;
            this.editForm.angleZ = this.editData.angle.z;
            this.editForm.size = this.editData.scale;
            this.editForm.rotateD = this.editData.direction;
            this.editForm.rotate = this.editData.rotation;
            this.editForm.interTime = this.editData.showTime;
        },
        reback(){
            window.history.go(-1)
        },
        //edit
        edit() {
            this.initData();
            console.log("---editForm---", this.editForm);
            this.$api.restfulApi
                .edit("material", this.editForm.ID, this.editForm)
                .then((res) => {
                    this.$message.success("编辑成功!");
                    this.dialogLoading = false;
                    this.$emit("edit");
                })
                .catch((err) => {
                    this.dialogLoading = false;
                });
        },
    },
};
</script>

<style scoped lang="scss">
</style>
