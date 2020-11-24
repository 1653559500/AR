/**
 *
 * 定制Axios
 * 统一的错误错误
 * 相应数据格式统一处理
 * 统一的token头添加
 *
 */
import axios from 'axios'
import TokenFactory from './tokenfactory';
import { Message } from 'element-ui'

//错误时的提示信息
const errorTip = msg => {
    Message({
        message: msg,
        type: 'error',
        duration: 5 * 1000
    })
}


//请求失败的错误统一处理
const errorHandler=(status,msg)=>{
    console.log(status, msg)
    switch (status){
        case 401:
            //token校验失败后 ，清除token
            // toLogin()
            // console.log(1)
            Message({
                message: '登录超时，请重新登录。3秒后将跳回登录页',
                type: 'error',
                duration: 3 * 1000
            })
            let timer = setTimeout(() => {
                    TokenFactory.clearToken();
                    TokenFactory.clearExpire();
                    localStorage.removeItem('username')
                    localStorage.removeItem('url')
                    window.location.href = '/'
            }, 3000)
            break;
        default:
            errorTip(msg);
    }
}

//----

//设置实例的请求头
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// axios.defaults.headers.common['authorization'] = TokenFactory.getToken();
axios.interceptors.request.use(
    config => {
        if (TokenFactory.getToken()) {
            config.headers.Authorization = TokenFactory.getToken();
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    });



//响应拦截器
axios.interceptors.response.use(res =>{
    //请求成功时
    return res.data;
},error => {
    //请求失败时
    if (error.response){
        console.log(error.response)
        errorHandler(error.response.status,error.response.data.msg);
    }
    return Promise.reject(error);
});
