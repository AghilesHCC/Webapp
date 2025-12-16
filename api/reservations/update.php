<?php
/**
 * API: Mise à jour d'une réservation
 * PUT /api/reservations/update.php
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

    // Vérifier que la réservation existe et appartient à l'utilisateur
    $query = "SELECT user_id FROM reservations WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        Response::error("Réservation non trouvée", 404);
    }

    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    // Les users ne peuvent modifier que leurs propres réservations
    if ($auth['role'] !== 'admin' && $reservation['user_id'] !== $auth['id']) {
        Response::error("Accès non autorisé", 403);
    }

    // Construire la requête de mise à jour
    $updateFields = [];
    $params = [':id' => $data->id];

    $allowedFields = ['date_debut', 'date_fin', 'participants', 'notes'];

    // Admin peut aussi modifier le statut et le mode de paiement
    if ($auth['role'] === 'admin') {
        $allowedFields[] = 'statut';
        $allowedFields[] = 'mode_paiement';
        $allowedFields[] = 'montant_paye';
    }

    foreach ($allowedFields as $field) {
        if (isset($data->$field)) {
            $value = $data->$field;

            // Convertir les dates ISO au format MySQL
            if ($field === 'date_debut' || $field === 'date_fin') {
                try {
                    $dateObj = new DateTime($value);
                    $value = $dateObj->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    Response::error("Format de date invalide pour $field", 400);
                }
            }

            $updateFields[] = "$field = :$field";
            $params[":$field"] = $value;
        }
    }

    if (empty($updateFields)) {
        Response::error("Aucune donnée à mettre à jour", 400);
    }

    // Si les dates sont modifiées, recalculer le montant côté serveur
    if (isset($data->date_debut) || isset($data->date_fin)) {
        // Récupérer les informations actuelles de la réservation
        $query = "SELECT r.*, e.prix_heure, e.prix_jour, e.prix_semaine
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  WHERE r.id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $data->id]);
        $currentReservation = $stmt->fetch(PDO::FETCH_ASSOC);

        $dateDebut = isset($data->date_debut) ? $data->date_debut : $currentReservation['date_debut'];
        $dateFin = isset($data->date_fin) ? $data->date_fin : $currentReservation['date_fin'];

        // Calculer le nouveau montant
        $debut = new DateTime($dateDebut);
        $fin = new DateTime($dateFin);
        $heures = ($fin->getTimestamp() - $debut->getTimestamp()) / 3600;

        if ($heures <= 0) {
            Response::error("Dates invalides", 400);
        }

        $montant_total = 0;
        $type_reservation = 'heure';

        if ($heures < 24) {
            $montant_total = ceil($heures) * $currentReservation['prix_heure'];
            $type_reservation = 'heure';
        } else {
            $jours = ceil($heures / 24);

            if ($jours >= 7 && !empty($currentReservation['prix_semaine'])) {
                $semaines = floor($jours / 7);
                $jours_restants = $jours % 7;
                $montant_total = ($semaines * $currentReservation['prix_semaine']) + ($jours_restants * $currentReservation['prix_jour']);
                $type_reservation = $semaines > 0 ? 'semaine' : 'jour';
            } else {
                $montant_total = $jours * $currentReservation['prix_jour'];
                $type_reservation = 'jour';
            }
        }

        // Conserver la réduction existante
        $montant_final = $montant_total - ($currentReservation['reduction'] ?? 0);

        // Ajouter les champs de montant à la mise à jour
        $updateFields[] = "montant_total = :montant_total";
        $params[":montant_total"] = $montant_total;
        $updateFields[] = "type_reservation = :type_reservation";
        $params[":type_reservation"] = $type_reservation;
    }

    $query = "UPDATE reservations SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute($params);

    Response::success(null, "Réservation mise à jour avec succès");

} catch (Exception $e) {
    error_log("Update reservation error: " . $e->getMessage());
    Response::serverError("Erreur lors de la mise à jour");
}
?>
