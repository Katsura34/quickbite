<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

include "../db.php";

$sql = "SELECT id, name, description, price, category, inventory_quantity, is_available FROM menu_items WHERE is_available = 1";
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
            'inventory_quantity' => (int)$row['inventory_quantity'],
            'is_available' => (bool)$row['is_available']
        ];
    }
}

echo json_encode(['success' => true, 'data' => $menu_items]);

$conn->close();
?>
