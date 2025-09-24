const fs = require('fs');
const path = require('path');

const usersFile = path.join(process.cwd(), 'data', 'users.json');
const ordersFile = path.join(process.cwd(), 'data', 'orders.json');

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

function readOrders() {
  try {
    const data = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'POST') {
      const { action, userId, diamonds, orderId, status } = req.body;
      
      if (action === 'recharge') {
        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === parseInt(userId));
        
        if (userIndex === -1) {
          return res.status(404).json({ error: '用户不存在' });
        }
        
        users[userIndex].diamonds += parseInt(diamonds);
        writeUsers(users);
        
        return res.status(200).json({ 
          message: '充值成功', 
          user: { 
            id: users[userIndex].id, 
            username: users[userIndex].username, 
            diamonds: users[userIndex].diamonds 
          } 
        });
      }
      
      if (action === 'getStats') {
        const users = readUsers();
        const orders = readOrders();
        
        const totalUsers = users.length;
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        
        return res.status(200).json({
          totalUsers,
          totalOrders,
          pendingOrders,
          completedOrders,
          recentOrders: orders.slice(-5).reverse()
        });
      }
    }
    
    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('后台管理错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
