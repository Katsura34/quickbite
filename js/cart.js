import { currentCart, addOrder, updateCart } from './data.js';

const cartItemsList = document.getElementById('cart-items-list');
const cartTotalElement = document.getElementById('cart-total');
const cartCountBadge = document.getElementById('cart-count-badge');
const checkoutButton = document.getElementById('checkout-button');


export function updateCartBadge() {
    const count = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = count;
    if (count > 0) {
        cartCountBadge.classList.remove('hidden');
    } else {
        cartCountBadge.classList.add('hidden');
    }
}


export function renderCart() {
    cartItemsList.innerHTML = '';
    let total = 0;

    if (currentCart.length === 0) {
        cartItemsList.innerHTML = '<p class="text-center text-gray-500 p-4">Your cart is empty. Start adding some delicious items!</p>';
        cartTotalElement.textContent = '₱0.00';
        updateCartBadge(); 
        checkoutButton.disabled = true;
        return;
    }

    currentCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
        cartItem.innerHTML = `
            <div class="flex-1 min-w-0 mr-4">
                <p class="font-medium text-gray-800">${item.name}</p>
                <p class="text-sm text-gray-500">₱${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button data-id="${item.menu_item_id}" data-action="decrease" class="update-cart-btn text-gray-600 hover:text-red-500 p-1 rounded-full bg-white border">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                </button>
                <span class="font-bold text-gray-800 w-8 text-center">${item.quantity}</span>
                <button data-id="${item.menu_item_id}" data-action="increase" class="update-cart-btn text-gray-600 hover:text-green-500 p-1 rounded-full bg-white border">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
                <button data-id="${item.menu_item_id}" data-action="remove" class="update-cart-btn text-red-500 hover:text-red-700 p-1 rounded-full ml-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        cartItemsList.appendChild(cartItem);
    });

    cartTotalElement.textContent = `₱${total.toFixed(2)}`;
    updateCartBadge();
    checkoutButton.disabled = false;

    document.querySelectorAll('.update-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => handleUpdateCart(e.currentTarget.dataset.id, e.currentTarget.dataset.action));
    });
}


function handleUpdateCart(itemId, action) {
    const id = parseInt(itemId);
    const cartIndex = currentCart.findIndex(item => item.menu_item_id === id);

    if (cartIndex === -1) return;

    if (action === 'increase') {
        currentCart[cartIndex].quantity += 1;
    } else if (action === 'decrease') {
        currentCart[cartIndex].quantity -= 1;
        if (currentCart[cartIndex].quantity <= 0) {
            currentCart.splice(cartIndex, 1); 
        }
    } else if (action === 'remove') {
        currentCart.splice(cartIndex, 1);
    }

    renderCart();
}


export function handleCheckout() {
    if (currentCart.length === 0) return;

    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
   
    const newOrder = {
        id: 'ORD-' + Math.floor(Math.random() * 10000),
        date: new Date().toISOString(),
        status: 'pending', 
        total: total,
        items: currentCart.map(item => ({ name: item.name, quantity: item.quantity }))
    };

    
    addOrder(newOrder);

    
    updateCart([]);


    console.log('Order Placed Successfully!', newOrder);
    alert('Order Placed Successfully! Your order is pending confirmation.');

  
    document.querySelector('[data-view="orders"]').click(); 
}


checkoutButton.addEventListener('click', handleCheckout);