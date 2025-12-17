<?php
/**
 * Script de correction de la table domiciliations
 * À exécuter une seule fois via navigateur ou CLI
 */

require_once 'config/database.php';

header('Content-Type: application/json');

try {
    $database = Database::getInstance();
    $db = $database->getConnection();

    $results = [];

    // Liste des colonnes à ajouter
    $columnsToAdd = [
        'coordonnees_fiscales' => "ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_fiscales` TEXT DEFAULT NULL",
        'coordonnees_administratives' => "ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_administratives` TEXT DEFAULT NULL",
        'representant_fonction' => "ALTER TABLE `domiciliations` ADD COLUMN `representant_fonction` VARCHAR(100) DEFAULT NULL",
        'date_creation_entreprise' => "ALTER TABLE `domiciliations` ADD COLUMN `date_creation_entreprise` DATE DEFAULT NULL"
    ];

    foreach ($columnsToAdd as $columnName => $alterQuery) {
        // Vérifier si la colonne existe déjà
        $checkQuery = "SELECT COUNT(*) as count
                       FROM information_schema.COLUMNS
                       WHERE TABLE_SCHEMA = DATABASE()
                       AND TABLE_NAME = 'domiciliations'
                       AND COLUMN_NAME = :column_name";

        $stmt = $db->prepare($checkQuery);
        $stmt->bindParam(':column_name', $columnName);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['count'] == 0) {
            // La colonne n'existe pas, on l'ajoute
            try {
                $db->exec($alterQuery);
                $results[$columnName] = "✓ Colonne ajoutée avec succès";
            } catch (PDOException $e) {
                $results[$columnName] = "✗ Erreur: " . $e->getMessage();
            }
        } else {
            $results[$columnName] = "○ Colonne déjà existante (ignorée)";
        }
    }

    // Ajouter l'index si nécessaire
    $indexName = 'idx_domiciliations_date_creation_entreprise';
    $checkIndexQuery = "SELECT COUNT(*) as count
                        FROM information_schema.STATISTICS
                        WHERE TABLE_SCHEMA = DATABASE()
                        AND TABLE_NAME = 'domiciliations'
                        AND INDEX_NAME = :index_name";

    $stmt = $db->prepare($checkIndexQuery);
    $stmt->bindParam(':index_name', $indexName);
    $stmt->execute();
    $indexResult = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($indexResult['count'] == 0) {
        try {
            $db->exec("CREATE INDEX `$indexName` ON `domiciliations` (`date_creation_entreprise`)");
            $results['index'] = "✓ Index ajouté avec succès";
        } catch (PDOException $e) {
            $results['index'] = "✗ Erreur index: " . $e->getMessage();
        }
    } else {
        $results['index'] = "○ Index déjà existant (ignoré)";
    }

    echo json_encode([
        'success' => true,
        'message' => 'Migration terminée',
        'details' => $results
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>
