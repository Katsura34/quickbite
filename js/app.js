import { renderMenu, handleFilterMenu, getMenuItems } from './menu.js';
import { renderCart, updateCartBadge } from './cart.js';
import { renderOrders } from './orders.js';
import { MOCK_MENU, API, setMenuItems } from './data.js';

const navLinks = document.querySelectorAll('.nav-link');
const categoryFilters = document.querySelectorAll('.category-filter');

document.addEventListener('DOMContentLoaded', async () => {

    document.getElementById('logout-button').addEventListener('click', handleLogout);
    navLinks.forEach(link => {
        link.addEventListener('click', handleViewChange);
    });
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', handleFilterMenu);
    });

    // Fetch menu data from API (database)
    try {
        const menuData = await API.getMenu();
        if (menuData && menuData.length > 0) {
            setMenuItems(menuData);
            renderMenu(menuData);
        } else {
            // Fallback to mock data if API returns empty
            setMenuItems(MOCK_MENU);
            renderMenu(MOCK_MENU);
        }
    } catch (error) {
        console.log('Error fetching menu from API, using mock data:', error);
        setMenuItems(MOCK_MENU);
        renderMenu(MOCK_MENU);
    }
    
    updateCartBadge();
});

const initialLink = document.querySelector('[data-view="menu"]');
    if (initialLink) {
        initialLink.classList.add('bg-blue-600', 'text-white', 'active');
        initialLink.classList.remove('text-gray-800', 'hover:bg-gray-100');
    }


function handleLogout() {
    window.location.href = '../logout.php';
}


function handleViewChange(e) {
    const newView = e.currentTarget.dataset.view;

    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    
    navLinks.forEach(link => {
        link.classList.remove('active', 'bg-blue-600', 'text-white');
        link.classList.add('text-gray-800', 'hover:bg-gray-100');
    });

    
    document.getElementById(`${newView}-content`).classList.remove('hidden');
    e.currentTarget.classList.add('active', 'bg-blue-600', 'text-white');
    e.currentTarget.classList.remove('text-gray-800', 'hover:bg-gray-100');

    
    const titleMap = { 'menu': 'Today\'s Menu', 'cart': 'Your Current Order', 'orders': 'My Orders' };
    const subtitleMap = { 'menu': 'Fresh food prepared daily for our students.', 'cart': 'Review and finalize your items before checkout.', 'orders': 'View your past and pending orders.' };
    document.getElementById('content-title').textContent = titleMap[newView];
    document.getElementById('content-subtitle').textContent = subtitleMap[newView];

    
    if (newView === 'cart') {
        renderCart();
    } else if (newView === 'orders') {
        renderOrders();
    } else if (newView === 'menu') {
        
        const activeFilter = document.querySelector('.category-filter.active');
        if (activeFilter) {
            handleFilterMenu({ currentTarget: activeFilter });
        } else {
             renderMenu(getMenuItems());
        }
    }
}