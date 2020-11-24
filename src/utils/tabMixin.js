/* tab标签页的mixin */

const tabMixin = {
    created() {
        this.setTabActive();
    },
    methods:{

        tabClick(tab){

            //设置面包屑
            // this.crumbArray[this.crumbArray.length-1].name = tab.label;

            //切换页面
            this.tabArray.forEach((item) => {
                if(this.tabActiveName == item.name){
                    this.$router.push({path: item.path})
                }
            })
        },

        //设置tab选中,设置刷新后的面包屑
        setTabActive(){
            this.tabArray.forEach((item) => {
                if(this.$route.path == item.path){
                    this.tabActiveName = item.name;
                    // this.crumbArray[this.crumbArray.length-1].name = item.label;
                }
            })
        }
    }
};

export default tabMixin;