<?php
/**
 * API: Liste des demandes de domiciliation
 * GET /api/domiciliations/index.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth();

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Admin voit tout, user voit seulement les siennes
    if ($auth['role'] === 'admin') {
        $query = "SELECT d.*, u.email, u.nom, u.prenom
                  FROM domiciliations d
                  LEFT JOIN users u ON d.user_id = u.id
                  ORDER BY d.created_at DESC";
        $stmt = $db->prepare($query);
    } else {
        $query = "SELECT * FROM domiciliations
                  WHERE user_id = :user_id
                  ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $auth['id']);
    }

    $stmt->execute();
    $domiciliations = $stmt->fetchAll();

    Response::success($domiciliations);

} catch (Exception $e) {
    error_log("Get domiciliations error: " . $e->getMessage());
    Response::serverError();
}
?>
