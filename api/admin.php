<?php
header('Content-Type: application/json');
// Handle CORS - allow credentials
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "../db.php";

session_start();

// Check for authenticated admin user
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Admin authentication required. Please log in as admin.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'menu':
        handleMenuManagement($conn, $method, $input);
        break;
    case 'orders':
        handleOrderManagement($conn, $method, $input);
        break;
    case 'sales':
        handleSalesReports($conn, $method, $input);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleMenuManagement($conn, $method, $input) {
    switch ($method) {
        case 'GET':
            // Get all menu items (including unavailable)
            $sql = "SELECT id, name, description, price, category, image_url, inventory_quantity, is_available, created_at, updated_at FROM menu_items";
            $result = $conn->query($sql);
            
            $menu_items = [];
            while ($row = $result->fetch_assoc()) {
                $menu_items[] = [
                    'id' => (int)$row['id'],
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'price' => (float)$row['price'],
                    'category' => $row['category'],
                    'imageUrl' => $row['image_url'],
                    'inventory_quantity' => (int)$row['inventory_quantity'],
                    'is_available' => (bool)$row['is_available'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
            
            echo json_encode(['success' => true, 'data' => $menu_items]);
            break;

        case 'POST':
            // Add new menu item
            $name = isset($input['name']) ? $input['name'] : '';
            $description = isset($input['description']) ? $input['description'] : '';
            $price = isset($input['price']) ? (float)$input['price'] : 0;
            $category = isset($input['category']) ? $input['category'] : 'New Item';
            $image_url = isset($input['image_url']) ? $input['image_url'] : '';
            $inventory_quantity = isset($input['inventory_quantity']) ? (int)$input['inventory_quantity'] : 0;
            
            if (empty($name) || $price < 0) {
                echo json_encode(['success' => false, 'message' => 'Name and valid price are required']);
                break;
            }
            
            $sql = "INSERT INTO menu_items (name, description, price, category, image_url, inventory_quantity) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssdssi", $name, $description, $price, $category, $image_url, $inventory_quantity);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Menu item added', 'id' => $conn->insert_id]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add menu item']);
            }
            break;

        case 'PUT':
            // Update menu item
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            $name = isset($input['name']) ? $input['name'] : '';
            $description = isset($input['description']) ? $input['description'] : '';
            $price = isset($input['price']) ? (float)$input['price'] : 0;
            $category = isset($input['category']) ? $input['category'] : '';
            $image_url = isset($input['image_url']) ? $input['image_url'] : '';
            $inventory_quantity = isset($input['inventory_quantity']) ? (int)$input['inventory_quantity'] : 0;
            $is_available = isset($input['is_available']) ? (int)$input['is_available'] : 1;
            
            if ($id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
                break;
            }
            
            $sql = "UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image_url = ?, inventory_quantity = ?, is_available = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssdssiii", $name, $description, $price, $category, $image_url, $inventory_quantity, $is_available, $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Menu item updated']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update menu item']);
            }
            break;

        case 'DELETE':
            // Delete menu item
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            
            if ($id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
                break;
            }
            
            $sql = "DELETE FROM menu_items WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Menu item deleted']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete menu item']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid request method']);
            break;
    }
}

function handleOrderManagement($conn, $method, $input) {
    switch ($method) {
        case 'GET':
            // Get all orders with user info
            $status_filter = isset($_GET['status']) ? $_GET['status'] : '';
            
            $sql = "SELECT o.id, o.user_id, u.username as customer_name, o.order_date, o.status, o.total_amount, o.delivery_address 
                    FROM orders o 
                    JOIN users u ON o.user_id = u.id";
            
            if (!empty($status_filter)) {
                $sql .= " WHERE o.status = ?";
            }
            
            $sql .= " ORDER BY o.order_date DESC";
            
            if (!empty($status_filter)) {
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $status_filter);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $result = $conn->query($sql);
            }
            
            $orders = [];
            while ($row = $result->fetch_assoc()) {
                $order_id = $row['id'];
                
                // Get order items
                $items_sql = "SELECT oi.quantity, oi.price_at_time, m.name, m.id as menu_item_id
                             FROM order_items oi 
                             JOIN menu_items m ON oi.menu_item_id = m.id 
                             WHERE oi.order_id = ?";
                $items_stmt = $conn->prepare($items_sql);
                $items_stmt->bind_param("i", $order_id);
                $items_stmt->execute();
                $items_result = $items_stmt->get_result();
                
                $items = [];
                while ($item = $items_result->fetch_assoc()) {
                    $items[] = [
                        'menu_item_id' => (int)$item['menu_item_id'],
                        'name' => $item['name'],
                        'quantity' => (int)$item['quantity'],
                        'price' => (float)$item['price_at_time']
                    ];
                }
                
                $orders[] = [
                    'id' => 'ORD-' . $order_id,
                    'user_id' => (int)$row['user_id'],
                    'customer_name' => $row['customer_name'],
                    'order_date' => $row['order_date'],
                    'status' => $row['status'],
                    'total_amount' => (float)$row['total_amount'],
                    'delivery_address' => $row['delivery_address'],
                    'items' => $items
                ];
            }
            
            echo json_encode(['success' => true, 'data' => $orders]);
            break;

        case 'PUT':
            // Update order status
            $order_id = isset($input['order_id']) ? $input['order_id'] : '';
            $status = isset($input['status']) ? $input['status'] : '';
            
            // Extract numeric ID from 'ORD-123' format
            if (strpos($order_id, 'ORD-') === 0) {
                $order_id = (int)substr($order_id, 4);
            } else {
                $order_id = (int)$order_id;
            }
            
            $valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
            
            if ($order_id <= 0 || !in_array($status, $valid_statuses)) {
                echo json_encode(['success' => false, 'message' => 'Invalid order ID or status']);
                break;
            }
            
            $sql = "UPDATE orders SET status = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $status, $order_id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Order status updated']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update order status']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid request method']);
            break;
    }
}

function handleSalesReports($conn, $method, $input) {
    if ($method !== 'GET') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        return;
    }
    
    $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    
    // Get sales data for the date
    $sql = "SELECT o.id, o.user_id, u.username as customer_name, o.order_date, o.status, o.total_amount
            FROM orders o 
            JOIN users u ON o.user_id = u.id
            WHERE DATE(o.order_date) = ?
            ORDER BY o.order_date DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    $total_revenue = 0;
    $total_orders = 0;
    
    while ($row = $result->fetch_assoc()) {
        $order_id = $row['id'];
        $total_revenue += $row['total_amount'];
        $total_orders++;
        
        // Get order items
        $items_sql = "SELECT oi.quantity, m.name, m.id as menu_item_id
                     FROM order_items oi 
                     JOIN menu_items m ON oi.menu_item_id = m.id 
                     WHERE oi.order_id = ?";
        $items_stmt = $conn->prepare($items_sql);
        $items_stmt->bind_param("i", $order_id);
        $items_stmt->execute();
        $items_result = $items_stmt->get_result();
        
        $items = [];
        while ($item = $items_result->fetch_assoc()) {
            $items[] = [
                'menu_item_id' => (int)$item['menu_item_id'],
                'name' => $item['name'],
                'quantity' => (int)$item['quantity']
            ];
        }
        
        $orders[] = [
            'id' => 'ORD-' . $order_id,
            'customer_name' => $row['customer_name'],
            'order_date' => $row['order_date'],
            'status' => $row['status'],
            'total_amount' => (float)$row['total_amount'],
            'items' => $items
        ];
    }
    
    // Get top selling item for the date
    $top_item_sql = "SELECT m.id, m.name, SUM(oi.quantity) as total_sold
                     FROM order_items oi
                     JOIN orders o ON oi.order_id = o.id
                     JOIN menu_items m ON oi.menu_item_id = m.id
                     WHERE DATE(o.order_date) = ?
                     GROUP BY m.id, m.name
                     ORDER BY total_sold DESC
                     LIMIT 1";
    
    $top_stmt = $conn->prepare($top_item_sql);
    $top_stmt->bind_param("s", $date);
    $top_stmt->execute();
    $top_result = $top_stmt->get_result();
    
    $top_item = null;
    if ($top_row = $top_result->fetch_assoc()) {
        $top_item = [
            'id' => (int)$top_row['id'],
            'name' => $top_row['name'],
            'total_sold' => (int)$top_row['total_sold']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'report_date' => $date,
            'total_orders' => $total_orders,
            'total_revenue' => $total_revenue,
            'top_item' => $top_item,
            'orders' => $orders
        ]
    ]);
}

$conn->close();
?>
