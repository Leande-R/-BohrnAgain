<?php
session_start();
require_once '../config/dbacess.php'; // Stellt PDO-Verbindung zur DB her

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usernameOrEmail = $_POST['username'];
    $password = $_POST['password'];

    // Benutzer anhand von Username oder E-Mail suchen
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :user OR email = :user LIMIT 1");
    $stmt->execute(['user' => $usernameOrEmail]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Passwort-Hash prüfen (Achtung: Feld heißt 'password_hash')
    if ($user && password_verify($password, $user['password_hash'])) {

        // Session-Daten setzen
        $_SESSION['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ];

        // Optional: "Login merken"-Cookie setzen
        if (!empty($_POST['rememberMe'])) {
            setcookie('rememberUser', $user['username'], time() + (86400 * 30), "/"); // gültig für 30 Tage
        }

        // Weiterleitung je nach Rolle - niemals Weiterleitung --> nur JSOn + Status Codes verwenden! (200) - user als Json ohne PW
        if ($user['role'] === 'admin') {
            header("Location:../FrontEnd/index.html");
        } else {
            header("Location:../FrontEnd/index.html");
        }
        exit;
    } else {
        // Login fehlgeschlagen - niemals HTML-Output hier machen! --> JSON only -> Status Codes verwenden!
        echo "<p>Login fehlgeschlagen: Benutzername oder Passwort ungültig.</p>";
        echo "<a href='../../frontend/login.html'>Zurück zum Login</a>";
    }
}
?>
