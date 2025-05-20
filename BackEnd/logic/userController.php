<?php
// Immer JSON zurückgeben
header('Content-Type: application/json');

// JSON-Daten einlesen
$input = json_decode(file_get_contents("php://input"), true);

// JSON-Validierung
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
        if ($result === true) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $result]);
        }
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

            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $user['username'];

            if ($remember) {
                $token = bin2hex(random_bytes(32));
                $stmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
                $stmt->execute([$token, $user['id']]);

                setcookie("rememberUser", $token, time() + (60 * 60 * 24 * 7), "/"); // 7 Tage gültig
            }

            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Benutzername oder Passwort ungültig.']);
        }
        break;

    default:
        echo json_encode(["success" => false, "error" => "Unbekannte Aktion."]);
        break;
}
