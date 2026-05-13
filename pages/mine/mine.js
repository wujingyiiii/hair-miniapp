const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    memberInfo: null,
    avatarText: '👤'
  },

  onShow() {
    const isLoggedIn = app.globalData.isLoggedIn
    const userInfo = app.globalData.userInfo || {}
    const memberInfo = app.globalData.memberInfo || null

    let avatarText = '👤'
    if (userInfo.nickName) avatarText = userInfo.nickName.charAt(0)
    else if (userInfo.phone) avatarText = userInfo.phone.slice(-2)

    this.setData({ isLoggedIn, userInfo, memberInfo, avatarText })
  },

  // 未登录 → 跳登录页
  doLogin() {
    if (this.data.isLoggedIn) {
      wx.showToast({ title: '已登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/login/login' })
  },

  goMember() {
    wx.switchTab({ url: '/pages/member/member' })
  },

  goOrders() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/appointments/appointments?type=orders' })
  },

  goCards() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/appointments/appointments?type=cards' })
  },

  goCoupons() {
    wx.showToast({ title: '优惠券功能开发中', icon: 'none' })
  },

  onFeedback() {
    wx.showToast({ title: '意见反馈开发中', icon: 'none' })
  },

  onSettings() {
    wx.showToast({ title: '设置开发中', icon: 'none' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
        }
      }
    })
  }
})
