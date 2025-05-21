<?php
require_once '../config/dbacess.php';
require_once '../models/product.class.php';

session_start();
header('Content-Type: application/json');

// GET → Alle Produkte
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $products = Product::getAll($pdo);
    echo json_encode(array_map(fn($p) => $p->toArray(), $products));
    exit;
}

// Nur Admins dürfen POST-Aktionen durchführen
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Zugriff verweigert']);
        exit;
    }

    // JSON-Daten prüfen (z. B. DELETE)
    $json = json_decode(file_get_contents("php://input"), true);
    if ($json && $json['action'] === 'delete' && isset($json['id'])) {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$json['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    // Datei-Upload prüfen
    $imagePath = null;
    if (!empty($_FILES['image']['tmp_name'])) {
        $uploadDir = __DIR__ . '/../productpictures/';
        $file = $_FILES['image'];
        $filename = basename($file['name']);
        $targetFile = $uploadDir . $filename;

        $allowedTypes = ['image/jpeg', 'image/png'];
        $imageType = mime_content_type($file['tmp_name']);

        if (!in_array($imageType, $allowedTypes)) {
            echo json_encode(['success' => false, 'error' => 'Nur JPG- und PNG-Dateien erlaubt.']);
            exit;
        }

        if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
            echo json_encode(['success' => false, 'error' => 'Datei-Upload fehlgeschlagen.']);
            exit;
        }

        $imagePath = $filename;
    }

    // Produkt anlegen
    if ($_POST['action'] === 'create') {
        $required = ['name', 'description', 'price', 'rating', 'category_id'];
        foreach ($required as $field) {
            if (empty($_POST[$field])) {
                echo json_encode(['success' => false, 'error' => 'Fehlende Pflichtfelder.']);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO products (name, description, price, image, rating, category_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $_POST['name'],
            $_POST['description'],
            $_POST['price'],
            $imagePath,
            $_POST['rating'],
            $_POST['category_id']
        ]);

        echo json_encode(['success' => true]);
        exit;
    }

    // Produkt aktualisieren
    if ($_POST['action'] === 'update') {
        $required = ['id', 'name', 'description', 'price', 'rating', 'category_id'];
        foreach ($required as $field) {
            if (empty($_POST[$field])) {
                echo json_encode(['success' => false, 'error' => 'Fehlende Pflichtfelder.']);
                exit;
            }
        }

        if ($imagePath) {
            $stmt = $pdo->prepare("
                UPDATE products SET
                    name = ?, description = ?, price = ?, image = ?, rating = ?, category_id = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $_POST['name'],
                $_POST['description'],
                $_POST['price'],
                $imagePath,
                $_POST['rating'],
                $_POST['category_id'],
                $_POST['id']
            ]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE products SET
                    name = ?, description = ?, price = ?, rating = ?, category_id = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $_POST['name'],
                $_POST['description'],
                $_POST['price'],
                $_POST['rating'],
                $_POST['category_id'],
                $_POST['id']
            ]);
        }

        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Ungültige Aktion']);
    exit;
}
