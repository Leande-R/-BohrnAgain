<?php
session_start();
header('Content-Type: application/json');

$response = ['loggedIn' => false];

if (isset($_SESSION['user'])) {
    $response['loggedIn'] = true;
    $response['role'] = $_SESSION['user']['role'];
}

echo json_encode($response);
?>
