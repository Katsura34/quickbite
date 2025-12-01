export const MOCK_MENU = [
    { id: 1, name: 'Burger', description: 'Juicy beef burger with cheese', price: 120.99, category: 'Main Course', imageUrl: '../assets/images/burger.jpg' },
    { id: 2, name: 'Crispy', description: 'Crispy golden fries', price: 80.25, category: 'Sides', imageUrl: '../assets/images/fries.jpg' },
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