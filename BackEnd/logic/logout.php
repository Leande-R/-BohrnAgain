<?php
header('Content-Type: application/json');
session_start();

require_once(__DIR__ . "/../config/dbacess.php");

// Session-User auslesen (bevor Session gelöscht wird)
$userId = $_SESSION['user_id'] ?? null;

// Session löschen
$_SESSION = [];
session_destroy();

// Cookie entfernen
setcookie("rememberUser", "", time() - 3600, "/");

// Token aus DB löschen (wenn vorhanden)
if ($userId) {
    $stmt = $pdo->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
    $stmt->execute([$userId]);
}

echo json_encode(['success' => true]);
