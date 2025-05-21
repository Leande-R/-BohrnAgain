<?php
error_log("Eingehender Body: " . file_get_contents("php://input"));

session_start();
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['action'])) {
    echo json_encode(['success' => false, 'error' => 'Ungültige oder fehlende JSON-Daten']);
    exit;
}

require_once(__DIR__ . "/../config/dbacess.php");
require_once(__DIR__ . "/../models/user.class.php");

$action = $input['action'];

switch ($action) {

    case 'register':
        $userData = $input['user'] ?? null;
        if (!$userData) {
            echo json_encode(["success" => false, "error" => "Keine Benutzerdaten übermittelt."]);
            exit;
        }

        $user = new User($userData);
        $valid = $user->validate();
        if ($valid !== true) {
            echo json_encode(["success" => false, "error" => $valid]);
            exit;
        }

        $result = $user->save($pdo);
        echo json_encode(["success" => $result === true, "error" => $result !== true ? $result : null]);
        break;

    case 'login':
        $identifier = $input['identifier'] ?? '';
        $password = $input['password'] ?? '';
        $remember = isset($input['rememberMe']) && $input['rememberMe'] === 'on';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            if (!$user['is_active']) {
                echo json_encode(['success' => false, 'error' => 'Konto wurde deaktiviert.']);
                exit;
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $user['username'];

            if ($remember) {
                $token = bin2hex(random_bytes(32));
                $stmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
                $stmt->execute([$token, $user['id']]);
                setcookie("rememberUser", $token, time() + (60 * 60 * 24 * 7), "/", "", false, true);
            }

            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Benutzername oder Passwort ungültig.']);
        }
        break;

    case 'getUserData':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Nicht eingeloggt']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT salutation, firstname, lastname, address, PLZ, city, email, username, payment_info FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        echo $user
            ? json_encode(['success' => true, 'user' => $user])
            : json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
        break;

    case 'updateUserData':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'Nicht eingeloggt.']);
            exit;
        }

        $userData = $input['user'] ?? null;
        if (!$userData) {
            echo json_encode(['success' => false, 'message' => 'Keine Benutzerdaten empfangen.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $stored = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$stored || !password_verify($userData['password'], $stored['password_hash'])) {
            echo json_encode(['success' => false, 'message' => 'Passwort ist falsch.']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE users SET
                salutation = :salutation,
                firstname = :firstname,
                lastname = :lastname,
                address = :address,
                PLZ = :PLZ,
                city = :city,
                email = :email,
                username = :username,
                payment_info = :payment_info
            WHERE id = :id
        ");

        $success = $stmt->execute([
            ':salutation' => $userData['salutation'],
            ':firstname' => $userData['firstname'],
            ':lastname' => $userData['lastname'],
            ':address' => $userData['address'],
            ':PLZ' => $userData['PLZ'],
            ':city' => $userData['city'],
            ':email' => $userData['email'],
            ':username' => $userData['username'],
            ':payment_info' => $userData['payment_info'],
            ':id' => $_SESSION['user_id']
        ]);

        echo json_encode(['success' => $success, 'message' => $success ? 'Daten erfolgreich gespeichert.' : 'Fehler beim Speichern.']);
        break;

    case 'getUserOrders':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Nicht eingeloggt']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, order_date, invoice_number, total, status
                               FROM orders
                               WHERE user_id = ?
                               ORDER BY order_date ASC");
        $stmt->execute([$_SESSION['user_id']]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'orders' => $orders]);
        break;

    case 'getOrderDetails':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Nicht eingeloggt']);
            exit;
        }

        $orderId = $input['order_id'] ?? null;
        if (!$orderId) {
            echo json_encode(['success' => false, 'error' => 'Bestell-ID fehlt']);
            exit;
        }

        $check = $pdo->prepare("SELECT id FROM orders WHERE id = ? AND user_id = ?");
        $check->execute([$orderId, $_SESSION['user_id']]);
        if ($check->rowCount() === 0) {
            echo json_encode(['success' => false, 'error' => 'Zugriff verweigert']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT oi.quantity, oi.price, p.name
                               FROM order_items oi
                               JOIN products p ON oi.product_id = p.id
                               WHERE oi.order_id = ?");
        $stmt->execute([$orderId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'items' => $items]);
        break;

    case 'getAllUsers':
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            echo json_encode(['success' => false, 'error' => 'Nicht autorisiert']);
            exit;
        }

        $stmt = $pdo->query("SELECT id, firstname, lastname, email, city, is_active FROM users WHERE role = 'user'");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'users' => $users]);
        break;




        case 'getUserOrdersByAdmin':
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            echo json_encode(['success' => false, 'error' => 'Nicht autorisiert']);
            exit;
        }

        $targetUserId = $input['user_id'] ?? null;
        if (!$targetUserId) {
            echo json_encode(['success' => false, 'error' => 'User-ID fehlt']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, order_date, invoice_number, total, status
                               FROM orders
                               WHERE user_id = ?
                               ORDER BY order_date ASC");
        $stmt->execute([$targetUserId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'orders' => $orders]);
        break;
    



 
            case 'deactivateUser':
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            echo json_encode(['success' => false, 'error' => 'Nicht autorisiert']);
            exit;
        }

        $targetUserId = $input['user_id'] ?? null;
        if (!$targetUserId) {
            echo json_encode(['success' => false, 'error' => 'User-ID fehlt']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE users SET is_active = 0 WHERE id = ?");
        $success = $stmt->execute([$targetUserId]);

        echo json_encode(['success' => $success]);
        break;

       

    default:
        echo json_encode(["success" => false, "error" => "Unbekannte Aktion."]);
        break;
}
?>