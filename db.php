<?php
$host = "localhost";
$user = "root";       
$pass = "";            
$db   = "quickbite_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

<?php
$conn = new mysqli("localhost", "root", "", "quickbite_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
