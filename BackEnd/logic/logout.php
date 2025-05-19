<?php
session_start();

// Alle Session-Variablen löschen
$_SESSION = [];

// Session zerstören - Status code verwenden! 
session_destroy();

// Cookie entfernen
if (isset($_COOKIE['rememberUser'])) {
    setcookie('rememberUser', '', time() - 3600, "/");
}

// Zurück zur Startseite
header("Location: ../../frontend/index.html");
exit;
?>
