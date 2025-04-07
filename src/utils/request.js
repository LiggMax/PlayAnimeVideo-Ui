import axios from 'axios';
import { ElMessage } from "element-plus";
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({
  baseURL,
  timeout: 20000 // 设置20秒超时
})
//添加请求拦截器
instance.interceptors.request.use(
  config => {
    return config;
  },
  (err) => {
    //请求失败回调
    ElMessage.error('请求发送失败，请检查网络连接');
    return Promise.reject(err);//异步的状态转化成失败的状态
  }
)

//添加响应拦截器
instance.interceptors.response.use(
  result => {
    //判断业务状态码
    if (result.data.code === 200) {
      //返回数据
      return result.data;
    }
    //提示错误信息
    ElMessage.error(result.data.message || '服务异常');
    //异步操作状态转换为失败
    return Promise.reject(result.data);
  },
  err => {
    // 处理HTTP错误状态
    if (err.response) {
      if (err.response.status === 429) {
        ElMessage.error('请求过于频繁，请稍后再试');
      } else if (err.response.status === 401) {
        ElMessage.error('请先登录');
      } else if (err.response.status === 404) {
        ElMessage.error('请求的资源不存在');
      } else if (err.response.status === 500) {
        ElMessage.error('服务器内部错误');
      } else {
        ElMessage.error(`请求失败(${err.response.status}): ${err.response.data?.message || '未知错误'}`);
      }
    } else if (err.request) {
      // 请求发出但没有收到响应
      ElMessage.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置有误
      ElMessage.error('请求配置错误: ' + err.message);
    }
    return Promise.reject(err);//异步的状态转化成失败的状态
  }
)

export default instance;
