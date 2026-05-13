const app = getApp()

Page({
  data: {
    currentType: 'orders',
    orders: [],
    cards: [],
    totalSpent: '0.00'
  },

  onLoad(options) {
    const type = options.type || 'orders'
    this.setData({ currentType: type })
  },

  onShow() {
    this.loadData()
  },

  // loadData() {
  //   // 模拟订单数据
  //   const orders = [
  //     { id: 1, name: '专业修复洗发水', type: '购买产品', amount: '128.00', time: '2026-05-03 14:30', payType: '余额', status: '已完成' },
  //     { id: 2, name: '摩洛哥护发精油', type: '购买产品', amount: '168.00', time: '2026-04-28 11:20', payType: '微信', status: '已完成' },
  //     { id: 3, name: '余额充值', type: '充值', amount: '500.00', time: '2026-04-25 16:00', payType: '微信', status: '已完成' },
  //     { id: 4, name: '洗剪吹', type: '店内消费', amount: '68.00', time: '2026-04-20 10:30', payType: '余额', status: '已完成' }
  //   ]

  //   const cards = [
  //     { id: 1, service: '洗发造型', total: 10, remaining: 6, expire: '2026-12-31', status: '使用中', statusClass: 'active', percent: 40 },
  //     { id: 2, service: '剪发套餐', total: 5, remaining: 2, expire: '2026-10-15', status: '使用中', statusClass: 'active', percent: 60 },
  //     { id: 3, service: '深层护理', total: 3, remaining: 0, expire: '2026-06-01', status: '已用完', statusClass: 'used', percent: 100 }
  //   ]

  //   const total = orders.reduce((sum, o) => sum + parseFloat(o.amount), 0)

  //   this.setData({ orders, cards, totalSpent: total.toFixed(2) })
  // },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ currentType: type })
  }
})
