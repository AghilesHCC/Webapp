<?php
require_once __DIR__ . '/../bootstrap.php';

try {
    $auth = Auth::verifyAuth();
    $db = Database::getInstance()->getConnection();
    
    $pagination = Pagination::fromRequest();
    
    if ($auth['role'] === 'admin') {
        $total = Pagination::countTotal($db, 'reservations');
        
        $query = "SELECT r.*, 
                         e.nom as espace_nom, e.type as espace_type, e.capacite as espace_capacite,
                         u.nom as user_nom, u.prenom as user_prenom, u.email as user_email, u.telephone as user_telephone
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  LEFT JOIN users u ON r.user_id = u.id
                  ORDER BY r.created_at DESC
                  " . $pagination->getSqlLimit();
        $stmt = $db->prepare($query);
    } else {
        $total = Pagination::countTotal($db, 'reservations', 'user_id = :user_id', [':user_id' => $auth['id']]);
        
        $query = "SELECT r.*, 
                         e.nom as espace_nom, e.type as espace_type, e.capacite as espace_capacite,
                         e.description as espace_description, e.equipements as espace_equipements
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  WHERE r.user_id = :user_id
                  ORDER BY r.created_at DESC
                  " . $pagination->getSqlLimit();
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $auth['id']);
    }
    
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formatted = array_map(function($r) {
        $userData = isset($r['user_nom']) ? [
            'nom' => $r['user_nom'],
            'prenom' => $r['user_prenom'],
            'email' => $r['user_email'],
            'telephone' => $r['user_telephone'] ?? null
        ] : null;

        return [
            'id' => $r['id'],
            'userId' => $r['user_id'],
            'espaceId' => $r['espace_id'],
            'dateDebut' => $r['date_debut'],
            'dateFin' => $r['date_fin'],
            'statut' => $r['statut'],
            'typeReservation' => $r['type_reservation'],
            'montantTotal' => (float)$r['montant_total'],
            'reduction' => (float)$r['reduction'],
            'codePromoId' => $r['code_promo_id'],
            'montantPaye' => (float)$r['montant_paye'],
            'modePaiement' => $r['mode_paiement'],
            'notes' => $r['notes'],
            'participants' => (int)$r['participants'],
            'createdAt' => $r['created_at'],
            'updatedAt' => $r['updated_at'],
            'dateCreation' => $r['created_at'],
            'espace' => [
                'nom' => $r['espace_nom'] ?? null,
                'type' => $r['espace_type'] ?? null,
                'capacite' => isset($r['espace_capacite']) ? (int)$r['espace_capacite'] : null
            ],
            'user' => $userData,
            'utilisateur' => $userData
        ];
    }, $reservations);
    
    Response::success($pagination->formatResponse($formatted, $total));
    
} catch (Exception $e) {
    error_log("Reservations index error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::serverError("Erreur lors de la récupération des réservations");
}
