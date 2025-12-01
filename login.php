<?php
include "db.php";

$username = $_POST["username"];
$password = $_POST["password"];
$role     = $_POST["role"];

$sql = "SELECT * FROM users WHERE username = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $role);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password_hash'])) {
        session_start();
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["role"] = $user["role"];

        if ($role === "admin") {
            header("Location: ADMIN/admin.html");
        } else {
            header("Location: USERS/users.html");
        }
        exit;
    } else {
        echo "<script>alert('Incorrect password!'); window.location='login.html';</script>";
    }
} else {
    echo "<script>alert('User not found!'); window.location='login.html';</script>";
}
?>

