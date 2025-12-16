<?php
/**
 * Script de creation et verification du compte administrateur
 * Usage: php setup-admin.php ou via navigateur
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Auth.php';

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'steps' => [],
    'success' => false
];

$adminEmail = 'admin@coffice.dz';
$adminPassword = 'Admin123!';

try {
    $db = Database::getInstance()->getConnection();
    $results['steps'][] = [
        'step' => 'Connexion base de donnees',
        'status' => 'OK',
        'message' => 'Connexion etablie avec succes'
    ];

    $stmt = $db->prepare("SELECT id, email, password_hash, nom, prenom, role, statut FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $adminEmail]);
    $existingAdmin = $stmt->fetch();

    if ($existingAdmin) {
        $results['steps'][] = [
            'step' => 'Verification compte admin',
            'status' => 'EXISTS',
            'message' => 'Le compte admin existe deja',
            'data' => [
                'id' => $existingAdmin['id'],
                'email' => $existingAdmin['email'],
                'nom' => $existingAdmin['nom'],
                'prenom' => $existingAdmin['prenom'],
                'role' => $existingAdmin['role'],
                'statut' => $existingAdmin['statut']
            ]
        ];
    } else {
        $adminId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $passwordHash = Auth::hashPassword($adminPassword);

        $stmt = $db->prepare("
            INSERT INTO users (id, email, password_hash, nom, prenom, role, statut, created_at)
            VALUES (:id, :email, :password_hash, :nom, :prenom, :role, :statut, NOW())
        ");

        $stmt->execute([
            ':id' => $adminId,
            ':email' => $adminEmail,
            ':password_hash' => $passwordHash,
            ':nom' => 'Admin',
            ':prenom' => 'Coffice',
            ':role' => 'admin',
            ':statut' => 'actif'
        ]);

        $results['steps'][] = [
            'step' => 'Creation compte admin',
            'status' => 'CREATED',
            'message' => 'Compte admin cree avec succes',
            'data' => [
                'id' => $adminId,
                'email' => $adminEmail,
                'nom' => 'Admin',
                'prenom' => 'Coffice',
                'role' => 'admin'
            ]
        ];

        $stmt = $db->prepare("SELECT id, email, password_hash, nom, prenom, role, statut FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $adminEmail]);
        $existingAdmin = $stmt->fetch();
    }

    $results['steps'][] = [
        'step' => 'Test connexion admin',
        'status' => 'TESTING',
        'message' => 'Verification du mot de passe...'
    ];

    $passwordValid = Auth::verifyPassword($adminPassword, $existingAdmin['password_hash']);

    if ($passwordValid) {
        $results['steps'][count($results['steps']) - 1] = [
            'step' => 'Test connexion admin',
            'status' => 'OK',
            'message' => 'Mot de passe valide - Connexion reussie'
        ];

        $token = Auth::generateToken($existingAdmin['id'], $existingAdmin['email'], $existingAdmin['role']);
        $refreshToken = Auth::generateRefreshToken($existingAdmin['id'], $existingAdmin['email'], $existingAdmin['role']);

        $results['steps'][] = [
            'step' => 'Generation tokens JWT',
            'status' => 'OK',
            'message' => 'Tokens generes avec succes',
            'data' => [
                'token_preview' => substr($token, 0, 50) . '...',
                'refresh_token_preview' => substr($refreshToken, 0, 50) . '...'
            ]
        ];

        $validatedData = Auth::validateToken($token);

        if ($validatedData) {
            $results['steps'][] = [
                'step' => 'Validation token JWT',
                'status' => 'OK',
                'message' => 'Token valide et decodable',
                'data' => [
                    'user_id' => $validatedData->id,
                    'email' => $validatedData->email,
                    'role' => $validatedData->role
                ]
            ];
        } else {
            $results['steps'][] = [
                'step' => 'Validation token JWT',
                'status' => 'ERROR',
                'message' => 'Echec de la validation du token'
            ];
        }

        $results['success'] = true;
        $results['credentials'] = [
            'email' => $adminEmail,
            'password' => $adminPassword
        ];
        $results['tokens'] = [
            'access_token' => $token,
            'refresh_token' => $refreshToken
        ];

    } else {
        $results['steps'][count($results['steps']) - 1] = [
            'step' => 'Test connexion admin',
            'status' => 'ERROR',
            'message' => 'Mot de passe invalide - Le hash ne correspond pas'
        ];

        $results['steps'][] = [
            'step' => 'Correction mot de passe',
            'status' => 'FIXING',
            'message' => 'Mise a jour du hash du mot de passe...'
        ];

        $newHash = Auth::hashPassword($adminPassword);
        $stmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE email = :email");
        $stmt->execute([':hash' => $newHash, ':email' => $adminEmail]);

        $results['steps'][] = [
            'step' => 'Correction mot de passe',
            'status' => 'OK',
            'message' => 'Hash mis a jour avec succes'
        ];

        $passwordValid = Auth::verifyPassword($adminPassword, $newHash);
        if ($passwordValid) {
            $token = Auth::generateToken($existingAdmin['id'], $existingAdmin['email'], $existingAdmin['role']);
            $refreshToken = Auth::generateRefreshToken($existingAdmin['id'], $existingAdmin['email'], $existingAdmin['role']);

            $results['success'] = true;
            $results['credentials'] = [
                'email' => $adminEmail,
                'password' => $adminPassword
            ];
            $results['tokens'] = [
                'access_token' => $token,
                'refresh_token' => $refreshToken
            ];

            $results['steps'][] = [
                'step' => 'Verification finale',
                'status' => 'OK',
                'message' => 'Connexion admin fonctionnelle'
            ];
        }
    }

} catch (PDOException $e) {
    $results['steps'][] = [
        'step' => 'Erreur base de donnees',
        'status' => 'ERROR',
        'message' => $e->getMessage()
    ];
} catch (Exception $e) {
    $results['steps'][] = [
        'step' => 'Erreur generale',
        'status' => 'ERROR',
        'message' => $e->getMessage()
    ];
}

$results['summary'] = [
    'total_steps' => count($results['steps']),
    'success' => $results['success'],
    'message' => $results['success']
        ? 'Compte admin operationnel - Connexion verifiee'
        : 'Echec de la configuration du compte admin'
];

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
