// 内存存储
let orders = [];
let users = [
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
let products = [
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      return res.status(200).json(orders);
    }
    
    if (req.method === 'POST') {
      const { action, userId, productId, contactInfo, orderId, status } = req.body;
      
      if (action === 'create') {
        const user = users.find(u => u.id === parseInt(userId));
        const product = products.find(p => p.id === parseInt(productId));
        
        if (!user) {
          return res.status(404).json({ error: '用户不存在' });
        }
        
        if (!product) {
          return res.status(404).json({ error: '商品不存在' });
        }
        
        if (user.diamonds < product.price) {
          return res.status(400).json({ error: '钻石不足' });
        }
        
        if (product.stock <= 0) {
          return res.status(400).json({ error: '商品库存不足' });
        }
        
        // 创建订单
        const newOrder = {
          id: orders.length + 1,
          userId: user.id,
          productId: product.id,
          productName: product.name,
          price: product.price,
          contactInfo,
          status: 'pending', // pending, completed, cancelled
          createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        
        // 减少用户钻石
        user.diamonds -= product.price;
        
        // 减少商品库存
        product.stock -= 1;
        
        return res.status(200).json({ 
          message: '订单创建成功，请联系客服完成交易', 
          order: newOrder,
          remainingDiamonds: user.diamonds
        });
      }
      
      if (action === 'update') {
        const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
        if (orderIndex === -1) {
          return res.status(404).json({ error: '订单不存在' });
        }
        
        orders[orderIndex].status = status;
        
        return res.status(200).json({ message: '订单状态更新成功', order: orders[orderIndex] });
      }
    }
    
    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('订单管理错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};,
        
