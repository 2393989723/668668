const fs = require('fs');
const path = require('path');

// 数据文件路径
const usersFile = path.join(process.cwd(), 'data', 'users.json');

// 读取用户数据
function readUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 写入用户数据
function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action, username, password, email } = req.body;
  
  try {
    if (req.method === 'POST') {
      const users = readUsers();
      
      if (action === 'register') {
        // 检查用户是否存在
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
          return res.status(400).json({ error: '用户名已存在' });
        }
        
        // 创建新用户
        const newUser = {
          id: users.length + 1,
          username,
          password, // 注意：实际应用中应该加密密码
          email,
          diamonds: 0,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        writeUsers(users);
        
        return res.status(200).json({ 
          message: '注册成功',
          user: { id: newUser.id, username: newUser.username, diamonds: newUser.diamonds }
        });
      }
      
      if (action === 'login') {
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
          return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        return res.status(200).json({ 
          message: '登录成功',
          user: { id: user.id, username: user.username, diamonds: user.diamonds, role: user.role }
        });
      }
    }
    
    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
