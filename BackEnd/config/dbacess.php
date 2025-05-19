<?php
$host = 'localhost';
$db = 'bohrnagaindb';
$user = 'root';
$pass = 'root'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
} catch (PDOException $e) {
    die("Verbindung fehlgeschlagen: " . $e->getMessage());
}
?>
