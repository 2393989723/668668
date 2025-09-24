// 内存存储
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
let orders = [];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'POST') {
      const { action, userId, diamonds } = req.body;
      
      if (action === 'recharge') {
        const userIndex = users.findIndex(u => u.id === parseInt(userId));
        
        if (userIndex === -1) {
          return res.status(404).json({ error: '用户不存在' });
        }
        
        users[userIndex].diamonds += parseInt(diamonds);
        
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
