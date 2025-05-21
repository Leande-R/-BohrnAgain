<?php
session_start();
header('Content-Type: application/json');

// Prüfen, ob der User eingeloggt ist
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Nicht eingeloggt.']);
    exit;
}

// Prüfen, ob der Warenkorb existiert und gültig ist
if (empty($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    echo json_encode(['success' => false, 'error' => 'Warenkorb ist leer.']);
    exit;
}

// Datenbankverbindung laden
require_once(__DIR__ . "/../config/dbacess.php");

try {
    $pdo->beginTransaction();

    $userId = $_SESSION['user_id'];
    $cart = $_SESSION['cart'];
    $total = 0;

    // Gesamtpreis berechnen
    foreach ($cart as $item) {
        $total += $item['price'] * $item['quantity'];
    }

    // Rechnungsnummer generieren
    $invoiceNumber = 'INV-' . strtoupper(bin2hex(random_bytes(5)));

    // Neue Bestellung anlegen
    $stmtOrder = $pdo->prepare("
        INSERT INTO orders (user_id, total, invoice_number, status)
        VALUES (?, ?, ?, 'offen')
    ");
    $stmtOrder->execute([$userId, $total, $invoiceNumber]);
    $orderId = $pdo->lastInsertId();

    // Produkte in order_items einfügen
    $stmtItem = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($cart as $item) {
        $stmtItem->execute([
            $orderId,
            $item['id'],
            $item['quantity'],
            $item['price']
        ]);
    }

    $pdo->commit();

    // Warenkorb leeren
    unset($_SESSION['cart']);

    echo json_encode(['success' => true, 'order_id' => $orderId]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => 'Bestellung fehlgeschlagen: ' . $e->getMessage()]);
}
