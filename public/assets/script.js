// 全局变量
let currentUser = null;
let apiBase = '/api';

// 工具函数
function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// API调用函数
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${apiBase}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '请求失败');
        }
        
        return data;
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 认证相关功能
function initAuth() {
    // 检查是否已登录
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        // 根据当前页面重定向
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (currentUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    } else if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
    
    // 设置标签页切换
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                
                // 更新按钮状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 更新内容区域
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tab).classList.add('active');
            });
        });
    }
    
    // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const result = await apiCall('auth.js', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'login',
                        username,
                        password
                    })
                });
                
                currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                if (currentUser.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
    
    // 注册表单处理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showMessage('密码不匹配', 'error');
                return;
            }
            
            try {
                const result = await apiCall('auth.js', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'register',
                        username,
                        email,
                        password
                    })
                });
                
                showMessage('注册成功，请登录');
                
                // 切换到登录标签
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-tab') === 'login') {
                        btn.classList.add('active');
                    }
                });
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                    if (content.id === 'login') {
                        content.classList.add('active');
                    }
                });
                
                registerForm.reset();
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            currentUser = null;
            window.location.href = 'index.html';
        });
    }
    
    const adminLogoutBtn = document.getElementById('adminLogout');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            currentUser = null;
            window.location.href = 'index.html';
        });
    }
}

// 用户仪表板功能
function initDashboard() {
    if (!currentUser) return;
    
    // 显示用户信息
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('diamondCount').textContent = currentUser.diamonds;
    document.getElementById('userWelcome').textContent = `欢迎, ${currentUser.username}`;
    
    // 显示管理员按钮
    if (currentUser.role === 'admin') {
        document.getElementById('adminBtn').style.display = 'inline-block';
        document.getElementById('adminBtn').addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }
    
    // 导航切换
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            
            // 更新按钮状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新内容区域
            document.querySelectorAll('.section').forEach(sectionEl => {
                sectionEl.classList.remove('active');
            });
            document.getElementById(section).classList.add('active');
            
            // 加载对应内容
            if (section === 'products') {
                loadProducts();
            } else if (section === 'orders') {
                loadUserOrders();
            }
        });
    });
    
    // 加载商品列表
    loadProducts();
    
    // 模态框功能
    initModals();
}

// 商品相关功能
async function loadProducts() {
    try {
        const products = await apiCall('products.js');
        const productsList = document.getElementById('productsList');
        
        if (!productsList) return;
        
        if (products.length === 0) {
            productsList.innerHTML = '<p>暂无商品</p>';
            return;
        }
        
        productsList.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>价格: ${product.price} 钻石</p>
                <p>库存: ${product.stock}</p>
                <button class="btn-primary purchase-btn" data-id="${product.id}">购买</button>
            </div>
        `).join('');
        
        // 添加购买按钮事件
        document.querySelectorAll('.purchase-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                openPurchaseModal(productId, products);
            });
        });
    } catch (error) {
        console.error('加载商品失败:', error);
        showMessage('加载商品失败', 'error');
    }
}

function openPurchaseModal(productId, products) {
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    document.getElementById('purchaseProductId').value = product.id;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = product.price;
    
    document.getElementById('purchaseModal').style.display = 'block';
}

// 订单相关功能
async function loadUserOrders() {
    try {
        const orders = await apiCall('orders.js');
        const userOrders = orders.filter(order => order.userId === currentUser.id);
        const ordersList = document.getElementById('ordersList');
        
        if (!ordersList) return;
        
        if (userOrders.length === 0) {
            ordersList.innerHTML = '<p>暂无订单</p>';
            return;
        }
        
        ordersList.innerHTML = userOrders.map(order => `
            <div class="order-item">
                <h4>${order.productName}</h4>
                <p>价格: ${order.price} 钻石</p>
                <p>联系方式: ${order.contactInfo}</p>
                <p>状态: <span class="status-${order.status}">${getStatusText(order.status)}</span></p>
                <p>下单时间: ${new Date(order.createdAt).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载订单失败:', error);
        showMessage('加载订单失败', 'error');
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 模态框功能
function initModals() {
    // 购买模态框
    const purchaseModal = document.getElementById('purchaseModal');
    const purchaseForm = document.getElementById('purchaseForm');
    
    if (purchaseModal) {
        // 关闭按钮
        purchaseModal.querySelector('.close').addEventListener('click', () => {
            purchaseModal.style.display = 'none';
        });
        
        // 点击背景关闭
        window.addEventListener('click', (e) => {
            if (e.target === purchaseModal) {
                purchaseModal.style.display = 'none';
            }
        });
        
        // 购买表单提交
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const productId = document.getElementById('purchaseProductId').value;
                const contactInfo = document.getElementById('contactInfo').value;
                
                try {
                    const result = await apiCall('orders.js', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'create',
                            userId: currentUser.id,
                            productId,
                            contactInfo
                        })
                    });
                    
                    showMessage(result.message);
                    purchaseModal.style.display = 'none';
                    purchaseForm.reset();
                    
                    // 更新钻石数量
                    currentUser.diamonds = result.remainingDiamonds;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    document.getElementById('diamondCount').textContent = currentUser.diamonds;
                    
                    // 刷新商品列表（库存可能已变化）
                    loadProducts();
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            });
        }
    }
}

// 管理后台功能
function initAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // 显示管理员信息
    document.getElementById('adminUsername').textContent = currentUser.username;
    
    // 返回前台按钮
    const backBtn = document.getElementById('backToDashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    
    // 导航切换
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            
            // 更新按钮状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新内容区域
            document.querySelectorAll('.section').forEach(sectionEl => {
                sectionEl.classList.remove('active');
            });
            document.getElementById(section).classList.add('active');
            
            // 加载对应内容
            if (section === 'dashboard') {
                loadAdminStats();
            } else if (section === 'users') {
                loadUsers();
            } else if (section === 'products') {
                loadAdminProducts();
            } else if (section === 'orders') {
                loadAllOrders();
            }
        });
    });
    
    // 加载初始数据
    loadAdminStats();
    
    // 初始化管理模态框
    initAdminModals();
}

// 管理员统计信息
async function loadAdminStats() {
    try {
        const stats = await apiCall('admin.js', {
            method: 'POST',
            body: JSON.stringify({
                action: 'getStats'
            })
        });
        
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders;
        document.getElementById('completedOrders').textContent = stats.completedOrders;
        
        // 显示最近订单
        const recentOrders = document.getElementById('recentOrders');
        if (recentOrders) {
            if (stats.recentOrders.length === 0) {
                recentOrders.innerHTML = '<p>暂无订单</p>';
            } else {
                recentOrders.innerHTML = stats.recentOrders.map(order => `
                    <div class="order-item">
                        <h4>${order.productName}</h4>
                        <p>用户ID: ${order.userId}</p>
                        <p>价格: ${order.price} 钻石</p>
                        <p>状态: <span class="status-${order.status}">${getStatusText(order.status)}</span></p>
                        <p>下单时间: ${new Date(order.createdAt).toLocaleString()}</p>
                        ${order.status === 'pending' ? 
                            `<button class="btn-primary complete-order" data-id="${order.id}">标记完成</button>` : ''}
                    </div>
                `).join('');
                
                // 添加完成订单按钮事件
                document.querySelectorAll('.complete-order').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const orderId = e.target.getAttribute('data-id');
                        try {
                            await apiCall('orders.js', {
                                method: 'POST',
                                body: JSON.stringify({
                                    action: 'update',
                                    orderId,
                                    status: 'completed'
                                })
                            });
                            
                            showMessage('订单状态更新成功');
                            loadAdminStats();
                        } catch (error) {
                            showMessage(error.message, 'error');
                        }
                    });
                });
            }
        }
    } catch (error) {
        console.error('加载统计信息失败:', error);
        showMessage('加载统计信息失败', 'error');
    }
}

// 用户管理
async function loadUsers() {
    try {
        const users = await apiCall('auth.js?action=getUsers');
        const usersList = document.getElementById('usersList');
        
        if (!usersList) return;
        
        if (users.length === 0) {
            usersList.innerHTML = '<p>暂无用户</p>';
            return;
        }
        
        // 过滤掉管理员自己
        const normalUsers = users.filter(user => user.id !== currentUser.id);
        
        usersList.innerHTML = normalUsers.map(user => `
            <div class="user-item">
                <h4>${user.username} (ID: ${user.id})</h4>
                <p>邮箱: ${user.email}</p>
                <p>钻石: ${user.diamonds}</p>
                <p>注册时间: ${new Date(user.createdAt).toLocaleString()}</p>
                <button class="btn-primary recharge-user-btn" data-id="${user.id}" data-username="${user.username}">充值钻石</button>
            </div>
        `).join('');
        
        // 添加充值按钮事件
        document.querySelectorAll('.recharge-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-id');
                const username = e.target.getAttribute('data-username');
                openRechargeModal(userId, username);
            });
        });
    } catch (error) {
        console.error('加载用户失败:', error);
        showMessage('加载用户失败', 'error');
    }
}

// 商品管理
async function loadAdminProducts() {
    try {
        const products = await apiCall('products.js');
        const productsList = document.getElementById('productsList');
        
        if (!productsList) return;
        
        if (products.length === 0) {
            productsList.innerHTML = '<p>暂无商品</p>';
            return;
        }
        
        productsList.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>价格: ${product.price} 钻石</p>
                <p>库存: ${product.stock}</p>
                <p>分类: ${product.category}</p>
                <div class="admin-product-actions">
                    <button class="btn-primary edit-product-btn" data-id="${product.id}">编辑</button>
                    <button class="btn-secondary delete-product-btn" data-id="${product.id}">删除</button>
                </div>
            </div>
        `).join('');
        
        // 添加编辑和删除按钮事件
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                openProductModal(productId, products, 'edit');
            });
        });
        
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.getAttribute('data-id');
                if (confirm('确定要删除这个商品吗？')) {
                    try {
                        await apiCall('products.js', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'delete',
                                id: productId
                            })
                        });
                        
                        showMessage('商品删除成功');
                        loadAdminProducts();
                    } catch (error) {
                        showMessage(error.message, 'error');
                    }
                }
            });
        });
    } catch (error) {
        console.error('加载商品失败:', error);
        showMessage('加载商品失败', 'error');
    }
}

// 订单管理
async function loadAllOrders() {
    try {
        const orders = await apiCall('orders.js');
        const ordersList = document.getElementById('ordersList');
        
        if (!ordersList) return;
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p>暂无订单</p>';
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <h4>${order.productName}</h4>
                <p>用户ID: ${order.userId}</p>
                <p>价格: ${order.price} 钻石</p>
                <p>联系方式: ${order.contactInfo}</p>
                <p>状态: <span class="status-${order.status}">${getStatusText(order.status)}</span></p>
                <p>下单时间: ${new Date(order.createdAt).toLocaleString()}</p>
                <div class="admin-order-actions">
                    ${order.status === 'pending' ? 
                        `<button class="btn-primary complete-order-btn" data-id="${order.id}">标记完成</button>` : ''}
                    ${order.status !== 'cancelled' ? 
                        `<button class="btn-secondary cancel-order-btn" data-id="${order.id}">取消订单</button>` : ''}
                </div>
            </div>
        `).join('');
        
        // 添加订单操作按钮事件
        document.querySelectorAll('.complete-order-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const orderId = e.target.getAttribute('data-id');
                try {
                    await apiCall('orders.js', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'update',
                            orderId,
                            status: 'completed'
                        })
                    });
                    
                    showMessage('订单状态更新成功');
                    loadAllOrders();
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            });
        });
        
        document.querySelectorAll('.cancel-order-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const orderId = e.target.getAttribute('data-id');
                if (confirm('确定要取消这个订单吗？')) {
                    try {
                        await apiCall('orders.js', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'update',
                                orderId,
                                status: 'cancelled'
                            })
                        });
                        
                        showMessage('订单已取消');
                        loadAllOrders();
                    } catch (error) {
                        showMessage(error.message, 'error');
                    }
                }
            });
        });
    } catch (error) {
        console.error('加载订单失败:', error);
        showMessage('加载订单失败', 'error');
    }
}

// 管理员模态框功能
function initAdminModals() {
    // 充值模态框
    const rechargeModal = document.getElementById('rechargeModal');
    const rechargeForm = document.getElementById('rechargeForm');
    const addDiamondsBtn = document.getElementById('addDiamondsBtn');
    
    if (addDiamondsBtn) {
        addDiamondsBtn.addEventListener('click', () => {
            openRechargeModal();
        });
    }
    
    if (rechargeModal) {
        // 关闭按钮
        rechargeModal.querySelector('.close').addEventListener('click', () => {
            rechargeModal.style.display = 'none';
        });
        
        // 点击背景关闭
        window.addEventListener('click', (e) => {
            if (e.target === rechargeModal) {
                rechargeModal.style.display = 'none';
            }
        });
        
        // 充值表单提交
        if (rechargeForm) {
            rechargeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const userId = document.getElementById('rechargeUserId').value;
                const amount = document.getElementById('rechargeAmount').value;
                
                try {
                    const result = await apiCall('admin.js', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'recharge',
                            userId,
                            diamonds: amount
                        })
                    });
                    
                    showMessage(`为用户 ${result.user.username} 充值 ${amount} 钻石成功`);
                    rechargeModal.style.display = 'none';
                    rechargeForm.reset();
                    
                    // 刷新用户列表
                    loadUsers();
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            });
        }
    }
    
    // 商品模态框
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const addProductBtn = document.getElementById('addProductBtn');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductModal(null, null, 'add');
        });
    }
    
    if (productModal) {
        // 关闭按钮
        productModal.querySelector('.close').addEventListener('click', () => {
            productModal.style.display = 'none';
        });
        
        // 点击背景关闭
        window.addEventListener('click', (e) => {
            if (e.target === productModal) {
                productModal.style.display = 'none';
            }
        });
        
        // 商品表单提交
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const productId = document.getElementById('productId').value;
                const name = document.getElementById('productName').value;
                const description = document.getElementById('productDescription').value;
                const price = document.getElementById('productPrice').value;
                const stock = document.getElementById('productStock').value;
                const category = document.getElementById('productCategory').value;
                const image = document.getElementById('productImage').value;
                
                const action = productId ? 'update' : 'add';
                
                try {
                    await apiCall('products.js', {
                        method: 'POST',
                        body: JSON.stringify({
                            action,
                            id: productId,
                            name,
                            description,
                            price,
                            stock,
                            category,
                            image
                        })
                    });
                    
                    showMessage(`商品${action === 'add' ? '添加' : '更新'}成功`);
                    productModal.style.display = 'none';
                    productForm.reset();
                    
                    // 刷新商品列表
                    loadAdminProducts();
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            });
        }
    }
}

function openRechargeModal(userId = null, username = null) {
    const rechargeModal = document.getElementById('rechargeModal');
    const rechargeUserId = document.getElementById('rechargeUserId');
    
    // 加载用户列表到下拉框
    apiCall('auth.js?action=getUsers').then(users => {
        // 过滤掉管理员自己
        const normalUsers = users.filter(user => user.id !== currentUser.id);
        
        rechargeUserId.innerHTML = normalUsers.map(user => 
            `<option value="${user.id}" ${user.id == userId ? 'selected' : ''}>${user.username} (当前钻石: ${user.diamonds})</option>`
        ).join('');
    }).catch(error => {
        console.error('加载用户列表失败:', error);
    });
    
    rechargeModal.style.display = 'block';
}

function openProductModal(productId = null, products = null, mode = 'add') {
    const productModal = document.getElementById('productModal');
    const productModalTitle = document.getElementById('productModalTitle');
    const productSubmitBtn = document.getElementById('productSubmitBtn');
    
    if (mode === 'add') {
        productModalTitle.textContent = '添加商品';
        productSubmitBtn.textContent = '添加商品';
        
        // 清空表单
        document.getElementById('productId').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('productImage').value = '';
    } else if (mode === 'edit' && productId && products) {
        productModalTitle.textContent = '编辑商品';
        productSubmitBtn.textContent = '更新商品';
        
        const product = products.find(p => p.id == productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productImage').value = product.image;
        }
    }
    
    productModal.style.display = 'block';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    
    // 根据当前页面初始化相应功能
    if (window.location.pathname.endsWith('dashboard.html')) {
        initDashboard();
    } else if (window.location.pathname.endsWith('admin.html')) {
        initAdmin();
    }
});
