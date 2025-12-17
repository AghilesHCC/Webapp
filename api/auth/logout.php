<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../utils/Auth.php';

try {
    $token = Auth::getBearerToken();

    if ($token) {
        $userData = Auth::validateToken($token);
        if ($userData) {
            error_log("User logout: {$userData->email} (ID: {$userData->id})");
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie'
    ]);

} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie'
    ]);
}
?>
