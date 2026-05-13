const app = getApp()
const api = require('../../utils/request')

Page({
  data: {
    categories: ['全部', '洗护', '造型', '护理'],
    currentCat: 0,
    allProducts: [],
    filteredProducts: []
  },

  async onLoad() {
    // 先调用后端 API 拿数据
    try {
      console.log('哈哈哈')
      const allProducts = await api.getProducts()
      console.log(这是,'allProducts')
      app.globalData.products = allProducts
      this.setData({ allProducts, filteredProducts: allProducts })
      return
    } catch (e) {
      console.warn('产品API请求失败', e)
      wx.showToast({ title: 'API请求失败: ' + (e.message || '未知错误'), icon: 'none', duration: 3000 })
    }

    // API 失败时降级到 globalData（后备数据）
    // const fallback = app.globalData.products || []
    // this.setData({ allProducts: fallback, filteredProducts: fallback })
  },

  switchCategory(e) {
    const idx = parseInt(e.currentTarget.dataset.index)
    const filtered = idx === 0
      ? this.data.allProducts
      : this.data.allProducts.filter(p => {
          const catMap = { 0: '全部', 1: '洗护', 2: '造型', 3: '护理' }
          return p.category === catMap[idx]
        })
    this.setData({ currentCat: idx, filteredProducts: filtered })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    const product = this.data.allProducts.find(p => p.id === id)
    if (product) {
      wx.showModal({
        title: product.name,
        content: `${product.description || ''}\n\n价格：¥${product.price}\n已售：${product.sales}件`,
        confirmText: '加入购物车',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '已加入购物车', icon: 'success' })
          }
        }
      })
    }
  },

  addCart(e) {
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  }
})
