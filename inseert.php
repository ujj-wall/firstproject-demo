<?php
$servername = "localhost";
$username   = "root"; 
$password   = "";
$database   = "delivery_db";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$sql = "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    order_items TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn-->query($sql)===TRUE)
{
    echo "created ";
}
else{
    echo "error";
}
$conn-->close();
?>

