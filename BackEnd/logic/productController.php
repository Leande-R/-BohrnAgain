<?php
require_once '../config/dbacess.php';  
require_once '../models/product.class.php';
$statement = $pdo->query("SELECT * FROM products");
$products = [];

while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
    $products[] = new Product(
        $row['id'],
        $row['name'],
        $row['description'],
        $row['price'],
        $row['image'],
        $row['rating']
    );
}
?>
