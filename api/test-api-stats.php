<?php
/**
 * Test de l'API Stats - Afficher ce que l'API retourne
 */

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Test API Stats</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { background: white; padding: 20px; border-radius: 8px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .success { background: #d4edda; border-color: #c3e6cb; }
    .warning { background: #fff3cd; border-color: #ffc107; }
    .error { background: #f8d7da; border-color: #f5c6cb; }
</style>
</head><body><div class='container'>";

echo "<h1>🧪 Test de l'API Stats</h1>";

try {
    $db = Database::getInstance()->getConnection();

    echo "<div class='section'>";
    echo "<h2>1️⃣ Données Brutes - Base de Données</h2>";

    // Test direct sur la base
    $tests = [
        'Total réservations' => "SELECT COUNT(*) as count FROM reservations",
        'Réservations avec montant > 0' => "SELECT COUNT(*) as count FROM reservations WHERE montant_total > 0",
        'Réservations avec montant = 0' => "SELECT COUNT(*) as count FROM reservations WHERE montant_total = 0 OR montant_total IS NULL",
        'Revenu total (confirmées/terminées)' => "SELECT COALESCE(SUM(montant_total - COALESCE(reduction, 0)), 0) as total FROM reservations WHERE statut IN ('confirmee', 'terminee')",
        'Revenu total (toutes)' => "SELECT COALESCE(SUM(montant_total), 0) as total FROM reservations",
        'Total users' => "SELECT COUNT(*) as count FROM users",
    ];

    foreach ($tests as $label => $query) {
        $stmt = $db->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $value = isset($result['count']) ? $result['count'] : $result['total'];
        echo "<p><strong>{$label}:</strong> " . number_format($value, 2, ',', ' ') . "</p>";
    }

    echo "</div>";

    echo "<div class='section'>";
    echo "<h2>2️⃣ Réponse de l'API Stats</h2>";
    echo "<p>Simulation de l'appel à <code>/api/admin/stats.php</code></p>";

    // Simuler l'appel à l'API stats
    ob_start();
    $_SERVER['REQUEST_METHOD'] = 'GET';

    try {
        // Inclure le fichier stats directement
        $statsFile = __DIR__ . '/admin/stats.php';
        if (file_exists($statsFile)) {
            include $statsFile;
            $output = ob_get_clean();

            // Essayer de décoder le JSON
            $json = json_decode($output, true);

            if ($json) {
                echo "<h3>✅ Réponse JSON valide</h3>";
                echo "<pre>" . json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";

                // Vérifier les valeurs importantes
                $checks = [
                    'totalUsers' => $json['data']['totalUsers'] ?? 'N/A',
                    'totalReservations' => $json['data']['totalReservations'] ?? 'N/A',
                    'monthlyRevenue' => $json['data']['monthlyRevenue'] ?? 'N/A',
                    'totalRevenue' => $json['data']['totalRevenue'] ?? 'N/A',
                ];

                echo "<h3>🔍 Valeurs Clés</h3>";
                foreach ($checks as $key => $value) {
                    $style = ($key === 'monthlyRevenue' || $key === 'totalRevenue') && $value == 0 ? 'style="color: red; font-weight: bold;"' : '';
                    echo "<p {$style}><strong>{$key}:</strong> " . (is_numeric($value) ? number_format($value, 2, ',', ' ') : $value) . "</p>";
                }
            } else {
                echo "<div class='section error'>";
                echo "<h3>❌ Erreur de décodage JSON</h3>";
                echo "<pre>" . htmlspecialchars($output) . "</pre>";
                echo "</div>";
            }
        } else {
            echo "<div class='section error'>❌ Fichier stats.php introuvable</div>";
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo "<div class='section error'>";
        echo "<h3>❌ Erreur lors de l'appel API</h3>";
        echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
        echo "</div>";
    }

    echo "</div>";

    echo "<div class='section'>";
    echo "<h2>3️⃣ Échantillon de Réservations</h2>";

    $query = "SELECT id, montant_total, reduction, statut, type_reservation, created_at
              FROM reservations
              ORDER BY created_at DESC
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<table style='width: 100%; border-collapse: collapse;'>";
    echo "<tr style='background: #f8f9fa;'><th style='padding: 10px; border: 1px solid #ddd;'>ID</th><th style='padding: 10px; border: 1px solid #ddd;'>Montant</th><th style='padding: 10px; border: 1px solid #ddd;'>Réduction</th><th style='padding: 10px; border: 1px solid #ddd;'>Statut</th><th style='padding: 10px; border: 1px solid #ddd;'>Type</th></tr>";

    foreach ($reservations as $r) {
        $style = (float)$r['montant_total'] == 0 ? "style='background: #ffcccc;'" : "";
        echo "<tr {$style}>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . substr($r['id'], 0, 8) . "...</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . number_format((float)$r['montant_total'], 2, ',', ' ') . " DA</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . number_format((float)($r['reduction'] ?? 0), 2, ',', ' ') . " DA</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($r['statut']) . "</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($r['type_reservation'] ?? 'N/A') . "</td>";
        echo "</tr>";
    }

    echo "</table>";
    echo "</div>";

    echo "<div class='section success'>";
    echo "<h2>🔧 Actions</h2>";
    echo "<p><a href='/api/check-db-data.php' style='display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;'>Voir le diagnostic complet</a></p>";
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='section error'>";
    echo "<h3>❌ Erreur</h3>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
}

echo "</div></body></html>";
