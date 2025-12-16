<?php
/**
 * Script de test de création de réservation
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config/database.php';
require_once 'utils/UuidHelper.php';

$results = [
    'success' => true,
    'tests' => []
];

try {
    $db = Database::getInstance()->getConnection();

    // Test 1: Récupérer un espace disponible
    $stmt = $db->query("SELECT id, nom, prix_heure, disponible, capacite FROM espaces WHERE disponible = 1 LIMIT 1");
    $espace = $stmt->fetch();

    if (!$espace) {
        $results['tests'][] = [
            'test' => 'Espace disponible',
            'status' => 'ERREUR',
            'message' => 'Aucun espace disponible trouvé'
        ];
        $results['success'] = false;
    } else {
        $results['tests'][] = [
            'test' => 'Espace disponible',
            'status' => 'OK',
            'data' => $espace
        ];
    }

    // Test 2: Vérifier le format de l'ID
    if ($espace) {
        $isValidUuid = UuidHelper::isValid($espace['id']);
        $results['tests'][] = [
            'test' => 'Format UUID',
            'status' => $isValidUuid ? 'OK' : 'ERREUR',
            'message' => $isValidUuid ? "UUID valide: {$espace['id']}" : "UUID invalide: {$espace['id']}"
        ];
    }

    // Test 3: Simuler les dates de réservation
    $dateDebut = new DateTime('now');
    $dateDebut->modify('+1 hour');
    $dateFin = clone $dateDebut;
    $dateFin->modify('+5 hours');

    $results['tests'][] = [
        'test' => 'Dates de réservation',
        'status' => 'OK',
        'data' => [
            'date_debut' => $dateDebut->format('Y-m-d H:i:s'),
            'date_fin' => $dateFin->format('Y-m-d H:i:s')
        ]
    ];

    // Test 4: Calculer le montant
    if ($espace) {
        $heures = ($dateFin->getTimestamp() - $dateDebut->getTimestamp()) / 3600;
        $montant = ceil($heures) * $espace['prix_heure'];

        $results['tests'][] = [
            'test' => 'Calcul montant',
            'status' => 'OK',
            'data' => [
                'heures' => $heures,
                'prix_heure' => $espace['prix_heure'],
                'montant_total' => $montant
            ]
        ];
    }

    // Test 5: Vérifier les utilisateurs
    $stmt = $db->query("SELECT id, email, nom, prenom FROM users WHERE statut = 'actif' LIMIT 1");
    $user = $stmt->fetch();

    if (!$user) {
        $results['tests'][] = [
            'test' => 'Utilisateur actif',
            'status' => 'ERREUR',
            'message' => 'Aucun utilisateur actif trouvé'
        ];
        $results['success'] = false;
    } else {
        $results['tests'][] = [
            'test' => 'Utilisateur actif',
            'status' => 'OK',
            'data' => $user
        ];
    }

    // Test 6: Tester la génération d'UUID
    $testUuid = UuidHelper::generate();
    $results['tests'][] = [
        'test' => 'Génération UUID',
        'status' => UuidHelper::isValid($testUuid) ? 'OK' : 'ERREUR',
        'data' => $testUuid
    ];

    // Test 7: Vérifier la table utilisations_codes_promo
    $stmt = $db->query("SHOW TABLES LIKE 'utilisations_codes_promo'");
    $tableExists = $stmt->fetch();
    $results['tests'][] = [
        'test' => 'Table utilisations_codes_promo',
        'status' => $tableExists ? 'OK' : 'ERREUR',
        'message' => $tableExists ? 'Table existe' : 'Table manquante'
    ];

} catch (Exception $e) {
    $results['success'] = false;
    $results['tests'][] = [
        'test' => 'Exception',
        'status' => 'ERREUR',
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
