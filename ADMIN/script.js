// API Base URL - adjust for your server setup
const API_BASE_URL = '../api';

let MOCK_MENU = [
    { id: 1, name: 'Burger', price: 120.99, category: 'Main Course', description: 'Juicy beef burger with cheese' },
    { id: 2, name: 'Fries', price: 80.25, category: 'Sides', description: 'Crispy golden fries' },
    { id: 3, name: 'Coke', price: 45.00, category: 'Beverages', description: 'Refreshing cola drink' },
    { id: 4, name: 'Pizza Slice', price: 350.00, category: 'Main Course', description: 'Cheesy pepperoni pizza' },
];

// MOCK Sales Report Data
const MOCK_SALES_REPORTS = [
    { report_date: '2025-11-20', total_orders: 1, total_revenue: 1134.00, top_item_id: 1 },
    { report_date: '2025-11-18', total_orders: 1, total_revenue: 450.00, top_item_id: 4 },
];

// MOCK Orders Data 
const MOCK_ORDERS = [
    { id: 'ORD-9459', user_id: 1, customer_name: 'student1', order_date: '2025-11-20 19:15', status: 'ready', total_amount: 1169.91, items: [{ menu_item_id: 1, name: 'Burger', quantity: 9 }, { menu_item_id: 2, name: 'Fries', quantity: 2 }] },
    { id: 'ORD-9460', user_id: 1, customer_name: 'student1', order_date: '2025-11-18 10:30', status: 'delivered', total_amount: 350.00, items: [{ menu_item_id: 4, name: 'Pizza Slice', quantity: 1 }, { menu_item_id: 3, name: 'Coke', quantity: 4 }] }
];

//  MOCK Orders Data (from user's Order Management code)
let orders = [
    { id: "ORD1762858129459", student: " Flora Mae Catapan (ST12345)", items: "Burger x 9", amount: 1134, status: "PENDING" },
    { id: "ORD1762858129460", student: "Xyron Manatad(ST12346)", items: "Burger x 2, Fries x 2", amount: 350, status: "PENDING" },
    { id: "ORD1762858129461", student: "Bea Grabello (ST12347)", items: "Coke x 1, Fries x 1", amount: 150, status: "COMPLETED" },
    { id: "ORD1762858129462", student: "Jannah Tajor (ST12348)", items: "Pizza x 1, Coke x 4", amount: 800, status: "PENDING" },
    { id: "ORD1762858129463", student: "Trisha Mae Ronquiz (ST12349)", items: "Fries x 1", amount: 220, status: "COMPLETED" },
];

let currentTab = 'PENDING';

// --- Admin API Functions ---
const AdminAPI = {
    // Menu Management
    async getMenu() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin.php?action=menu`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return MOCK_MENU;
        } catch (error) {
            console.log('Using mock menu data:', error);
            return MOCK_MENU;
        }
    },

    async addMenuItem(item) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin.php?action=menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            console.log('Menu API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    async updateMenuItem(item) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin.php?action=menu`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            console.log('Menu API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    async deleteMenuItem(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin.php?action=menu`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.log('Menu API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    // Order Management
    async getOrders(status = '') {
        try {
            let url = `${API_BASE_URL}/admin.php?action=orders`;
            if (status) {
                url += `&status=${status}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return MOCK_ORDERS;
        } catch (error) {
            console.log('Using mock orders:', error);
            return MOCK_ORDERS;
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin.php?action=orders`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status })
            });
            return await response.json();
        } catch (error) {
            console.log('Order API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    // Sales Reports
    async getSalesReport(date) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin.php?action=sales&date=${date}`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return null;
        } catch (error) {
            console.log('Sales API error:', error);
            return null;
        }
    }
};

// --- DOM Elements ---

const adminInterface = document.getElementById('admin-interface');

// Sales Report Elements
const ordersReportBody = document.getElementById('orders-report-body');
const totalRevenueElement = document.getElementById('total-revenue');
const totalOrdersElement = document.getElementById('total-orders');
const topItemElement = document.getElementById('top-item');
const reportDateInput = document.getElementById('report-date');
const generateReportBtn = document.getElementById('generate-report-btn');
const noReportDataMsg = document.getElementById('no-report-data');

//  Orders Content Elements
const ordersList = document.getElementById('orders-list');
const pendingTabButton = document.getElementById('pending-tab');
const completedTabButton = document.getElementById('completed-tab');
const noOrdersMessage = document.getElementById('no-orders-message');


//  Menu Management Elements 
const menuList = document.getElementById('menu-list');


// --- EVENT LISTENERS & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleViewChangeAdmin);
    });

    // Setup report generation
    generateReportBtn.addEventListener('click', () => {
          renderSalesReport(reportDateInput.value);
    });

    // Setup logout button
    const logoutBtn = document.getElementById('logout-button-admin');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogoutAdmin);
    }

    // Initial render
    renderSalesReport(reportDateInput.value); 
    renderOrders();
    
});


// --- ADMIN INTERFACE LOGIC ---

function handleViewChangeAdmin(e) {
    const newView = e.currentTarget.dataset.view;

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Update navigation link styles
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-blue-600', 'text-white');
        link.classList.add('text-gray-800', 'hover:bg-gray-100');
    });

    // Show the selected section and update active link
    document.getElementById(`${newView}-content`).classList.remove('hidden');
    e.currentTarget.classList.add('active', 'bg-blue-600', 'text-white');
    e.currentTarget.classList.remove('text-gray-800', 'hover:bg-gray-100');

    // Update Header
    const titleMap = { 
        'orders': '', 
        'menu-management': 'Menu & Inventory', 
        'sales-report': 'Sales Report' 
    };
    const subtitleMap = { 
        'orders': '', 
        'menu-management': 'Manage food items, prices, and stock levels.', 
        'sales-report': 'Overview of daily sales, revenue, and top-performing items.' 
    };
    document.getElementById('content-title-admin').textContent = titleMap[newView];
    document.getElementById('content-subtitle-admin').textContent = subtitleMap[newView];

    // Render content specific to the view
    if (newView === 'sales-report') {
        renderSalesReport(reportDateInput.value);
    } else if (newView === 'orders') {
        renderOrders();
    } else if (newView === 'menu-management') { // New logic
        renderMenu();
    }
}


function handleLogoutAdmin() {
    window.location.href = '../logout.php';
}



// --- SALES REPORT LOGIC ---


function renderSalesReport(date) {
    const salesReport = MOCK_SALES_REPORTS.find(r => r.report_date === date);
    const ordersForDate = MOCK_ORDERS.filter(o => o.order_date.startsWith(date));

    // Clear previous data
    ordersReportBody.innerHTML = '';
    noReportDataMsg.classList.add('hidden');
    totalRevenueElement.textContent = '₱0.00';
    totalOrdersElement.textContent = '0';
    topItemElement.textContent = 'N/A';

    if (!salesReport && ordersForDate.length === 0) {
        noReportDataMsg.classList.remove('hidden');
        return;
    }

    // --- 1. Render Summary Cards ---
    if (salesReport) {
        totalRevenueElement.textContent = `₱${salesReport.total_revenue.toFixed(2)}`;
        totalOrdersElement.textContent = salesReport.total_orders;
        // Use MOCK_MENU array which now contains descriptions
        const topItem = MOCK_MENU.find(i => i.id === salesReport.top_item_id); 
        topItemElement.textContent = topItem ? topItem.name : 'Unknown Item';
    }

    // --- 2. Render Order Breakdown Table ---
    ordersForDate.forEach(order => {
        const statusClass = order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                             order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                             'bg-yellow-100 text-yellow-700';

        const itemsText = order.items.map(item => `${item.name} x ${item.quantity}`).join(', ');

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition duration-100';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${order.id.slice(-4)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customer_name}</td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title="${itemsText}">${itemsText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-800">₱${order.total_amount.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass} capitalize">
                    ${order.status}
                </span>
            </td>
        `;
        ordersReportBody.appendChild(row);
    });

    if (ordersForDate.length > 0 && !salesReport) {
        const calculatedRevenue = ordersForDate.reduce((sum, order) => sum + order.total_amount, 0);
        totalRevenueElement.textContent = `₱${calculatedRevenue.toFixed(2)}`;
        totalOrdersElement.textContent = ordersForDate.length;
    }
}



//  --- ORDER MANAGEMENT LOGIC (From User's Code) ---

/**
 * Generates the HTML for a single order card.
 * @param {Object} order - The order data object.
 * @returns {string} The HTML string for the order card.
 */
function createOrderCard(order) {
    const isPending = order.status === 'PENDING';
    // Using Tailwind config colors: pending (red) and completed (green)
    const statusColor = isPending ? 'text-pending' : 'text-completed';
    const statusBg = isPending ? 'bg-red-100' : 'bg-green-100';

    return `
        <div class="bg-cardbg p-6 sm:p-8 rounded-2xl shadow-lg border-t-4 border-gray-100 transition duration-300 hover:shadow-xl hover:border-t-primary">
            <div class="flex justify-between items-start mb-4">
                <h2 class="text-xl font-bold text-gray-700">Order #${order.id.slice(-4)}</h2>
                <span class="text-sm font-semibold px-3 py-1 rounded-full ${statusBg} ${statusColor} uppercase">
                    ${order.status}
                </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-600">
                <p>
                    <span class="font-medium text-gray-800">Student:</span> ${order.student}
                </p>
                
                <div class="sm:col-span-2">
                    <span class="font-medium text-gray-800">Items:</span> ${order.items}
                </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end sm:items-center">
                <div class="mb-4 sm:mb-0">
                    <span class="text-lg font-medium text-gray-700">Total:</span>
                    <span class="text-3xl font-extrabold text-gray-800 ml-2">₱${order.amount.toFixed(2)}</span>
                </div>
            
                ${isPending ? `
                    <button onclick="markAsCompleted('${order.id}')" class="w-full sm:w-auto px-6 py-3 bg-secondary text-white font-bold rounded-xl shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-secondary/50 active:scale-95">
                        Mark as Completed
                    </button>
                ` : `
                    <p class="text-sm text-gray-500">Order successfully fulfilled.</p>
                `}
            </div>
        </div>
    `;
}


function renderOrders() {
    ordersList.innerHTML = '';
    const filteredOrders = orders.filter(order => order.status === currentTab);

    if (filteredOrders.length === 0) {
        noOrdersMessage.classList.remove('hidden');
    } else {
        noOrdersMessage.classList.add('hidden');
        filteredOrders.forEach(order => {
            ordersList.innerHTML += createOrderCard(order);
        });
    }
}

/**
 * Sets the active order tab (PENDING or COMPLETED) and re-renders the list.
 * @param {string} status - 'PENDING' or 'COMPLETED'.
 */
window.setActiveTab = function(status) {
    currentTab = status;

    // Update button styles
    pendingTabButton.classList.remove('active');
    completedTabButton.classList.remove('active');

    if (status === 'PENDING') {
        pendingTabButton.classList.add('active');
        pendingTabButton.classList.remove('hover:bg-gray-50');
        completedTabButton.classList.add('bg-white', 'hover:bg-gray-50');
    } else {
        completedTabButton.classList.add('active');
        completedTabButton.classList.remove('hover:bg-gray-50');
        pendingTabButton.classList.add('bg-white', 'hover:bg-gray-50');
    }

    renderOrders();
}

/**
 * Marks a specific order as completed and re-renders the list.
 * @param {string} orderId 
 */
window.markAsCompleted = function(orderId) {
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
       
        orders[orderIndex].status = 'COMPLETED';
        console.log(`Order ${orderId} marked as COMPLETED.`);

       
        if (currentTab === 'PENDING') {
            renderOrders(); 
        } else {
            
            renderOrders();
        }
    } else {
        console.error(`Order with ID ${orderId} not found.`);
    }
}


function renderMenu() {
    menuList.innerHTML = '';
   
    MOCK_MENU.forEach(item => {
        const formattedPrice = item.price ? parseFloat(item.price).toFixed(2) : '0.00';
        const description = item.description || 'No description available.';

        menuList.innerHTML += `
            <div class="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 transition duration-300 hover:shadow-xl">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                    <span class="text-lg font-extrabold text-primary">₱${formattedPrice}</span>
                </div>
                <p class="text-gray-600 mb-4">${description}</p>
                <div class="flex space-x-3">
                    <button onclick="editItem(${item.id})" class="px-4 py-2 bg-blue-400 text-white font-semibold rounded-lg hover:bg-yellow-400 transition duration-150 active:scale-95">Edit</button>
                    <button onclick="deleteItem(${item.id})" class="px-4 py-2 bg-green-400 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 active:scale-95">Delete</button>
                </div>
            </div>
        `;
    });
}

// Modal functions
window.openAddModal = function() { document.getElementById('add-modal').classList.remove('hidden'); }
window.closeAddModal = function() { 
  
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-desc').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('add-modal').classList.add('hidden'); 
}

// CRUD functions
window.addItem = function() {
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const description = document.getElementById('item-desc').value;
    const category = document.getElementById('item-category').value || 'New Item';

    if (!name || isNaN(price) || price < 0) {
        alert("Item Name and valid Price are required!");
        return;
    }

    // Assign a new unique ID
    const newItem = { 
        id: Date.now(), 
        name: name, 
        price: price, 
        description: description,
        category: category 
    };

    MOCK_MENU.push(newItem);
    
    closeAddModal();
    renderMenu();
}

window.deleteItem = function(id) {
    if (confirm("Are you sure you want to delete this menu item?")) {
        // Update MOCK_MENU array
        MOCK_MENU = MOCK_MENU.filter(x => x.id !== id);
        renderMenu();
    }
}

// Placeholder for Edit functionality
window.editItem = function(id) {
    alert(`Editing item ID: ${id}. Please implement a dedicated Edit modal.`);
}