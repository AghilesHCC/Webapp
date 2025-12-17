<?php
/**
 * API: Liste des réservations
 * GET /api/reservations/index.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/Pagination.php';

try {
    $auth = Auth::verifyAuth();

    $db = Database::getInstance()->getConnection();

    // Pagination
    $pagination = Pagination::fromRequest();

    // Admin peut voir toutes les réservations, user seulement les siennes
    if ($auth['role'] === 'admin') {
        // Compter le total
        $total = Pagination::countTotal($db, 'reservations');

        $query = "SELECT r.*, e.nom as espace_nom, e.type as espace_type,
                         u.nom as user_nom, u.prenom as user_prenom, u.email as user_email
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  LEFT JOIN users u ON r.user_id = u.id
                  ORDER BY r.date_debut DESC
                  " . $pagination->getSqlLimit();
        $stmt = $db->prepare($query);
    } else {
        // Compter le total pour l'utilisateur
        $total = Pagination::countTotal($db, 'reservations', 'user_id = :user_id', [':user_id' => $auth['id']]);

        $query = "SELECT r.*, e.nom as espace_nom, e.type as espace_type
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  WHERE r.user_id = :user_id
                  ORDER BY r.date_debut DESC
                  " . $pagination->getSqlLimit();
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $auth['id']);
    }

    $stmt->execute();
    $reservations = $stmt->fetchAll();

    Response::success($pagination->formatResponse($reservations, $total));

} catch (Exception $e) {
    error_log("Reservations error: " . $e->getMessage());
    Response::serverError();
}
?>
