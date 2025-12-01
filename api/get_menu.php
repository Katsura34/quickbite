<?php
header('Content-Type: application/json');

// Handle CORS - allow credentials with origin validation
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
// Allowed origins for CORS (add production domains as needed)
$allowed_origins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
];

// For same-origin requests (no Origin header), allow the request
// For cross-origin requests, validate against allowlist
if ($origin && in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET');

include "../db.php";

session_start();

// Check for authenticated user
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Authentication required. Please log in.']);
    exit;
}

$sql = "SELECT id, name, description, price, category, image_url, inventory_quantity, is_available FROM menu_items WHERE is_available = 1";
$result = $conn->query($sql);

$menu_items = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $menu_items[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => (float)$row['price'],
            'category' => $row['category'],
            'imageUrl' => $row['image_url'],
            'inventory_quantity' => (int)$row['inventory_quantity'],
            'is_available' => (bool)$row['is_available']
        ];
    }
}

echo json_encode(['success' => true, 'data' => $menu_items]);

$conn->close();
?>
