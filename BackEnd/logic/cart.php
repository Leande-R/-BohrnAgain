<?php
session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// DB-Verbindung und Model einbinden
require_once __DIR__ . '/../config/dbacess.php';
require_once __DIR__ . '/../models/product.class.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Produktdetails aus DB laden
function getProductData($pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, price FROM products WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Initialisiere Warenkorb, falls nicht vorhanden
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

switch ($requestMethod) {
    case 'GET':
        $headers = getallheaders();
        if (isset($headers['X-Cart-Count'])) {
            $count = array_sum(array_column($_SESSION['cart'], 'quantity'));
            echo json_encode(['cartCount' => $count]);
        } else {
            $result = [];
            foreach ($_SESSION['cart'] as $item) {
                if (!is_array($item)) continue;

                $result[] = [
                    'id' => $item['id'] ?? null,
                    'name' => $item['name'] ?? null,
                    'price' => isset($item['price']) ? (float)$item['price'] : 0,
                    'quantity' => $item['quantity'] ?? null,
                    'total' => (isset($item['price'], $item['quantity'])) ? ((float)$item['price']) * ((int)$item['quantity']) : 0
                ];
            }
            echo json_encode($result);
        }
        break;

    case 'POST':
        if (isset($input['productId']) && !isset($input['quantity'])) {
            $id = $input['productId'];
            $product = getProductData($pdo, $id);
            if (!$product) {
                echo json_encode(['success' => false, 'message' => 'Produkt nicht gefunden']);
                break;
            }
            if (isset($_SESSION['cart'][$id])) {
                $_SESSION['cart'][$id]['quantity'] += 1;
            } else {
                $_SESSION['cart'][$id] = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    'price' => (float)$product['price'],
                    'quantity' => 1
                ];
            }

            $count = array_sum(array_column($_SESSION['cart'], 'quantity'));
            echo json_encode(['success' => true, 'cartCount' => $count]);

        } elseif (isset($input['productId'], $input['quantity'])) {
            $id = $input['productId'];
            $quantity = max(1, (int)$input['quantity']);

            if (isset($_SESSION['cart'][$id])) {
                $_SESSION['cart'][$id]['quantity'] = $quantity;
                $count = array_sum(array_column($_SESSION['cart'], 'quantity'));
                echo json_encode(['success' => true, 'cartCount' => $count]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Produkt nicht im Warenkorb']);
            }

        } else {
            echo json_encode(['success' => false, 'message' => 'Ungültige Anfrage']);
        }
        break;

    case 'DELETE':
    if (isset($input['productId'])) {
        $id = $input['productId'];

        if (isset($_SESSION['cart'][$id])) {
            unset($_SESSION['cart'][$id]);
            $count = array_sum(array_column($_SESSION['cart'], 'quantity'));
            echo json_encode(['success' => true, 'cartCount' => $count]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Produkt nicht im Warenkorb']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Produkt-ID fehlt']);
    }
    break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Nicht erlaubte Methode']);
}
