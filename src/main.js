import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import router from './router'

import './assets/css/app.scss'

//lodash
window._ = require('lodash');

//api
import apis from '@/api/index'
Vue.prototype.$api = apis

//axios 全局配置
require('@/utils/customaxios.js')

Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
