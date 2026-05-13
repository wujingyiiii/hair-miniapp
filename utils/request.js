// ========== API 请求封装 ==========
const { BASE_URL } = require('./config')

// 存储 token 的 key
const TOKEN_KEY = 'hair_miniapp_token'
const USER_KEY = 'hair_miniapp_user'

/**
 * 获取本地 token
 */
function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || ''
}

/**
 * 保存 token
 */
function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token)
}

/**
 * 获取本地缓存的用户信息
 */
function getCachedUser() {
  return wx.getStorageSync(USER_KEY) || null
}

/**
 * 保存用户信息
 */
function setCachedUser(user) {
  wx.setStorageSync(USER_KEY, user)
}

/**
 * 清除登录状态
 */
function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)
}

/**
 * 通用 HTTP 请求
 * @param {string} method - GET / POST / PUT / DELETE
 * @param {string} path - API 路径，如 /api/services
 * @param {object} data - 请求体或查询参数
 * @param {boolean} requireAuth - 是否需要登录 token
 */
function request(method, path, data = {}, requireAuth = false) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header = {
      'Content-Type': 'application/json'
    }

    if (requireAuth && token) {
      header['Authorization'] = 'Bearer ' + token
    }

    // GET 请求把 data 拼到 url 上
    let url = BASE_URL + path
    if (method === 'GET' && Object.keys(data).length > 0) {
      const params = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
      url += '?' + params
    }

    wx.request({
      url,
      method,
      header,
      data: method === 'GET' ? undefined : data,
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            // token 过期，清除登录状态
            clearAuth()
            reject(new Error(res.data.message || '登录已过期'))
          } else {
            reject(new Error(res.data.message || '请求失败'))
          }
        } else {
          reject(new Error('网络错误: ' + res.statusCode))
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败: ' + (err.errMsg || '')))
      }
    })
  })
}

// 快捷方法
const api = {
  get: (path, data = {}, requireAuth = false) => request('GET', path, data, requireAuth),
  post: (path, data = {}, requireAuth = false) => request('POST', path, data, requireAuth),
  put: (path, data = {}, requireAuth = false) => request('PUT', path, data, requireAuth),
  del: (path, data = {}, requireAuth = false) => request('DELETE', path, data, requireAuth),

  // 登录
  login: async (code, nickname, avatar) => {
    const data = await request('POST', '/api/auth/login', { code, nickname, avatar })
    setToken(data.token)
    setCachedUser(data.user)
    return data
  },

  // 获取用户信息
  getUserInfo: async () => {
    return await request('GET', '/api/auth/userinfo', {}, true)
  },

  // 获取服务列表
  getServices: () => request('GET', '/api/services'),

  // 获取产品列表
  getProducts: () => request('GET', '/api/products'),

  // 获取产品详情
  getProduct: (id) => request('GET', `/api/products/${id}`),

  // 获取可预约时间段
  getAvailableTimes: (date) =>
    request('GET', '/api/appointments/times', { date }),

  // 创建预约
  createAppointment: (data) =>
    request('POST', '/api/appointments', data, true),

  // 获取我的预约
  getMyAppointments: (status) =>
    request('GET', '/api/appointments', status ? { status } : {}, true),

  // 取消预约
  cancelAppointment: (id) =>
    request('PUT', `/api/appointments/${id}/cancel`, {}, true),

  // 更新用户信息
  updateUserInfo: (data) =>
    request('PUT', '/api/auth/userinfo', data, true),

  getToken,
  setToken,
  getCachedUser,
  setCachedUser,
  clearAuth
}

module.exports = api
