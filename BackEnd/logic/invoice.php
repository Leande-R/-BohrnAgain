<?php
session_start();

if (!isset($_SESSION['user_id']) || !isset($_GET['order_id'])) {
    die("Nicht autorisiert oder keine Bestellung ausgewählt.");
}

require_once(__DIR__ . '/../config/dbacess.php');

$orderId = (int)$_GET['order_id'];
$userId = (int)$_SESSION['user_id'];

// Bestellung und Benutzer prüfen
$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
$stmt->execute([$orderId, $userId]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    die("Bestellung nicht gefunden oder kein Zugriff erlaubt.");
}

// Benutzerdaten
$stmt = $pdo->prepare("SELECT firstname, lastname, address, PLZ, city, email FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Bestellpositionen
$stmt = $pdo->prepare("SELECT p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
$stmt->execute([$orderId]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Rechnung <?= htmlspecialchars($order['invoice_number']) ?></title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { margin-bottom: 40px; }
        .bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total-row td { font-weight: bold; border-top: 2px solid black; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Rechnung <?= htmlspecialchars($order['invoice_number']) ?></h2>
        <p><span class="bold">Datum:</span> <?= date('d.m.Y', strtotime($order['order_date'])) ?></p>
        <p><span class="bold">Kunde:</span><br>
            <?= htmlspecialchars($user['firstname']) . ' ' . htmlspecialchars($user['lastname']) ?><br>
            <?= htmlspecialchars($user['address']) ?><br>
            <?= htmlspecialchars($user['PLZ']) . ' ' . htmlspecialchars($user['city']) ?><br>
            <?= htmlspecialchars($user['email']) ?>
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Produkt</th>
                <th>Menge</th>
                <th>Einzelpreis</th>
                <th>Gesamt</th>
            </tr>
        </thead>
        <tbody>
        <?php $sum = 0; foreach ($items as $item):
            $total = $item['quantity'] * $item['price'];
            $sum += $total;
        ?>
            <tr>
                <td><?= htmlspecialchars($item['name']) ?></td>
                <td><?= $item['quantity'] ?></td>
                <td><?= number_format($item['price'], 2, ',', '.') ?> €</td>
                <td><?= number_format($total, 2, ',', '.') ?> €</td>
            </tr>
        <?php endforeach; ?>
        <tr class="total-row">
            <td colspan="3">Gesamtsumme</td>
            <td><?= number_format($sum, 2, ',', '.') ?> €</td>
        </tr>
        </tbody>
    </table>
</body>
</html>
