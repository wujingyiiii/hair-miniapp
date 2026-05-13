const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    memberInfo: null
  },

  onShow() {
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo || {},
      memberInfo: app.globalData.memberInfo || null
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  recharge() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showModal({
      title: '充值',
      content: '充值功能开发中，敬请期待',
      showCancel: false
    })
  },

  goCards() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/appointments/appointments?type=cards' })
  },

  goOrders() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/appointments/appointments?type=orders' })
  },

  goCoupons() {
    wx.showToast({ title: '优惠券功能开发中', icon: 'none' })
  }
})
