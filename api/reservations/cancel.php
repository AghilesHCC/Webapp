<?php
/**
 * API: Annuler une réservation
 * POST /api/reservations/cancel.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth();
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->id)) {
        Response::error("ID réservation requis", 400);
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Vérifier que la réservation existe
    $query = "SELECT user_id, statut, date_debut FROM reservations WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        Response::error("Réservation non trouvée", 404);
    }

    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    // Les users ne peuvent annuler que leurs propres réservations
    if ($auth['role'] !== 'admin' && $reservation['user_id'] !== $auth['id']) {
        Response::error("Accès non autorisé", 403);
    }

    // Vérifier qu'elle n'est pas déjà annulée
    if ($reservation['statut'] === 'annulee') {
        Response::error("Cette réservation est déjà annulée", 400);
    }

    // Vérifier la règle des 24h avant (sauf pour les admins)
    if ($auth['role'] !== 'admin') {
        $dateDebut = new DateTime($reservation['date_debut']);
        $now = new DateTime();
        $diff = $dateDebut->getTimestamp() - $now->getTimestamp();
        $heuresRestantes = $diff / 3600;

        if ($heuresRestantes < 24) {
            Response::error("L'annulation n'est possible que 24h avant le début de la réservation", 400);
        }
    }

    // Annuler la réservation
    $query = "UPDATE reservations SET statut = 'annulee' WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();

    Response::success(null, "Réservation annulée avec succès");

} catch (Exception $e) {
    error_log("Cancel reservation error: " . $e->getMessage());
    Response::serverError("Erreur lors de l'annulation");
}
?>
