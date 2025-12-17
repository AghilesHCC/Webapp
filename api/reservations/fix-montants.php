<?php
/**
 * Script de correction - Recalculer les montants des réservations
 * Ce script met à jour les montants_total à 0 en les recalculant selon le type de réservation
 */

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Vérifier que c'est un admin qui exécute ce script
    $auth = Auth::verifyAuth();
    if ($auth['role'] !== 'admin') {
        Response::error('Accès non autorisé', 403);
    }

    $db = Database::getInstance()->getConnection();

    // Fonction pour calculer le montant selon le type de réservation
    function calculateAmount($typeReservation, $espace) {
        $amount = 0;

        switch ($typeReservation) {
            case 'heure':
                $amount = (float)$espace['prix_heure'];
                break;
            case 'demi_journee':
                $amount = (float)$espace['prix_demi_journee'];
                break;
            case 'jour':
            case 'journee':
                $amount = (float)$espace['prix_jour'];
                break;
            case 'semaine':
                $amount = (float)$espace['prix_semaine'];
                break;
            default:
                // Par défaut, utiliser le prix à l'heure
                $amount = (float)$espace['prix_heure'];
                break;
        }

        return $amount;
    }

    // Récupérer toutes les réservations avec montant_total = 0
    $query = "SELECT
                r.id,
                r.espace_id,
                r.type_reservation,
                r.montant_total,
                r.reduction,
                e.prix_heure,
                e.prix_demi_journee,
                e.prix_jour,
                e.prix_semaine
              FROM reservations r
              LEFT JOIN espaces e ON r.espace_id = e.id
              WHERE r.montant_total = 0 OR r.montant_total IS NULL";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($reservations)) {
        Response::success([
            'updated' => 0,
            'message' => 'Toutes les réservations ont déjà un montant_total défini'
        ]);
    }

    $updated = 0;
    $errors = [];

    foreach ($reservations as $reservation) {
        try {
            // Récupérer les données de l'espace
            $espace = [
                'prix_heure' => $reservation['prix_heure'],
                'prix_demi_journee' => $reservation['prix_demi_journee'],
                'prix_jour' => $reservation['prix_jour'],
                'prix_semaine' => $reservation['prix_semaine']
            ];

            // Calculer le montant
            $montantTotal = calculateAmount($reservation['type_reservation'], $espace);

            // Si le montant est toujours 0, utiliser un montant par défaut
            if ($montantTotal == 0) {
                // Utiliser le prix jour comme fallback
                $montantTotal = (float)$espace['prix_jour'];
            }

            // Mettre à jour la réservation
            if ($montantTotal > 0) {
                $updateQuery = "UPDATE reservations
                               SET montant_total = :montant_total,
                                   updated_at = NOW()
                               WHERE id = :id";

                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([
                    ':montant_total' => $montantTotal,
                    ':id' => $reservation['id']
                ]);

                $updated++;
                error_log("Updated reservation {$reservation['id']}: {$montantTotal} DA");
            } else {
                $errors[] = [
                    'id' => $reservation['id'],
                    'error' => 'Impossible de calculer le montant (tous les prix sont à 0)'
                ];
            }

        } catch (Exception $e) {
            $errors[] = [
                'id' => $reservation['id'],
                'error' => $e->getMessage()
            ];
            error_log("Error updating reservation {$reservation['id']}: " . $e->getMessage());
        }
    }

    Response::success([
        'updated' => $updated,
        'total' => count($reservations),
        'errors' => $errors
    ], "Montants des réservations mis à jour avec succès");

} catch (Exception $e) {
    error_log("Fix montants error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::serverError("Erreur lors de la correction des montants");
}
