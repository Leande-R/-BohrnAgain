<?php
session_start();
header('Content-Type: application/json');

// Stelle sicher, dass ein Warenkorb existiert
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// POST: Produkt aus dem Warenkorb entfernen
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = $data['productId'] ?? null;

    if ($productId !== null) {
        $_SESSION['cart'] = array_filter($_SESSION['cart'], function($item) use ($productId) {
            return $item['id'] != $productId;
        });
        $_SESSION['cart'] = array_values($_SESSION['cart']); // reindex

        echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Produkt-ID fehlt']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Nur POST erlaubt']);
}