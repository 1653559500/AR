import axios from 'axios'
const restfulApi = {

  /**
   * 获取数据列表
   * @param uri 必填
   * @param params
   * @returns {*}
   */
  list(uri, params = {}) {
    return axios.get('/api/' + uri + '/', {
      params: params
    })
  },

  /**
   * 获取单条数据
   * @param uri 必填
   * @param id  必填
   * @returns {*}
   */
  item(uri, id) {
    return axios.get('/api/' + uri + '/' + id)
  },

  /**
   * 创建
   * @param uri 必填
   * @param params 必填
   * @returns {*}
   */
  create(uri, params) {
    return axios.post('/api/' + uri + '/', params)
  },
  /**
   *
   * @param uri 必填
   * @param params 必填
   * @return {*}
   */
  post(uri, params) {
    return axios.post('/api/' + uri + '/', params)
  },
  /**
   * 编辑
   * @param uri  必填
   * @param id  必填
   * @param params  必填
   * @returns {IDBRequest | Promise<void>}
   */
  edit(uri, id, params) {
    return axios.put('/api/' + uri + '/' + id, params)
  },

  /**
   * 删除
   * @param uri  必填
   * @param id   必填
   * @returns {*}
   */
  delete(uri, id) {
    return axios.delete('/api/' + uri + '/' + id)
  },
  //文件下载
  // download(uri, id, params){
  //   return axios.get('/api/' + uri + '/' + id, params)
  // }

  download(uri,params={}){
    return axios.get('/api/' + uri + '/', {
      params: params,
      responseType:'arraybuffer' 
    })
  }

}

export default restfulApi
