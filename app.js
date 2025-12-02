// ============================================
// QuickBite - Local Food Ordering System
// All data is stored in localStorage
// ============================================

// ============================================
// DATA STORAGE & INITIALIZATION
// ============================================

const STORAGE_KEYS = {
    USERS: 'quickbite_users',
    MENU: 'quickbite_menu',
    CART: 'quickbite_cart',
    ORDERS: 'quickbite_orders',
    CURRENT_USER: 'quickbite_current_user'
};

// Default menu items
const DEFAULT_MENU = [
    { id: 1, name: 'Burger', description: 'Juicy beef burger with cheese', price: 120.99, category: 'Main Course', imageUrl: '' },
    { id: 2, name: 'Fries', description: 'Crispy golden fries', price: 80.25, category: 'Sides', imageUrl: '' },
    { id: 3, name: 'Coke', description: 'Refreshing cola drink', price: 45.00, category: 'Beverages', imageUrl: '' },
    { id: 4, name: 'Pizza Slice', description: 'Cheesy pepperoni pizza', price: 350.00, category: 'Main Course', imageUrl: '' },
];

// Default users
const DEFAULT_USERS = [
    { id: 1, username: 'admin', email: 'admin@quickbite.com', password: 'admin123', role: 'admin' },
    { id: 2, username: 'customer', email: 'customer@quickbite.com', password: 'customer123', role: 'customer' }
];

// Initialize localStorage with default data if empty
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
}

// Helper functions for localStorage
function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ============================================
// AUTHENTICATION
// ============================================

let currentUser = null;

function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
        showDashboard();
    } else {
        alert('Invalid username or password');
    }
}

function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    if (!username || !email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        email,
        password,
        role
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    alert('Registration successful! Please login.');
    showLoginForm();
    
    // Clear form
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-role').value = '';
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    // Clear cart on logout
    saveToStorage(STORAGE_KEYS.CART, []);
    
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('customer-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    
    // Clear login form
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

function showDashboard() {
    document.getElementById('auth-screen').classList.add('hidden');
    
    if (currentUser.role === 'admin') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('customer-dashboard').classList.add('hidden');
        showAdminView('admin-orders');
    } else {
        document.getElementById('customer-dashboard').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        showCustomerView('menu');
    }
}

function checkExistingSession() {
    const savedUser = getFromStorage(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
    }
}

// ============================================
// CUSTOMER VIEWS
// ============================================

let currentCategory = 'All Items';

function showCustomerView(view) {
    // Hide all sections
    document.getElementById('menu-section').classList.add('hidden');
    document.getElementById('cart-section').classList.add('hidden');
    document.getElementById('orders-section').classList.add('hidden');
    
    // Update nav links
    document.querySelectorAll('.customer-nav-link').forEach(link => {
        link.classList.remove('bg-blue-600', 'text-white');
        link.classList.add('hover:bg-gray-100', 'text-gray-800');
    });
    
    const activeLink = document.querySelector(`[data-view="${view}"]`);
    if (activeLink) {
        activeLink.classList.add('bg-blue-600', 'text-white');
        activeLink.classList.remove('hover:bg-gray-100', 'text-gray-800');
    }
    
    // Show selected section and update header
    const titles = {
        'menu': { title: "Today's Menu", subtitle: 'Fresh food prepared daily for our customers.' },
        'cart': { title: 'Your Cart', subtitle: 'Review and finalize your items before checkout.' },
        'orders': { title: 'My Orders', subtitle: 'View your past and pending orders.' }
    };
    
    document.getElementById('customer-title').textContent = titles[view].title;
    document.getElementById('customer-subtitle').textContent = titles[view].subtitle;
    
    if (view === 'menu') {
        document.getElementById('menu-section').classList.remove('hidden');
        renderMenu();
    } else if (view === 'cart') {
        document.getElementById('cart-section').classList.remove('hidden');
        renderCart();
    } else if (view === 'orders') {
        document.getElementById('orders-section').classList.remove('hidden');
        renderCustomerOrders();
    }
}

function renderMenu() {
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const categories = ['All Items', ...new Set(menu.map(item => item.category))];
    
    // Render category filters
    const filtersContainer = document.getElementById('category-filters');
    filtersContainer.innerHTML = '';
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category;
        btn.onclick = () => filterByCategory(category);
        btn.className = category === currentCategory 
            ? 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md'
            : 'bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-100 transition';
        filtersContainer.appendChild(btn);
    });
    
    // Render menu items
    const grid = document.getElementById('menu-grid');
    const filteredMenu = currentCategory === 'All Items' 
        ? menu 
        : menu.filter(item => item.category === currentCategory);
    
    if (filteredMenu.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No items available in this category.</p>';
        return;
    }
    
    grid.innerHTML = filteredMenu.map(item => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transition hover:shadow-xl">
            <div class="h-40 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <span class="text-4xl">🍔</span>
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-800">${escapeHtml(item.name)}</h3>
                    <span class="text-blue-600 font-bold">₱${item.price.toFixed(2)}</span>
                </div>
                <p class="text-gray-500 text-sm mb-4">${escapeHtml(item.description)}</p>
                <button onclick="addToCart(${item.id})" 
                    class="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    renderMenu();
}

// ============================================
// CART FUNCTIONALITY
// ============================================

function addToCart(itemId) {
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const cart = getFromStorage(STORAGE_KEYS.CART) || [];
    const item = menu.find(m => m.id === itemId);
    
    if (!item) return;
    
    const existingItem = cart.find(c => c.itemId === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveToStorage(STORAGE_KEYS.CART, cart);
    updateCartBadge();
    
    // Show brief notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = `${item.name} added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

function updateCartBadge() {
    const cart = getFromStorage(STORAGE_KEYS.CART) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const cart = getFromStorage(STORAGE_KEYS.CART) || [];
    const cartContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
        document.getElementById('cart-total').textContent = '₱0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between py-3 border-b">
            <div class="flex-1">
                <h4 class="font-medium text-gray-800">${escapeHtml(item.name)}</h4>
                <p class="text-gray-500 text-sm">₱${item.price.toFixed(2)} each</p>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="updateCartQuantity(${item.itemId}, -1)" 
                    class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition">-</button>
                <span class="font-medium w-8 text-center">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.itemId}, 1)" 
                    class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition">+</button>
                <button onclick="removeFromCart(${item.itemId})" 
                    class="ml-2 text-red-500 hover:text-red-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = `₱${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
}

function updateCartQuantity(itemId, change) {
    const cart = getFromStorage(STORAGE_KEYS.CART) || [];
    const itemIndex = cart.findIndex(c => c.itemId === itemId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveToStorage(STORAGE_KEYS.CART, cart);
        renderCart();
        updateCartBadge();
    }
}

function removeFromCart(itemId) {
    const cart = getFromStorage(STORAGE_KEYS.CART) || [];
    const filteredCart = cart.filter(c => c.itemId !== itemId);
    saveToStorage(STORAGE_KEYS.CART, filteredCart);
    renderCart();
    updateCartBadge();
}

function placeOrder() {
    const cart = getFromStorage(STORAGE_KEYS.CART) || [];
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'ORD' + Date.now();
    
    const newOrder = {
        id: orderId,
        userId: currentUser.id,
        customerName: currentUser.username,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    orders.push(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    saveToStorage(STORAGE_KEYS.CART, []);
    
    updateCartBadge();
    alert('Order placed successfully! Order ID: ' + orderId);
    showCustomerView('orders');
}

function renderCustomerOrders() {
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    const container = document.getElementById('customer-orders');
    
    if (userOrders.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No orders yet. Start ordering from the menu!</p>';
        return;
    }
    
    // Sort by date descending
    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = userOrders.map(order => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'preparing': 'bg-blue-100 text-blue-700',
            'ready': 'bg-green-100 text-green-700',
            'delivered': 'bg-gray-100 text-gray-700',
            'completed': 'bg-green-100 text-green-700'
        };
        const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-700';
        const itemsList = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
        const date = new Date(order.date).toLocaleString();
        
        return `
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">Order #${order.id.slice(-8)}</h3>
                        <p class="text-gray-500 text-sm">${date}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor}">
                        ${order.status}
                    </span>
                </div>
                <p class="text-gray-600 mb-4">${escapeHtml(itemsList)}</p>
                <div class="flex justify-between items-center pt-4 border-t">
                    <span class="text-gray-600">Total:</span>
                    <span class="text-xl font-bold text-gray-800">₱${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// ADMIN VIEWS
// ============================================

let currentOrderTab = 'pending';

function showAdminView(view) {
    // Hide all sections
    document.getElementById('admin-orders-section').classList.add('hidden');
    document.getElementById('menu-management-section').classList.add('hidden');
    document.getElementById('sales-report-section').classList.add('hidden');
    
    // Update nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('bg-blue-600', 'text-white');
        link.classList.add('hover:bg-gray-100', 'text-gray-800');
    });
    
    const activeLink = document.querySelector(`[data-view="${view}"]`);
    if (activeLink) {
        activeLink.classList.add('bg-blue-600', 'text-white');
        activeLink.classList.remove('hover:bg-gray-100', 'text-gray-800');
    }
    
    // Show selected section and update header
    const titles = {
        'admin-orders': { title: 'Order Management', subtitle: 'Manage and process customer orders.' },
        'menu-management': { title: 'Menu Management', subtitle: 'Manage food items, prices, and stock levels.' },
        'sales-report': { title: 'Sales Report', subtitle: 'Overview of daily sales, revenue, and top-performing items.' }
    };
    
    document.getElementById('admin-title').textContent = titles[view].title;
    document.getElementById('admin-subtitle').textContent = titles[view].subtitle;
    
    if (view === 'admin-orders') {
        document.getElementById('admin-orders-section').classList.remove('hidden');
        renderAdminOrders();
    } else if (view === 'menu-management') {
        document.getElementById('menu-management-section').classList.remove('hidden');
        renderAdminMenu();
    } else if (view === 'sales-report') {
        document.getElementById('sales-report-section').classList.remove('hidden');
        // Set default date to today
        document.getElementById('report-date').value = new Date().toISOString().split('T')[0];
        generateReport();
    }
}

function setOrderTab(tab) {
    currentOrderTab = tab;
    
    document.getElementById('pending-tab').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('pending-tab').classList.add('bg-white', 'text-gray-600');
    document.getElementById('completed-tab').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('completed-tab').classList.add('bg-white', 'text-gray-600');
    
    if (tab === 'pending') {
        document.getElementById('pending-tab').classList.add('bg-blue-600', 'text-white');
        document.getElementById('pending-tab').classList.remove('bg-white', 'text-gray-600');
    } else {
        document.getElementById('completed-tab').classList.add('bg-blue-600', 'text-white');
        document.getElementById('completed-tab').classList.remove('bg-white', 'text-gray-600');
    }
    
    renderAdminOrders();
}

function renderAdminOrders() {
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
    const container = document.getElementById('admin-orders-list');
    
    const filteredOrders = orders.filter(o => {
        if (currentOrderTab === 'pending') {
            return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready';
        } else {
            return o.status === 'completed' || o.status === 'delivered';
        }
    });
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No orders in this category.</p>';
        return;
    }
    
    // Sort by date descending
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filteredOrders.map(order => {
        const itemsList = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
        const isPending = order.status === 'pending' || order.status === 'preparing' || order.status === 'ready';
        const statusColor = isPending ? 'text-red-500' : 'text-green-500';
        
        return `
            <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 ${isPending ? 'border-yellow-400' : 'border-green-400'}">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-xl font-bold text-gray-700">Order #${order.id.slice(-8)}</h2>
                    <span class="text-sm font-semibold px-3 py-1 rounded-full ${isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} uppercase">
                        ${order.status}
                    </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-600">
                    <p><span class="font-medium text-gray-800">Customer:</span> ${escapeHtml(order.customerName)}</p>
                    <div class="sm:col-span-2">
                        <span class="font-medium text-gray-800">Items:</span> ${escapeHtml(itemsList)}
                    </div>
                </div>
                <div class="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end sm:items-center">
                    <div class="mb-4 sm:mb-0">
                        <span class="text-lg font-medium text-gray-700">Total:</span>
                        <span class="text-3xl font-extrabold text-gray-800 ml-2">₱${order.total.toFixed(2)}</span>
                    </div>
                    ${isPending ? `
                        <button onclick="markOrderCompleted('${order.id}')" 
                            class="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition">
                            Mark as Completed
                        </button>
                    ` : `
                        <p class="text-sm text-gray-500">Order successfully fulfilled.</p>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function markOrderCompleted(orderId) {
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex > -1) {
        orders[orderIndex].status = 'completed';
        saveToStorage(STORAGE_KEYS.ORDERS, orders);
        renderAdminOrders();
    }
}

// ============================================
// MENU MANAGEMENT
// ============================================

function renderAdminMenu() {
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const container = document.getElementById('admin-menu-list');
    
    if (menu.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No menu items. Add your first item!</p>';
        return;
    }
    
    container.innerHTML = menu.map(item => `
        <div class="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-xl font-bold text-gray-800">${escapeHtml(item.name)}</h3>
                <span class="text-lg font-extrabold text-blue-600">₱${item.price.toFixed(2)}</span>
            </div>
            <p class="text-gray-600 mb-2">${escapeHtml(item.description)}</p>
            <p class="text-gray-400 text-sm mb-4">Category: ${escapeHtml(item.category)}</p>
            <div class="flex space-x-3">
                <button onclick="openEditItemModal(${item.id})" 
                    class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
                    Edit
                </button>
                <button onclick="deleteMenuItem(${item.id})" 
                    class="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function openAddItemModal() {
    document.getElementById('add-item-modal').classList.remove('hidden');
}

function closeAddItemModal() {
    document.getElementById('add-item-modal').classList.add('hidden');
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-category').value = '';
    document.getElementById('new-item-desc').value = '';
}

function addMenuItem() {
    const name = document.getElementById('new-item-name').value.trim();
    const price = parseFloat(document.getElementById('new-item-price').value);
    const category = document.getElementById('new-item-category').value;
    const description = document.getElementById('new-item-desc').value.trim();
    
    if (!name || isNaN(price) || price < 0 || !category) {
        alert('Please fill in all required fields (Name, Price, Category)');
        return;
    }
    
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const newItem = {
        id: menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1,
        name,
        price,
        category,
        description: description || 'No description available',
        imageUrl: ''
    };
    
    menu.push(newItem);
    saveToStorage(STORAGE_KEYS.MENU, menu);
    
    closeAddItemModal();
    renderAdminMenu();
    alert('Menu item added successfully!');
}

function openEditItemModal(itemId) {
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const item = menu.find(m => m.id === itemId);
    
    if (!item) {
        alert('Item not found');
        return;
    }
    
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-price').value = item.price;
    document.getElementById('edit-item-category').value = item.category;
    document.getElementById('edit-item-desc').value = item.description;
    
    document.getElementById('edit-item-modal').classList.remove('hidden');
}

function closeEditItemModal() {
    document.getElementById('edit-item-modal').classList.add('hidden');
}

function updateMenuItem() {
    const id = parseInt(document.getElementById('edit-item-id').value);
    const name = document.getElementById('edit-item-name').value.trim();
    const price = parseFloat(document.getElementById('edit-item-price').value);
    const category = document.getElementById('edit-item-category').value;
    const description = document.getElementById('edit-item-desc').value.trim();
    
    if (!name || isNaN(price) || price < 0 || !category) {
        alert('Please fill in all required fields (Name, Price, Category)');
        return;
    }
    
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const itemIndex = menu.findIndex(m => m.id === id);
    
    if (itemIndex > -1) {
        menu[itemIndex] = {
            ...menu[itemIndex],
            name,
            price,
            category,
            description: description || 'No description available'
        };
        saveToStorage(STORAGE_KEYS.MENU, menu);
        closeEditItemModal();
        renderAdminMenu();
        alert('Menu item updated successfully!');
    }
}

function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }
    
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    const filteredMenu = menu.filter(m => m.id !== itemId);
    saveToStorage(STORAGE_KEYS.MENU, filteredMenu);
    renderAdminMenu();
    alert('Menu item deleted successfully!');
}

// ============================================
// SALES REPORT
// ============================================

function generateReport() {
    const selectedDate = document.getElementById('report-date').value;
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
    const menu = getFromStorage(STORAGE_KEYS.MENU) || [];
    
    // Filter orders by date
    const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        return orderDate === selectedDate;
    });
    
    const tableBody = document.getElementById('report-table-body');
    const noDataMsg = document.getElementById('no-report-data');
    
    if (dayOrders.length === 0) {
        tableBody.innerHTML = '';
        noDataMsg.classList.remove('hidden');
        document.getElementById('total-revenue').textContent = '₱0.00';
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('top-item').textContent = 'N/A';
        return;
    }
    
    noDataMsg.classList.add('hidden');
    
    // Calculate totals
    const totalRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrdersCount = dayOrders.length;
    
    // Find top selling item
    const itemCounts = {};
    dayOrders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });
    
    let topItemName = 'N/A';
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topItemName = name;
        }
    }
    
    // Update summary cards
    document.getElementById('total-revenue').textContent = `₱${totalRevenue.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrdersCount;
    document.getElementById('top-item').textContent = topItemName;
    
    // Render table
    tableBody.innerHTML = dayOrders.map(order => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'preparing': 'bg-blue-100 text-blue-700',
            'ready': 'bg-green-100 text-green-700',
            'completed': 'bg-green-100 text-green-700',
            'delivered': 'bg-gray-100 text-gray-700'
        };
        const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-700';
        const itemsList = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
        
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">#${order.id.slice(-8)}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(order.customerName)}</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${escapeHtml(itemsList)}</td>
                <td class="px-6 py-4 text-right text-sm font-bold text-gray-800">₱${order.total.toFixed(2)}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor} capitalize">
                        ${order.status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    checkExistingSession();
});
