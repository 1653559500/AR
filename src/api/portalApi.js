/**
 * 网站相关Api
 * @type {{initData: portalApi.initData}}
 */
import axios from 'axios'
const portalApi = {

  /* 获取网站初始化数据 */
  initData: function () {
    return axios.get('/api/portal/initdata/')
  }

}

export default portalApi
