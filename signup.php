<?php
include "db.php";

$username = $_POST["username"];
$email    = $_POST["email"];
$password = password_hash($_POST["password"], PASSWORD_BCRYPT);
$role     = $_POST["role"];

$sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $username, $email, $password, $role);

if ($stmt->execute()) {
    echo "<script>alert('Account created successfully!'); window.location='login.html';</script>";
} else {
    echo "Error: " . $stmt->error;
}
?>
