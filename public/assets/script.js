// 全局变量
let currentUser = null;
let apiBase = '/api';

// 工具函数
function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// API调用函数 - 修复后的版本
async function apiCall(endpoint, options = {}) {
    try {
        // 修复：使用反引号而不是单引号
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
        showMessage('网络错误，请稍后重试', 'error');
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
                        action: 'login', // 修复：小写login
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});ducts.js');
