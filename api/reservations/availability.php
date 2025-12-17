<?php
require_once __DIR__ . '/../bootstrap.php';

try {
    $db = Database::getInstance()->getConnection();

    $espaceId = $_GET['espace_id'] ?? null;
    $dateDebut = $_GET['date_debut'] ?? null;
    $dateFin = $_GET['date_fin'] ?? null;
    $date = $_GET['date'] ?? null;

    if (!$espaceId) {
        Response::badRequest("L'ID de l'espace est requis");
    }

    $stmtEspace = $db->prepare("SELECT id, nom, type, capacite FROM espaces WHERE id = :id");
    $stmtEspace->execute([':id' => $espaceId]);
    $espace = $stmtEspace->fetch(PDO::FETCH_ASSOC);

    if (!$espace) {
        Response::notFound("Espace non trouvé");
    }

    $totalCapacity = (int)$espace['capacite'];

    if ($dateDebut && $dateFin) {
        $query = "SELECT r.id, r.date_debut, r.date_fin, r.participants, r.statut, r.user_id
                  FROM reservations r
                  WHERE r.espace_id = :espace_id
                  AND r.statut IN ('confirmee', 'en_attente', 'en_cours')
                  AND (
                      (r.date_debut < :date_fin AND r.date_fin > :date_debut)
                  )
                  ORDER BY r.date_debut ASC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':espace_id' => $espaceId,
            ':date_debut' => $dateDebut,
            ':date_fin' => $dateFin
        ]);
    } elseif ($date) {
        $startOfDay = $date . ' 00:00:00';
        $endOfDay = $date . ' 23:59:59';

        $query = "SELECT r.id, r.date_debut, r.date_fin, r.participants, r.statut, r.user_id
                  FROM reservations r
                  WHERE r.espace_id = :espace_id
                  AND r.statut IN ('confirmee', 'en_attente', 'en_cours')
                  AND (
                      (r.date_debut < :end_of_day AND r.date_fin > :start_of_day)
                  )
                  ORDER BY r.date_debut ASC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':espace_id' => $espaceId,
            ':start_of_day' => $startOfDay,
            ':end_of_day' => $endOfDay
        ]);
    } else {
        $now = date('Y-m-d H:i:s');
        $endOfWeek = date('Y-m-d H:i:s', strtotime('+7 days'));

        $query = "SELECT r.id, r.date_debut, r.date_fin, r.participants, r.statut, r.user_id
                  FROM reservations r
                  WHERE r.espace_id = :espace_id
                  AND r.statut IN ('confirmee', 'en_attente', 'en_cours')
                  AND r.date_fin > :now
                  AND r.date_debut < :end_of_week
                  ORDER BY r.date_debut ASC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':espace_id' => $espaceId,
            ':now' => $now,
            ':end_of_week' => $endOfWeek
        ]);
    }

    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedReservations = array_map(function($r) {
        return [
            'id' => $r['id'],
            'dateDebut' => $r['date_debut'],
            'dateFin' => $r['date_fin'],
            'participants' => (int)$r['participants'],
            'statut' => $r['statut']
        ];
    }, $reservations);

    $reservedSeats = 0;
    if ($dateDebut && $dateFin) {
        foreach ($reservations as $r) {
            $reservedSeats += (int)$r['participants'];
        }
    }

    $availableSeats = max(0, $totalCapacity - $reservedSeats);

    $timeSlots = [];
    if ($date) {
        for ($hour = 8; $hour < 20; $hour++) {
            $slotStart = $date . ' ' . sprintf('%02d:00:00', $hour);
            $slotEnd = $date . ' ' . sprintf('%02d:00:00', $hour + 1);

            $slotReserved = 0;
            foreach ($reservations as $r) {
                $resStart = strtotime($r['date_debut']);
                $resEnd = strtotime($r['date_fin']);
                $slotStartTs = strtotime($slotStart);
                $slotEndTs = strtotime($slotEnd);

                if ($resStart < $slotEndTs && $resEnd > $slotStartTs) {
                    $slotReserved += (int)$r['participants'];
                }
            }

            $timeSlots[] = [
                'heure' => sprintf('%02d:00', $hour),
                'heureDebut' => $slotStart,
                'heureFin' => $slotEnd,
                'placesReservees' => $slotReserved,
                'placesDisponibles' => max(0, $totalCapacity - $slotReserved),
                'disponible' => ($totalCapacity - $slotReserved) > 0
            ];
        }
    }

    $response = [
        'espaceId' => $espaceId,
        'espaceNom' => $espace['nom'],
        'espaceType' => $espace['type'],
        'capaciteTotale' => $totalCapacity,
        'placesReservees' => $reservedSeats,
        'placesDisponibles' => $availableSeats,
        'tauxOccupation' => $totalCapacity > 0 ? round(($reservedSeats / $totalCapacity) * 100, 1) : 0,
        'reservations' => $formattedReservations,
        'creneaux' => $timeSlots,
        'periode' => [
            'debut' => $dateDebut ?? ($date ? $date . ' 00:00:00' : null),
            'fin' => $dateFin ?? ($date ? $date . ' 23:59:59' : null)
        ]
    ];

    Response::success($response);

} catch (Exception $e) {
    error_log("Availability check error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::serverError("Erreur lors de la vérification de la disponibilité");
}
