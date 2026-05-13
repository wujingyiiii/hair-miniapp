// ========== API 配置 ==========
// 开发时用你的电脑IP（小程序模拟器用 localhost，真机用电脑局域网IP）
// const BASE_URL = 'http://localhost:3000'
// const BASE_URL = 'http://127.0.0.1:3000'
const BASE_URL = 'http://192.168.1.178:3000'

// 开发模式：无需微信 AppSecret，直接用 code 当用户标识
// 生产时把 WX_SECRET 配在后端环境变量里即可自动切换
const DEV_MODE = true

module.exports = {
  BASE_URL,
  DEV_MODE
}
