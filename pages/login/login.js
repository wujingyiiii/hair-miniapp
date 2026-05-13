const app = getApp()

Page({
  data: {
    // 微信授权
    wxLoading: false,

    // 短信验证码（备用）
    showSmsForm: false,
    phone: '',
    isValidPhone: false,
    smsCode: '',
    isCodeValid: false,
    codeSent: false,
    codeSending: false,
    countdown: 0,
    codeBtnText: '获取验证码',
    logining: false,
    canLogin: false
  },

  onLoad() {
    this.checkLoggedIn()
  },

  onShow() {
    this.checkLoggedIn()
  },

  checkLoggedIn() {
    if (app.globalData.isLoggedIn) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  // ================================================
  // 方式一：微信授权手机号（主登录方式）
  // ================================================
  /**
   * 微信 getPhoneNumber 回调
   * 真实场景：将 encryptedData + iv 发到后端解密
   * 后端返回手机号 → 自动登录/注册
   */
  onGetPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 微信返回加密数据 — 生产环境发到后端解密
      const encryptedData = e.detail.encryptedData
      const iv = e.detail.iv

      this.setData({ wxLoading: true })

      // ===== 模拟：模拟器/开发环境兜底 =====
      // 真实小程序：调用后端 API 解密拿手机号
      // 开发阶段：从本地缓存取，没有则用模拟号
      const cached = app.globalData.userInfo || wx.getStorageSync('cached_user')
      const phone = cached ? cached.phone : '138' + String(Math.floor(10000000 + Math.random() * 89999999))

      this.wechatLogin(phone)
    } else {
      // 用户拒绝授权
      wx.showToast({ title: '需要授权才能登录', icon: 'none' })
    }
  },

  /**
   * 微信授权手机号后的登录/注册
   */
  async wechatLogin(phone) {
    try {
      await app.wechatQuickLogin(phone)
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 500)
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      this.setData({ wxLoading: false })
    }
  },

  // ================================================
  // 方式二：短信验证码（备用方式）
  // ================================================

  // 展开/收起短信登录
  toggleSmsForm() {
    this.setData({ showSmsForm: !this.data.showSmsForm })
  },

  // 手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value.replace(/\D/g, '')
    const isValid = /^1[3-9]\d{9}$/.test(phone)
    this.setData({
      phone,
      isValidPhone: isValid,
      codeSent: false,
      smsCode: '',
      isCodeValid: false,
      canLogin: false,
      countdown: 0,
      codeBtnText: '获取验证码'
    })
  },

  // 验证码输入
  onCodeInput(e) {
    const code = e.detail.value.replace(/\D/g, '').slice(0, 6)
    const isValid = code.length === 6
    this.setData({
      smsCode: code,
      isCodeValid: isValid,
      canLogin: this.data.codeSent && isValid
    })
  },

  // 发送验证码
  async onSendCode() {
    if (this.data.codeSending || !this.data.isValidPhone) return

    this.setData({ codeSending: true })

    try {
      await app.sendSmsCode(this.data.phone)
      this.setData({
        codeSent: true,
        codeSending: false,
        codeBtnText: '重新获取',
        countdown: 60
      })
      this.startCountdown()
      this.setData({ canLogin: this.data.isCodeValid })
    } catch (err) {
      this.setData({ codeSending: false })
      wx.showToast({ title: err.message || '发送失败', icon: 'none' })
    }
  },

  startCountdown() {
    const timer = setInterval(() => {
      const count = this.data.countdown - 1
      if (count <= 0) {
        clearInterval(timer)
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown: count })
      }
    }, 1000)
    this._countdownTimer = timer
  },

  // 短信验证码登录
  async onSmsLogin() {
    if (!this.data.canLogin || this.data.logining) return

    this.setData({ logining: true })

    try {
      await app.verifyCodeAndLogin(this.data.phone, this.data.smsCode)
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 500)
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      this.setData({ logining: false })
    }
  },

  onUnload() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer)
    }
  }
})
