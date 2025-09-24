const fs = require('fs');
const path = require('path');

// 确保data目录存在
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    diamonds: 1000,
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// 初始化商品数据
const products = [
  {
    id: 1,
    name: '高级游戏账号',
    description: '包含全套皮肤和道具的高级账号',
    price: 100,
    stock: 10,
    category: '游戏账号',
    image: 'https://via.placeholder.com/200',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '视频会员账号',
    description: '年度VIP会员账号',
    price: 50,
    stock: 20,
    category: '会员账号',
    image: 'https://via.placeholder.com/200',
    createdAt: new Date().toISOString()
  }
];

// 初始化订单数据
const orders = [];

// 写入文件
fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(orders, null, 2));

console.log('数据初始化完成！');
