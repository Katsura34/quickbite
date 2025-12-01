import { MOCK_MENU, menuItems, currentCart, setMenuItems } from './data.js';
import { renderCart, updateCartBadge } from './cart.js';

const menuItemsGrid = document.getElementById('menu-items-grid');

// Get menu items from API
export function getMenuItems() {
    return menuItems.length > 0 ? menuItems : MOCK_MENU;
}

export function renderMenu(items) {
    menuItemsGrid.innerHTML = '';
    if (items.length === 0) {
        menuItemsGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 p-8">No items found in this category.</p>';
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition duration-300 hover:shadow-xl';
        itemElement.innerHTML = `
            <div class="h-40 overflow-hidden">
                <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover rounded-t-xl transition duration-500 hover:scale-105">
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${item.name}</h3>
                <p class="text-sm text-gray-500 mb-3 flex-grow">${item.description}</p>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span class="text-xl font-bold text-green-600">₱${item.price.toFixed(2)}</span>
                    <button data-id="${item.id}" class="add-to-cart-btn flex items-center bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition duration-150 shadow-md">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add
                    </button>
                </div>
            </div>
        `;
        menuItemsGrid.appendChild(itemElement);
    });

  
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => handleAddToCart(e.currentTarget.dataset.id));
    });
}

function handleAddToCart(itemId) {
    const items = getMenuItems();
    const item = items.find(i => i.id === parseInt(itemId));
    if (!item) return;

    const existingItem = currentCart.find(c => c.menu_item_id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentCart.push({
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    

    if (document.getElementById('cart-content').classList.contains('hidden') === false) {
        renderCart();
    } else {
        updateCartBadge();
    }
}


export function handleFilterMenu(e) {
    const filterText = e.currentTarget.textContent;
    const items = getMenuItems();
    
    
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-gray-700', 'border');
    });
    e.currentTarget.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-md');
    e.currentTarget.classList.remove('bg-white', 'text-gray-700', 'border');

    let filteredItems = items;
    if (filterText !== 'All Items') {
        filteredItems = items.filter(item => item.category === filterText);
    }
    renderMenu(filteredItems);
}