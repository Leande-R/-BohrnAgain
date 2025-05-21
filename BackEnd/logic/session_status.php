<?php
header('Content-Type: application/json');
ini_set('session.cookie_samesite', 'Lax');
session_start();

$response = [
    'loggedIn' => false,
    'username' => null,
    'role' => null
];

// Bereits eingeloggt?
if (isset($_SESSION['user_id'])) {
    $response['loggedIn'] = true;
    $response['username'] = $_SESSION['username'];
    $response['role'] = $_SESSION['role'];
    echo json_encode($response);
    exit;
}

// Nicht eingeloggt → Cookie vorhanden?
if (isset($_COOKIE['rememberUser'])) {
    require_once(__DIR__ . "/../config/dbacess.php");

    $stmt = $pdo->prepare("SELECT * FROM users WHERE remember_token = ?");
    $stmt->execute([$_COOKIE['rememberUser']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && $user['is_active']) {
        // Session neu setzen
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        $response['loggedIn'] = true;
        $response['username'] = $user['username'];
        $response['role'] = $user['role'];
    }
}

echo json_encode($response);
