const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    memberInfo: null,
    avatarText: '👤',
    hotProducts: [],
    services: []
  },

  onShow() {
    const isLoggedIn = app.globalData.isLoggedIn
    const userInfo = app.globalData.userInfo || {}
    const memberInfo = app.globalData.memberInfo || null

    let avatarText = '👤'
    if (userInfo.nickName) avatarText = userInfo.nickName.charAt(0)
    else if (userInfo.phone) avatarText = userInfo.phone.slice(-2)

    // 从全局取4个热门产品
    const hotProducts = app.globalData.products.slice(0, 4)

    // 店内服务项目（保留，不涉及选发型师）
    const services = [
      { id: 1, name: '洗剪吹', price: 15 +' 起', duration: 40, icon: '✂️' },
      { id: 2, name: '烫发', price: 80 +' 起', duration: 120, icon: '🌀' },
      { id: 3, name: '染发', price: 50 +' 起', duration: 100, icon: '🎨' },
      { id: 4, name: '护理', price: 50 +' 起', duration: 50, icon: '💆' },
      { id: 5, name: '造型', price: 20 +' 起', duration: 30, icon: '💇' }
    ]

    this.setData({ isLoggedIn, userInfo, memberInfo, avatarText, hotProducts, services })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  goProducts() {
    wx.switchTab({ url: '/pages/products/products' })
  },

  goMember() {
    wx.switchTab({ url: '/pages/member/member' })
  },

  goMemberCard() {
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

  goProductDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/products/products?id=${id}` })
  }
})
