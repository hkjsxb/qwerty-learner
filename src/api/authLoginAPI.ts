import base from '@/api/base'
import services from '@/config/axios'

// 定义参数类型
type paramsType = {
  code: string // 授权回调码
  platform: string // 平台名称
  state: string // 授权链接状态码
}

/**
 * 登录相关API
 */
const authLoginAPI = {
  // 用户名、密码登录
  login(params: { userName: string; password: string }) {
    return services.post(`${base.lkChatBaseURL}/user/login`, params)
  },
  // token续期
  tokenRenew(params: { token: string; userId: string }) {
    return services.post(`${base.lkChatBaseURL}/user/tokenRenew`, params)
  },
  // 更新在线状态
  updateOnlineStatus(params: { userId: string; status: boolean }) {
    return services.post(`${base.lkChatBaseURL}/user/updateOnlineStatus`, params)
  },
  // 获取授权url地址
  getAuthorize(params: { platform: string }) {
    return services.get(`${base.lkChatBaseURL}/user/getAuthorize`, {
      params: params,
    })
  },
  // 授权登录
  authorizeLogin(params: paramsType) {
    return services.post(`${base.lkChatBaseURL}/user/authorizeLogin`, params)
  },
}

export default authLoginAPI
