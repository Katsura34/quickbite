<?php
header('Content-Type: application/json');
// Handle CORS - allow credentials
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "../db.php";

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Check for authenticated user
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Authentication required. Please log in.']);
    exit;
}

$user_id = $_SESSION['user_id'];

switch ($method) {
    case 'GET':
        // Get orders for user
        $sql = "SELECT o.id, o.order_date, o.status, o.total_amount, o.delivery_address 
                FROM orders o 
                WHERE o.user_id = ? 
                ORDER BY o.order_date DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $order_id = $row['id'];
            
            // Get order items
            $items_sql = "SELECT oi.quantity, oi.price_at_time, m.name 
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
                    'name' => $item['name'],
                    'quantity' => (int)$item['quantity'],
                    'price' => (float)$item['price_at_time']
                ];
            }
            
            $orders[] = [
                'id' => 'ORD-' . $order_id,
                'date' => $row['order_date'],
                'status' => $row['status'],
                'total' => (float)$row['total_amount'],
                'delivery_address' => $row['delivery_address'],
                'items' => $items
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $orders]);
        break;

    case 'POST':
        // Create new order from cart
        $delivery_address = isset($input['delivery_address']) ? $input['delivery_address'] : '';
        
        // Get cart items
        $cart_sql = "SELECT c.menu_item_id, c.quantity, m.price 
                     FROM cart c 
                     JOIN menu_items m ON c.menu_item_id = m.id 
                     WHERE c.user_id = ?";
        $cart_stmt = $conn->prepare($cart_sql);
        $cart_stmt->bind_param("i", $user_id);
        $cart_stmt->execute();
        $cart_result = $cart_stmt->get_result();
        
        $cart_items = [];
        $total_amount = 0;
        
        while ($item = $cart_result->fetch_assoc()) {
            $cart_items[] = $item;
            $total_amount += $item['price'] * $item['quantity'];
        }
        
        if (empty($cart_items)) {
            echo json_encode(['success' => false, 'message' => 'Cart is empty']);
            break;
        }
        
        // Create order
        $order_sql = "INSERT INTO orders (user_id, total_amount, delivery_address, status) VALUES (?, ?, ?, 'pending')";
        $order_stmt = $conn->prepare($order_sql);
        $order_stmt->bind_param("ids", $user_id, $total_amount, $delivery_address);
        $order_stmt->execute();
        $order_id = $conn->insert_id;
        
        // Add order items
        $item_sql = "INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)";
        $item_stmt = $conn->prepare($item_sql);
        
        foreach ($cart_items as $item) {
            $item_stmt->bind_param("iiid", $order_id, $item['menu_item_id'], $item['quantity'], $item['price']);
            $item_stmt->execute();
        }
        
        // Clear cart
        $clear_sql = "DELETE FROM cart WHERE user_id = ?";
        $clear_stmt = $conn->prepare($clear_sql);
        $clear_stmt->bind_param("i", $user_id);
        $clear_stmt->execute();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Order placed successfully',
            'order_id' => 'ORD-' . $order_id,
            'total' => $total_amount
        ]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>
