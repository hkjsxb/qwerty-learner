/**
 * 对axios稍作封装
 * 1. 设置请求超时时间
 * 2. 添加请求拦截器，在每个请求的头部添加token
 * 3. 添加响应拦截器，根据服务器返回状态进行相应的结果返回
 */
import type { AxiosResponse } from 'axios'
import axiosObj from 'axios'

const defaultConfig = {
  // baseURL在此处省略配置,考虑到项目可能由多人协作完成开发，域名也各不相同，此处通过对api的抽离，域名单独配置在base.js中
  // 请求超时时间
  timeout: 60 * 1000,
  headers: {
    get: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    post: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  },
}

// 创建实例
const _axios = axiosObj.create(defaultConfig)
// 请求拦截器
_axios.interceptors.request.use(
  function (config) {
    // 从本地存处理获取token
    const token = window.localStorage.getItem('token')
    // 如果token存在就在请求头里添加
    token && (config.headers.token = token)
    return config
  },
  function (error) {
    // Do something with request error
    error.data = {}
    error.data.msg = '服务器异常'
    return Promise.reject(error)
  },
)
// 响应拦截器
_axios.interceptors.response.use(
  function (response: AxiosResponse) {
    // token过期，续期token
    // if (response.data?.code === 401) {
    // }
    if (response.status === 200) {
      // 处理接口中的data
      if (response.data?.data) {
        try {
          const dataObj = JSON.parse(response.data.data)
          if (typeof dataObj == 'object' && dataObj) {
            // 为json字符串将其转为json对象
            response.data.data = dataObj
          }
        } catch (e) {
          // 不是json字符串就不处理
          return response.data
        }
      }
      return response.data
    }
    response.data.code = -1
    response.data.msg = '服务器错误'
    return response
  },
  function (error) {
    if (error) {
      // 请求已发出，但不在2xx范围内
      return Promise.reject(error)
    } else {
      // 断网
      return Promise.reject(error)
    }
  },
)

export default _axios
