// API Base URL - adjust for your server setup
const API_BASE_URL = '../api';

export const MOCK_MENU = [
    { id: 1, name: 'Burger', description: 'Juicy beef burger with cheese', price: 120.99, category: 'Main Course', imageUrl: '../assets/images/burger.jpg' },
    { id: 2, name: 'Fries', description: 'Crispy golden fries', price: 80.25, category: 'Sides', imageUrl: '../assets/images/fries.jpg' },
    { id: 3, name: 'Coke', description: 'Refreshing cola drink', price: 45.00, category: 'Beverages', imageUrl: '../assets/images/cola.jpg' },
    { id: 4, name: 'Pizza Slice', description: 'Cheesy pepperoni pizza', price: 350.00, category: 'Main Course', imageUrl: '../assets/images/pizza.jpg' },
   
];

export let currentCart = [];
export let ordersHistory = [

    {
        id: 'ORD-9459', date: '2025-11-20 19:15', status: 'ready', total: 1134.00,
        items: [{ name: 'Burger', quantity: 9 }, { name: 'Fries', quantity: 2 }]
    },
    {
        id: 'ORD-9460', date: '2025-11-18 10:30', status: 'delivered', total: 450.00,
        items: [{ name: 'Pizza Slice', quantity: 1 }, { name: 'Coke', quantity: 4 }]
    }
];

export function updateCart(newCart) {
    currentCart = newCart;
}
export function addOrder(newOrder) {
    ordersHistory.unshift(newOrder);
}

// API Functions for backend integration
export const API = {
    // Fetch menu items from backend
    async getMenu() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_menu.php`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return MOCK_MENU; // Fallback to mock data
        } catch (error) {
            console.log('Using mock menu data:', error);
            return MOCK_MENU;
        }
    },

    // Cart operations
    async getCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return currentCart;
        } catch (error) {
            console.log('Using local cart:', error);
            return currentCart;
        }
    },

    async addToCart(menuItemId, quantity = 1) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menu_item_id: menuItemId, quantity })
            });
            return await response.json();
        } catch (error) {
            console.log('Cart API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    async updateCartItem(cartId, quantity) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId, quantity })
            });
            return await response.json();
        } catch (error) {
            console.log('Cart API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    async removeFromCart(cartId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId })
            });
            return await response.json();
        } catch (error) {
            console.log('Cart API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    async clearCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clear_all: true })
            });
            return await response.json();
        } catch (error) {
            console.log('Cart API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    },

    // Orders operations
    async getOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return ordersHistory;
        } catch (error) {
            console.log('Using mock orders:', error);
            return ordersHistory;
        }
    },

    async placeOrder(deliveryAddress = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delivery_address: deliveryAddress })
            });
            return await response.json();
        } catch (error) {
            console.log('Order API error:', error);
            return { success: false, message: 'API unavailable' };
        }
    }
};