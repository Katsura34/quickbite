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
        // Get cart items for user
        $sql = "SELECT c.id, c.menu_item_id, c.quantity, m.name, m.price, m.description 
                FROM cart c 
                JOIN menu_items m ON c.menu_item_id = m.id 
                WHERE c.user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $cart_items = [];
        while ($row = $result->fetch_assoc()) {
            $cart_items[] = [
                'id' => (int)$row['id'],
                'menu_item_id' => (int)$row['menu_item_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'description' => $row['description'],
                'quantity' => (int)$row['quantity']
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $cart_items]);
        break;

    case 'POST':
        // Add item to cart
        $menu_item_id = isset($input['menu_item_id']) ? (int)$input['menu_item_id'] : 0;
        $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 1;
        
        if ($menu_item_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
            break;
        }
        
        // Check if item already exists in cart
        $check_sql = "SELECT id, quantity FROM cart WHERE user_id = ? AND menu_item_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("ii", $user_id, $menu_item_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            // Update quantity
            $existing = $check_result->fetch_assoc();
            $new_quantity = $existing['quantity'] + $quantity;
            $update_sql = "UPDATE cart SET quantity = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param("ii", $new_quantity, $existing['id']);
            $update_stmt->execute();
        } else {
            // Insert new item
            $insert_sql = "INSERT INTO cart (user_id, menu_item_id, quantity) VALUES (?, ?, ?)";
            $insert_stmt = $conn->prepare($insert_sql);
            $insert_stmt->bind_param("iii", $user_id, $menu_item_id, $quantity);
            $insert_stmt->execute();
        }
        
        echo json_encode(['success' => true, 'message' => 'Item added to cart']);
        break;

    case 'PUT':
        // Update cart item quantity
        $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : 0;
        $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 0;
        
        if ($cart_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid cart ID']);
            break;
        }
        
        if ($quantity <= 0) {
            // Remove item if quantity is 0 or less
            $delete_sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
            $delete_stmt = $conn->prepare($delete_sql);
            $delete_stmt->bind_param("ii", $cart_id, $user_id);
            $delete_stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Item removed from cart']);
        } else {
            $update_sql = "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param("iii", $quantity, $cart_id, $user_id);
            $update_stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Cart updated']);
        }
        break;

    case 'DELETE':
        // Remove item from cart or clear cart
        $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : 0;
        $clear_all = isset($input['clear_all']) ? $input['clear_all'] : false;
        
        if ($clear_all) {
            $delete_sql = "DELETE FROM cart WHERE user_id = ?";
            $delete_stmt = $conn->prepare($delete_sql);
            $delete_stmt->bind_param("i", $user_id);
            $delete_stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Cart cleared']);
        } else if ($cart_id > 0) {
            $delete_sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
            $delete_stmt = $conn->prepare($delete_sql);
            $delete_stmt->bind_param("ii", $cart_id, $user_id);
            $delete_stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Item removed from cart']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid request']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>
