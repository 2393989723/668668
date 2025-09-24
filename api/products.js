const fs = require('fs');
const path = require('path');

const productsFile = path.join(process.cwd(), 'data', 'products.json');

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
      const products = readProducts();
      return res.status(200).json(products);
    }
    
    if (req.method === 'POST') {
      const { action, name, description, price, stock, category, image } = req.body;
      const products = readProducts();
      
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
        writeProducts(products);
        
        return res.status(200).json({ message: '商品添加成功', product: newProduct });
      }
      
      if (action === 'update') {
        const { id, ...updates } = req.body;
        const productIndex = products.findIndex(p => p.id === parseInt(id));
        
        if (productIndex === -1) {
          return res.status(404).json({ error: '商品不存在' });
        }
        
        products[productIndex] = { ...products[productIndex], ...updates };
        writeProducts(products);
        
        return res.status(200).json({ message: '商品更新成功', product: products[productIndex] });
      }
      
      if (action === 'delete') {
        const { id } = req.body;
        const filteredProducts = products.filter(p => p.id !== parseInt(id));
        writeProducts(filteredProducts);
        
        return res.status(200).json({ message: '商品删除成功' });
      }
    }
    
    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('商品管理错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
