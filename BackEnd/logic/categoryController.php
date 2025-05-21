<?php
require_once '../config/dbacess.php';

$statement = $pdo->query("SELECT * FROM categories");
$categories = [];

// Speichert alle Zeilen als assoziative Arrays im $categories-Array
while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
    $categories[] = $row;
}
// Gibt die Daten als JSON zurück
header('Content-Type: application/json');
echo json_encode($categories);
?>
