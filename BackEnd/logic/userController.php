<?php
// Fehler anzeigen (nur für Entwicklung – später deaktivieren)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Session starten
session_start();

// Header für JSON-Antwort
header('Content-Type: application/json');

// JSON-Daten einlesen
$input = json_decode(file_get_contents("php://input"), true);

// JSON-Validierung
if (!$input || !isset($input['action'])) {
    echo json_encode(['success' => false, 'error' => 'Ungültige oder fehlende JSON-Daten']);
    exit;
}

// DB & Klassen laden
require_once(__DIR__ . "/../config/dbacess.php");
require_once(__DIR__ . "/../models/user.class.php");

// Aktion extrahieren
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

        try {
            $stmt = $pdo->prepare("SELECT salutation, firstname, lastname, address, PLZ, city, email, username, payment_info FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Datenbankfehler: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["success" => false, "error" => "Unbekannte Aktion."]);
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

    // Passwortprüfung
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $stored = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$stored || !password_verify($userData['password'], $stored['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Passwort ist falsch.']);
        exit;
    }

    // Update durchführen
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

    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Daten erfolgreich gespeichert.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern.']);
    }

    break;  
    }

