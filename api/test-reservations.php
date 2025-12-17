<?php
/**
 * Script de test pour vérifier les données des réservations
 */

require_once __DIR__ . '/bootstrap.php';

try {
    $db = Database::getInstance()->getConnection();

    // Récupérer toutes les réservations avec leurs détails
    $query = "SELECT
                r.id,
                r.user_id,
                r.espace_id,
                r.statut,
                r.montant_total,
                r.type_reservation,
                r.created_at,
                e.nom as espace_nom,
                u.nom as user_nom,
                u.prenom as user_prenom
              FROM reservations r
              LEFT JOIN espaces e ON r.espace_id = e.id
              LEFT JOIN users u ON r.user_id = u.id
              ORDER BY r.created_at DESC
              LIMIT 10";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Test Réservations</title>";
    echo "<style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .warning { background-color: #fff3cd; padding: 10px; border: 1px solid #ffc107; margin-bottom: 20px; }
        .info { background-color: #d1ecf1; padding: 10px; border: 1px solid #0c5460; margin-bottom: 20px; }
    </style>
    </head><body>";

    echo "<h1>Test des Réservations - Base de Données</h1>";
    echo "<p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>";

    $totalCount = count($reservations);
    $zeroMontants = array_filter($reservations, function($r) {
        return (float)$r['montant_total'] == 0;
    });
    $countZero = count($zeroMontants);

    if ($countZero > 0) {
        echo "<div class='warning'>";
        echo "<strong>⚠️ Attention:</strong> {$countZero} réservation(s) sur {$totalCount} ont un montant_total de 0 DA";
        echo "</div>";
    } else {
        echo "<div class='info'>";
        echo "<strong>✓ Info:</strong> Toutes les réservations ont un montant_total défini";
        echo "</div>";
    }

    echo "<h2>Liste des réservations (10 dernières)</h2>";
    echo "<table>";
    echo "<thead><tr>";
    echo "<th>ID</th>";
    echo "<th>Client</th>";
    echo "<th>Espace</th>";
    echo "<th>Statut</th>";
    echo "<th>Type</th>";
    echo "<th>Montant Total</th>";
    echo "<th>Date création</th>";
    echo "</tr></thead>";
    echo "<tbody>";

    if (empty($reservations)) {
        echo "<tr><td colspan='7' style='text-align: center; padding: 20px;'>Aucune réservation trouvée</td></tr>";
    } else {
        foreach ($reservations as $r) {
            $montantStyle = (float)$r['montant_total'] == 0 ? "style='background-color: #ffcccc; font-weight: bold;'" : "";
            echo "<tr>";
            echo "<td>" . htmlspecialchars(substr($r['id'], 0, 8)) . "...</td>";
            echo "<td>" . htmlspecialchars($r['user_prenom'] . ' ' . $r['user_nom']) . "</td>";
            echo "<td>" . htmlspecialchars($r['espace_nom']) . "</td>";
            echo "<td>" . htmlspecialchars($r['statut']) . "</td>";
            echo "<td>" . htmlspecialchars($r['type_reservation'] ?? 'N/A') . "</td>";
            echo "<td {$montantStyle}>" . number_format((float)$r['montant_total'], 2, ',', ' ') . " DA</td>";
            echo "<td>" . htmlspecialchars($r['created_at']) . "</td>";
            echo "</tr>";
        }
    }

    echo "</tbody></table>";

    // Statistiques supplémentaires
    echo "<h2>Statistiques</h2>";

    $query = "SELECT COUNT(*) as total FROM reservations";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalReservations = $stmt->fetch()['total'];

    $query = "SELECT COALESCE(SUM(montant_total), 0) as total FROM reservations WHERE statut IN ('confirmee', 'terminee')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalRevenue = $stmt->fetch()['total'];

    $query = "SELECT COUNT(*) as total FROM reservations WHERE montant_total = 0";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $reservationsWithZero = $stmt->fetch()['total'];

    echo "<table>";
    echo "<tr><td><strong>Total réservations:</strong></td><td>{$totalReservations}</td></tr>";
    echo "<tr><td><strong>Réservations avec montant = 0:</strong></td><td>{$reservationsWithZero}</td></tr>";
    echo "<tr><td><strong>Revenu total (confirmées/terminées):</strong></td><td>" . number_format((float)$totalRevenue, 2, ',', ' ') . " DA</td></tr>";
    echo "</table>";

    echo "</body></html>";

} catch (Exception $e) {
    echo "<h1>Erreur</h1>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    error_log("Test reservations error: " . $e->getMessage());
}
