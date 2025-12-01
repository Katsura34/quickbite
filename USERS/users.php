<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.html");
    exit;
}

// Check if user has customer role (not admin)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    header("Location: ../ADMIN/admin.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickBite Student Ordering</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div id="app" class="flex h-screen w-full">

    <div id="student-interface" class="w-full h-full flex">
        
        <div class="flex flex-col w-64 bg-white shadow-xl h-full border-r border-gray-200 p-4">
            <div class="text-2xl font-extrabold text-blue-600 mb-8">
               <span class="text-blue-600">Quick</span><span class="text-green-600">Bite</span>
            </div>
            
            <nav class="flex-grow space-y-2">
                <button data-view="menu" class="nav-link active w-full flex items-center p-3 rounded-xl transition duration-150 bg-blue-600 text-white">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    Menu
                </button>

                <button data-view="cart" class="nav-link w-full flex items-center p-3 rounded-xl transition duration-150 hover:bg-gray-100 text-gray-800 relative">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Cart
                    <span id="cart-count-badge" class="absolute top-2 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full hidden">0</span>
                </button>
                <button data-view="orders" class="nav-link w-full flex items-center p-3 rounded-xl transition duration-150 hover:bg-gray-100 text-gray-800">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    My Orders
                </button>
            </nav>
            
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="logout-button" class="w-full flex items-center p-3 rounded-xl transition duration-150 text-red-600 hover:bg-red-50">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Logout
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 bg-gray-50">

            <header class="mb-8">
                <h1 id="content-title" class="text-3xl font-bold text-gray-800">Today's Menu</h1>
                <p id="content-subtitle" class="text-gray-500">Fresh food prepared daily for our customer.</p>
            </header>

            <section id="menu-content" class="content-section">
                <div class="flex space-x-3 mb-6">
                    <button class="category-filter active bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md">All Items</button>
                    <button class="category-filter bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-100 transition duration-150">Main Course</button>
                    <button class="category-filter bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-100 transition duration-150">Sides</button>
                    <button class="category-filter bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-100 transition duration-150">Beverages</button>
                </div>

                <div id="menu-items-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 menu-grid-container">
                    </div>
            </section>

            <section id="cart-content" class="content-section hidden">
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h2 class="text-2xl font-semibold mb-6">Your Cart</h2>
                    <div id="cart-items-list" class="space-y-4 border-b pb-4">
                        </div>
                    <div id="cart-summary" class="flex justify-between items-center pt-4 font-bold text-xl">
                        <span>Total:</span>
                        <span id="cart-total">₱0.00</span>
                    </div>
                    <button id="checkout-button" class="w-full mt-6 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md disabled:opacity-50" disabled>
                        Place Order
                    </button>
                </div>
            </section>

            <section id="orders-content" class="content-section hidden">
                <h2 class="text-2xl font-semibold mb-6">Order History</h2>
                <div id="orders-list" class="space-y-6">
                    </div>
            </section>

        </div>
    </div>
</div>

<script type="module" src="../js/data.js"></script>
<script type="module" src="../js/menu.js"></script>
<script type="module" src="../js/cart.js"></script>
<script type="module" src="../js/orders.js"></script>
<script type="module" src="../js/app.js"></script>

</body>
</html>
