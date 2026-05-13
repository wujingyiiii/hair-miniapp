const api = require('./utils/request')

// ===== 模拟注册用户数据库（本地存储）=====
const REGISTERED_USERS_KEY = 'registered_users'

function getRegisteredUsers() {
  return wx.getStorageSync(REGISTERED_USERS_KEY) || {}
}

function saveRegisteredUser(phone) {
  const users = getRegisteredUsers()
  users[phone] = { phone, registeredAt: Date.now(), isNew: false }
  wx.setStorageSync(REGISTERED_USERS_KEY, users)
}

function isUserRegistered(phone) {
  const users = getRegisteredUsers()
  return !!users[phone]
}

App({
  globalData: {
    userInfo: null,
    token: null,
    isLoggedIn: false,
    memberInfo: null,
    products: [],
    cart: []
  },

  async onLaunch() {
    // 从后端 API 加载产品数据
    try {
      const products = await api.getProducts()
      if (products && products.length > 0) {
        this.globalData.products = products
      }
    } catch (e) {
      console.warn('产品API加载失败，使用后备数据', e)
    }

    // 不管 API 是否成功，确保 products 有后备
    // if (!this.globalData.products || this.globalData.products.length === 0) {
    //   this.globalData.products = [
    //     { id: 1, name: '专业修复洗发水', description: '受损发质专用 · 氨基酸配方', price: 128, sales: 236, category: '洗护', image: '/images/background.png' },
    //     { id: 2, name: '氨基酸护发素', description: '温和护理 · 顺滑不油腻', price: 98, sales: 189, category: '洗护', image: '/images/background.png' },
    //     { id: 3, name: '摩洛哥护发精油', description: '深层滋养 · 修复毛躁', price: 168, sales: 312, category: '造型', image: '/images/background.png' },
    //     { id: 4, name: '烫染受损修护发膜', description: '深度修护 · 7天焕发', price: 148, sales: 267, category: '护理', image: '/images/background.png' },
    //     { id: 5, name: '头皮清洁磨砂膏', description: '去屑控油 · 清爽头皮', price: 88, sales: 145, category: '洗护', image: '/images/background.png' },
    //     { id: 6, name: '弹力素卷发定型', description: '卷发必备 · 持久定型', price: 78, sales: 98, category: '造型', image: '/images/background.png' },
    //     { id: 7, name: '防脱育发精华液', description: '固发防脱 · 唤醒毛囊', price: 198, sales: 421, category: '护理', image: '/images/background.png' },
    //     { id: 8, name: '免洗喷雾干发香波', description: '快速去油 · 清新蓬松', price: 68, sales: 178, category: '洗护', image: '/images/background.png' }
    //   ]
    // }

    // 已经登录过的老用户 → 直接进首页（无需再次输入）
    const token = api.getToken()
    const cachedUser = api.getCachedUser()
    if (token && cachedUser) {
      this.globalData.token = token
      this.globalData.userInfo = cachedUser
      this.globalData.isLoggedIn = true
      this.globalData.memberInfo = wx.getStorageSync('memberInfo') || null
    }
  },

  // ========== 方式一：手机号 + 短信验证码 ==========
  /**
   * 发送验证码（模拟）
   */
  sendSmsCode(phone) {
    return new Promise((resolve) => {
      wx.showLoading({ title: '发送中...' })
      setTimeout(() => {
        // 模拟验证码 6 位随机
        const code = String(Math.floor(100000 + Math.random() * 900000))
        // 存到本地，用于验证
        wx.setStorageSync('sms_code_' + phone, code)
        wx.setStorageSync('sms_code_time_' + phone, Date.now())
        wx.hideLoading()

        console.log('📱 [模拟] 验证码 ' + code + ' 已发送到 ' + phone)
        wx.showToast({ title: '验证码已发送', icon: 'success' })

        resolve(code)
      }, 1500)
    })
  },

  /**
   * 校验验证码 + 登录/注册
   */
  verifyCodeAndLogin(phone, code) {
    return new Promise((resolve, reject) => {
      const savedCode = wx.getStorageSync('sms_code_' + phone)
      const sentTime = wx.getStorageSync('sms_code_time_' + phone)

      // 验证码5分钟有效
      if (!savedCode) {
        reject(new Error('请先获取验证码'))
        return
      }
      if (Date.now() - sentTime > 5 * 60 * 1000) {
        wx.removeStorageSync('sms_code_' + phone)
        reject(new Error('验证码已过期，请重新获取'))
        return
      }
      if (savedCode !== code) {
        reject(new Error('验证码错误'))
        return
      }

      // 校验通过 → 判断是新用户还是老用户
      const isNew = !isUserRegistered(phone)
      if (isNew) {
        saveRegisteredUser(phone) // 自动注册
      }

      wx.showLoading({ title: isNew ? '注册中...' : '登录中...' })

      setTimeout(() => {
        const mockToken = 'token_' + phone + '_' + Date.now()
        const mockUser = {
          nickName: isNew ? '新用户' + phone.slice(-4) : '用户' + phone.slice(-4),
          phone: phone,
          avatarUrl: ''
        }

        this.globalData.token = mockToken
        this.globalData.userInfo = mockUser
        this.globalData.isLoggedIn = true
        this.globalData.memberInfo = {
          level: isNew ? '普通会员' : '金卡会员',
          memberNo: 'VIP' + phone.slice(-6) + Date.now().toString().slice(-4),
          points: isNew ? 0 : 1280,
          balance: isNew ? '0.00' : '368.50',
          cards: isNew ? 0 : 3,
          coupons: isNew ? 1 : 2,
          totalSpent: isNew ? '0.00' : '894.00',
          joinDate: isNew ? new Date().toISOString().slice(0, 10) : '2026-01-15'
        }

        api.setToken(mockToken)
        api.setCachedUser(mockUser)
        wx.setStorageSync('memberInfo', this.globalData.memberInfo)
        // 移除验证码
        wx.removeStorageSync('sms_code_' + phone)
        wx.removeStorageSync('sms_code_time_' + phone)
        wx.hideLoading()

        wx.showToast({ title: isNew ? '注册成功 🎉' : '登录成功', icon: 'success' })

        resolve({ user: mockUser, isNew })
      }, 800)
    })
  },

  // ========== 方式二：微信一键授权快捷登录 ==========
  /**
   * 微信一键登录（模拟已授权手机号）
   * 真实场景：使用 <button open-type="getPhoneNumber"> 获取
   */
  wechatQuickLogin(phone) {
    return new Promise((resolve) => {
      wx.showLoading({ title: '微信授权中...' })

      // 如果没传手机号，用本地缓存的老用户手机号
      if (!phone) {
        const cached = api.getCachedUser()
        phone = cached ? cached.phone : '138****8888'
      }

      // 确保注册
      if (!isUserRegistered(phone)) {
        saveRegisteredUser(phone)
      }

      setTimeout(() => {
        const mockToken = 'wx_token_' + phone + '_' + Date.now()
        const mockUser = {
          nickName: '用户' + phone.slice(-4),
          phone: phone,
          avatarUrl: '',
          fromWechat: true
        }

        this.globalData.token = mockToken
        this.globalData.userInfo = mockUser
        this.globalData.isLoggedIn = true
        this.globalData.memberInfo = {
          level: '金卡会员',
          memberNo: 'VIP' + phone.slice(-6) + Date.now().toString().slice(-4),
          points: 1280,
          balance: '368.50',
          cards: 3,
          coupons: 2,
          totalSpent: '894.00',
          joinDate: '2026-01-15'
        }

        api.setToken(mockToken)
        api.setCachedUser(mockUser)
        wx.setStorageSync('memberInfo', this.globalData.memberInfo)
        wx.hideLoading()

        wx.showToast({ title: '微信登录成功', icon: 'success' })
        resolve({ user: mockUser })
      }, 600)
    })
  },

  // ========== 退出登录 ==========
  logout() {
    this.globalData.token = null
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    this.globalData.memberInfo = null

    api.clearAuth()
    wx.removeStorageSync('memberInfo')

    wx.reLaunch({ url: '/pages/login/login' })
  }
})
