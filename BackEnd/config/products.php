<?php
require_once '../logic/productController.php';

header('Content-Type: application/json');
echo json_encode($products);
?>
