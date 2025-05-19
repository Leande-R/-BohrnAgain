<?php
require_once '../config/dbacess.php';

$statement = $pdo->query("SELECT * FROM categories");
$categories = [];

while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
    $categories[] = $row;
}

header('Content-Type: application/json');
echo json_encode($categories);
?>
