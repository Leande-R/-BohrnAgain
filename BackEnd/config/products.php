<?php
require_once '../config/dbacess.php';

// Produkte aus der Datenbank abrufen
$statement = $pdo->query("SELECT * FROM products");

$products = [];

while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
    $products[] = $row;
}

// Als JSON zurückgeben
header('Content-Type: application/json');
echo json_encode($products);
?>
