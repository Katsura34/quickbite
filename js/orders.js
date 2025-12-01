import { ordersHistory } from './data.js';

const ordersList = document.getElementById('orders-list');

export function renderOrders() {
    ordersList.innerHTML = '';
    if (ordersHistory.length === 0) {
        ordersList.innerHTML = '<p class="text-center text-gray-500 p-8">You have no previous orders.</p>';
        return;
    }

    ordersHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(order => {
        const statusClass = order.status === 'ready' ? 'bg-green-100 text-green-700' :
                             order.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                             'bg-yellow-100 text-yellow-700';

        const itemsList = order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('');

        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500';
        orderElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">Order #${order.id}</h3>
                    <p class="text-sm text-gray-500">Ordered on: ${new Date(order.date).toLocaleString()}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusClass} uppercase">
                    ${order.status}
                </span>
            </div>
            
            <div class="flex justify-between items-end border-t border-gray-100 pt-4">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Items:</p>
                    <ul class="text-sm text-gray-500 list-disc list-inside space-y-0.5">
                        ${itemsList}
                    </ul>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold text-gray-800">Total: ₱${order.total.toFixed(2)}</p>
                </div>
            </div>
        `;
        ordersList.appendChild(orderElement);
    });
}