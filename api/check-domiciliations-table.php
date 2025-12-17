<?php
/**
 * Script de diagnostic de la table domiciliations
 * Affiche les colonnes existantes et manquantes
 */

require_once 'config/database.php';

header('Content-Type: application/json');

try {
    $database = Database::getInstance();
    $db = $database->getConnection();

    // Colonnes requises
    $requiredColumns = [
        'id',
        'user_id',
        'raison_sociale',
        'forme_juridique',
        'capital',
        'activite_principale',
        'nif',
        'nis',
        'registre_commerce',
        'article_imposition',
        'numero_auto_entrepreneur',
        'wilaya',
        'commune',
        'adresse_actuelle',
        'coordonnees_fiscales',
        'coordonnees_administratives',
        'date_creation_entreprise',
        'representant_nom',
        'representant_prenom',
        'representant_fonction',
        'representant_telephone',
        'representant_email',
        'statut',
        'montant_mensuel',
        'notes_admin',
        'visible_sur_site',
        'date_debut',
        'date_fin',
        'created_at',
        'updated_at'
    ];

    // Récupérer les colonnes existantes
    $query = "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
              FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'domiciliations'
              ORDER BY ORDINAL_POSITION";

    $stmt = $db->query($query);
    $existingColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $existingColumnNames = array_column($existingColumns, 'COLUMN_NAME');
    $missingColumns = array_diff($requiredColumns, $existingColumnNames);

    echo json_encode([
        'success' => true,
        'table_exists' => count($existingColumns) > 0,
        'total_columns' => count($existingColumns),
        'existing_columns' => $existingColumns,
        'required_columns' => $requiredColumns,
        'missing_columns' => array_values($missingColumns),
        'has_missing_columns' => count($missingColumns) > 0,
        'status' => count($missingColumns) === 0 ? 'OK - Toutes les colonnes sont présentes' : 'ATTENTION - ' . count($missingColumns) . ' colonne(s) manquante(s)'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>
