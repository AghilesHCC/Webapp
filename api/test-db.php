<?php
/**
 * Script de diagnostic de la base de données
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config/database.php';

$results = [
    'success' => true,
    'tests' => []
];

try {
    // Test 1: Connexion à la base de données
    $db = Database::getInstance()->getConnection();
    $results['tests'][] = [
        'test' => 'Connexion DB',
        'status' => 'OK',
        'message' => 'Connexion réussie'
    ];

    // Test 2: Vérifier la table espaces
    $stmt = $db->query("SELECT COUNT(*) as count FROM espaces");
    $espacesCount = $stmt->fetch()['count'];
    $results['tests'][] = [
        'test' => 'Table espaces',
        'status' => 'OK',
        'message' => "$espacesCount espace(s) trouvé(s)"
    ];

    // Test 3: Lister les espaces
    $stmt = $db->query("SELECT id, nom, disponible FROM espaces LIMIT 5");
    $espaces = $stmt->fetchAll();
    $results['tests'][] = [
        'test' => 'Liste des espaces',
        'status' => 'OK',
        'data' => $espaces
    ];

    // Test 4: Vérifier la table users
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $usersCount = $stmt->fetch()['count'];
    $results['tests'][] = [
        'test' => 'Table users',
        'status' => 'OK',
        'message' => "$usersCount utilisateur(s) trouvé(s)"
    ];

    // Test 5: Vérifier la table reservations
    $stmt = $db->query("SELECT COUNT(*) as count FROM reservations");
    $reservationsCount = $stmt->fetch()['count'];
    $results['tests'][] = [
        'test' => 'Table reservations',
        'status' => 'OK',
        'message' => "$reservationsCount réservation(s) trouvée(s)"
    ];

    // Test 6: Vérifier les codes promo
    $stmt = $db->query("SELECT COUNT(*) as count FROM codes_promo");
    $codesPromoCount = $stmt->fetch()['count'];
    $results['tests'][] = [
        'test' => 'Table codes_promo',
        'status' => 'OK',
        'message' => "$codesPromoCount code(s) promo trouvé(s)"
    ];

} catch (Exception $e) {
    $results['success'] = false;
    $results['tests'][] = [
        'test' => 'Erreur',
        'status' => 'ERREUR',
        'message' => $e->getMessage()
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
