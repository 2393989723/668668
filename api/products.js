// 内存存储
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
      return res.status(200).json(products);
    }
    
    if (req.method === 'POST') {
      const { action, name, description, price, stock, category, image, id } = req.body;
      
      if (action === 'add') {
        const newProduct = {
          id: products.length + 1,
          name,
          description,
          price: parseInt(price),
          stock: parseInt(stock),
          category,
          image: image || 'https://via.placeholder.com/200',
          createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        
        return res.status(200).json({ message: '商品添加成功', product: newProduct });
      }
      
      if (action === 'update') {
        const { id: productId, ...updates } = req.body;
        const productIndex = products.findIndex(p => p.id === parseInt(productId));
        
        if (productIndex === -1) {
          return res.status(404).json({ error: '商品不存在' });
        }
        
        products[productIndex] = { ...products[productIndex], ...updates };
        
        return res.status(200).json({ message: '商品更新成功', product: products[productIndex] });
      }
      
      if (action === 'delete') {
        const { id } = req.body;
        products = products.filter(p => p.id !== parseInt(id));
        
        return res.status(200).json({ message: '商品删除成功' });
      }
    }
    
    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('商品管理错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
