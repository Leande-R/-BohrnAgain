<?php
require_once '../config/dbacess.php';  
require_once '../models/product.class.php';

$products = Product::getAll($pdo);  // Logik wandert in die Klasse

header('Content-Type: application/json');
echo json_encode(array_map(fn($p) => $p->toArray(), $products));
?>
