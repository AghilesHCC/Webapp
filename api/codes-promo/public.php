<?php
/**
 * API: Liste des codes promo publics actifs
 * GET /api/codes-promo/public.php
 * Accessible aux utilisateurs authentifiés
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth();

    $database = Database::getInstance();
    $db = $database->getConnection();

    $query = "SELECT id, code, type, valeur, date_debut, date_fin,
                     utilisations_max, utilisations_actuelles, description,
                     montant_min, types_application, created_at
              FROM codes_promo
              WHERE actif = 1
              AND date_debut <= NOW()
              AND date_fin >= NOW()
              AND (utilisations_max IS NULL OR utilisations_actuelles < utilisations_max)
              ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $codes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success($codes);

} catch (Exception $e) {
    error_log("Codes promo public error: " . $e->getMessage());
    Response::serverError("Erreur lors de la récupération des codes promo");
}
?>
