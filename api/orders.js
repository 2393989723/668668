const fs = require('fs');
const path = require('path');

const ordersFile = path.join(process.cwd(), 'data', 'orders.json');
const usersFile = path.join(process.cwd(), 'data', 'users.json');
const productsFile = path.join(process.cwd(), 'data', 'products.json');

function readOrders() {
  try {
    const data = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

function readUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function readProducts() {
  try {
    const data = fs.readFileSync(productsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      const orders = readOrders();
      return res.status(200).json(orders);
    }
    
    if (req.method === 'POST') {
      const { action, userId, productId, contactInfo } = req.body;
      
      if (action === 'create') {
        const users = readUsers();
        const products = readProducts();
        const orders = readOrders();
        
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
        writeOrders(orders);
        
        // 减少用户钻石
        user.diamonds -= product.price;
        writeUsers(users);
        
        // 减少商品库存
        product.stock -= 1;
        writeProducts(products);
        
        return res.status(200).json({ 
          message: '订单创建成功，请联系客服完成交易', 
          order: newOrder,
          remainingDiamonds: user.diamonds
        });
      }
      
      if (action === 'update') {
        const { orderId, status } = req.body;
        const orders = readOrders();
        
        const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
        if (orderIndex === -1) {
          return res.status(404).json({ error: '订单不存在' });
        }
        
        orders[orderIndex].status = status;
        writeOrders(orders);
        
        return res.status(200).json({ message: '订单状态更新成功', order: orders[orderIndex] });
      }
    }
    
    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('订单管理错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
