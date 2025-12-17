<?php
/**
 * Script de diagnostic - Vérifier les données de réservation
 */

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $db = Database::getInstance()->getConnection();

    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Diagnostic Réservations</title>";
    echo "<style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .success { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        .error { background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
        .zero { background-color: #ffcccc !important; font-weight: bold; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px 0; }
        .btn:hover { background: #0056b3; }
    </style>
    </head><body><div class='container'>";

    echo "<h1>🔍 Diagnostic des Réservations</h1>";
    echo "<p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>";

    // Compter les réservations
    $stmt = $db->query('SELECT COUNT(*) as total FROM reservations');
    $totalReservations = $stmt->fetch()['total'];

    $stmt = $db->query('SELECT COUNT(*) as total FROM reservations WHERE montant_total = 0 OR montant_total IS NULL');
    $zeroMontants = $stmt->fetch()['total'];

    $stmt = $db->query('SELECT COALESCE(SUM(montant_total), 0) as total FROM reservations');
    $totalMontant = $stmt->fetch()['total'];

    echo "<div class='warning'>";
    echo "<h3>📊 Statistiques Globales</h3>";
    echo "<p><strong>Total réservations:</strong> {$totalReservations}</p>";
    echo "<p><strong>Réservations avec montant = 0:</strong> {$zeroMontants}</p>";
    echo "<p><strong>Montant total cumulé:</strong> " . number_format($totalMontant, 2, ',', ' ') . " DA</p>";
    echo "</div>";

    if ($zeroMontants > 0) {
        echo "<div class='error'>";
        echo "<h3>⚠️ PROBLÈME DÉTECTÉ</h3>";
        echo "<p>{$zeroMontants} réservation(s) ont un montant_total de 0 DA</p>";
        echo "<p>Cliquez sur le bouton ci-dessous pour corriger automatiquement :</p>";
        echo "<button class='btn' onclick='fixMontants()'>🔧 Corriger les montants</button>";
        echo "<div id='fix-result'></div>";
        echo "</div>";
    } else {
        echo "<div class='success'>";
        echo "<h3>✅ Tout est OK</h3>";
        echo "<p>Toutes les réservations ont un montant_total défini</p>";
        echo "</div>";
    }

    // Afficher les réservations récentes
    echo "<h2>📋 Dernières Réservations</h2>";

    $query = "SELECT
                r.id,
                r.montant_total,
                r.reduction,
                r.statut,
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

    echo "<table>";
    echo "<thead><tr>";
    echo "<th>ID</th><th>Client</th><th>Espace</th><th>Type</th><th>Montant Total</th><th>Réduction</th><th>Net</th><th>Statut</th><th>Date</th>";
    echo "</tr></thead><tbody>";

    foreach ($reservations as $r) {
        $isZero = (float)$r['montant_total'] == 0;
        $rowClass = $isZero ? 'zero' : '';
        $montantNet = (float)$r['montant_total'] - (float)($r['reduction'] ?? 0);

        echo "<tr class='{$rowClass}'>";
        echo "<td>" . htmlspecialchars(substr($r['id'], 0, 8)) . "...</td>";
        echo "<td>" . htmlspecialchars(($r['user_prenom'] ?? '') . ' ' . ($r['user_nom'] ?? '')) . "</td>";
        echo "<td>" . htmlspecialchars($r['espace_nom'] ?? 'N/A') . "</td>";
        echo "<td>" . htmlspecialchars($r['type_reservation'] ?? 'N/A') . "</td>";
        echo "<td>" . number_format((float)$r['montant_total'], 2, ',', ' ') . " DA</td>";
        echo "<td>" . number_format((float)($r['reduction'] ?? 0), 2, ',', ' ') . " DA</td>";
        echo "<td>" . number_format($montantNet, 2, ',', ' ') . " DA</td>";
        echo "<td>" . htmlspecialchars($r['statut']) . "</td>";
        echo "<td>" . htmlspecialchars($r['created_at']) . "</td>";
        echo "</tr>";
    }

    echo "</tbody></table>";

    // Script JavaScript pour corriger les montants
    echo "<script>
    async function fixMontants() {
        const btn = event.target;
        const resultDiv = document.getElementById('fix-result');

        btn.disabled = true;
        btn.textContent = '⏳ Correction en cours...';
        resultDiv.innerHTML = '<p>Veuillez patienter...</p>';

        try {
            const response = await fetch('/api/reservations/fix-montants.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                resultDiv.innerHTML = `
                    <div class='success'>
                        <h3>✅ Correction réussie !</h3>
                        <p><strong>${data.data.updated}</strong> réservation(s) corrigée(s)</p>
                        <p>Rechargez la page pour voir les résultats</p>
                        <button class='btn' onclick='location.reload()'>🔄 Recharger la page</button>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `<div class='error'><p>❌ Erreur: ${data.error || 'Erreur inconnue'}</p></div>`;
                btn.disabled = false;
                btn.textContent = '🔧 Réessayer';
            }
        } catch (error) {
            resultDiv.innerHTML = `<div class='error'><p>❌ Erreur: ${error.message}</p></div>`;
            btn.disabled = false;
            btn.textContent = '🔧 Réessayer';
        }
    }
    </script>";

    echo "</div></body></html>";

} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h1>❌ Erreur</h1>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
    error_log("Check DB data error: " . $e->getMessage());
}
