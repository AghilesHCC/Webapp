<?php
while (ob_get_level()) ob_end_clean();
ob_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendJson($success, $data = null, $error = null, $code = 200) {
    while (ob_get_level()) ob_end_clean();
    http_response_code($code);
    header('Content-Type: application/json');
    $response = ['success' => $success];
    if ($data) $response['data'] = $data;
    if ($error) $response['error'] = $error;
    echo json_encode($response);
    exit;
}

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        sendJson(false, null, 'Erreur PHP: ' . $error['message'], 500);
    }
});

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJson(false, null, 'Methode non autorisee', 405);
    }

    $input = file_get_contents("php://input");
    if (empty($input)) {
        sendJson(false, null, 'Aucune donnee recue', 400);
    }

    $data = json_decode($input);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendJson(false, null, 'JSON invalide', 400);
    }

    if (empty($data->credential)) {
        sendJson(false, null, 'Token Google requis', 400);
    }

    $parts = explode('.', $data->credential);
    if (count($parts) !== 3) {
        sendJson(false, null, 'Token Google invalide', 400);
    }

    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')));
    if (!$payload || empty($payload->email)) {
        sendJson(false, null, 'Impossible de decoder le token Google', 400);
    }

    $email = $payload->email;
    $name = $payload->name ?? '';
    $given_name = $payload->given_name ?? '';
    $family_name = $payload->family_name ?? '';
    $picture = $payload->picture ?? null;
    $google_id = $payload->sub ?? null;

    if (empty($given_name) && !empty($name)) {
        $nameParts = explode(' ', $name, 2);
        $given_name = $nameParts[0] ?? '';
        $family_name = $nameParts[1] ?? '';
    }

    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'cofficed_coffice';
    $user = getenv('DB_USER') ?: 'cofficed_user';
    $pass = getenv('DB_PASSWORD') ?: 'CofficeADMIN2025!';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $existingUser = $stmt->fetch();

    if ($existingUser) {
        if ($existingUser['statut'] !== 'actif') {
            sendJson(false, null, 'Compte inactif ou suspendu', 403);
        }

        $updateFields = [];
        $updateParams = [];

        if ($google_id && empty($existingUser['google_id'])) {
            $updateFields[] = "google_id = ?";
            $updateParams[] = $google_id;
        }
        if ($picture && empty($existingUser['avatar'])) {
            $updateFields[] = "avatar = ?";
            $updateParams[] = $picture;
        }
        $updateFields[] = "derniere_connexion = NOW()";

        if (!empty($updateFields)) {
            $updateParams[] = $existingUser['id'];
            $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?");
            $stmt->execute($updateParams);
        }

        $user_id = $existingUser['id'];
        $role = $existingUser['role'];
        $userData = [
            'id' => $existingUser['id'],
            'email' => $existingUser['email'],
            'nom' => $existingUser['nom'],
            'prenom' => $existingUser['prenom'],
            'telephone' => $existingUser['telephone'],
            'role' => $existingUser['role'],
            'statut' => $existingUser['statut'],
            'avatar' => $picture ?: $existingUser['avatar'],
            'profession' => $existingUser['profession'],
            'entreprise' => $existingUser['entreprise'],
            'adresse' => $existingUser['adresse'],
            'bio' => $existingUser['bio'],
            'wilaya' => $existingUser['wilaya'],
            'commune' => $existingUser['commune'],
            'type_entreprise' => $existingUser['type_entreprise'],
            'nif' => $existingUser['nif'],
            'nis' => $existingUser['nis'],
            'registre_commerce' => $existingUser['registre_commerce'],
            'article_imposition' => $existingUser['article_imposition'],
            'numero_auto_entrepreneur' => $existingUser['numero_auto_entrepreneur'],
            'raison_sociale' => $existingUser['raison_sociale'],
            'date_creation_entreprise' => $existingUser['date_creation_entreprise'],
            'capital' => $existingUser['capital'],
            'siege_social' => $existingUser['siege_social'],
            'activite_principale' => $existingUser['activite_principale'],
            'forme_juridique' => $existingUser['forme_juridique']
        ];
    } else {
        $user_id = sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $random_password = bin2hex(random_bytes(16));
        $password_hash = password_hash($random_password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, password_hash, nom, prenom, avatar, google_id, role, statut, derniere_connexion)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'actif', NOW())
        ");
        $stmt->execute([
            $user_id,
            $email,
            $password_hash,
            $family_name ?: 'Utilisateur',
            $given_name ?: 'Google',
            $picture,
            $google_id
        ]);

        $code_parrain = 'COFFICE' . strtoupper(substr(str_replace('-', '', $user_id), 0, 6));
        $parrainage_id = sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $pdo->prepare("
            INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales)
            VALUES (?, ?, ?, 0, 0)
        ");
        $stmt->execute([$parrainage_id, $user_id, $code_parrain]);

        $role = 'user';
        $userData = [
            'id' => $user_id,
            'email' => $email,
            'nom' => $family_name ?: 'Utilisateur',
            'prenom' => $given_name ?: 'Google',
            'telephone' => null,
            'role' => 'user',
            'statut' => 'actif',
            'avatar' => $picture,
            'profession' => null,
            'entreprise' => null
        ];
    }

    $secret = getenv('JWT_SECRET') ?: 'lLghQl2WUH5z29yk4SzYaMcHu0jNJ3oymw5QZIChJ6yVxs63Q8UpjjFOeUKUxJKLvBaOc0Af38yhnojB2EaoMg==';

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'sub' => $user_id,
        'email' => $email,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60)
    ]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    $token = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

    $refreshPayload = json_encode([
        'sub' => $user_id,
        'email' => $email,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + (30 * 24 * 60 * 60),
        'type' => 'refresh'
    ]);

    $base64UrlRefreshPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($refreshPayload));
    $refreshSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlRefreshPayload, $secret, true);
    $base64UrlRefreshSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($refreshSignature));

    $refreshToken = $base64UrlHeader . "." . $base64UrlRefreshPayload . "." . $base64UrlRefreshSignature;

    sendJson(true, [
        'token' => $token,
        'refreshToken' => $refreshToken,
        'user' => $userData,
        'isNewUser' => !$existingUser
    ]);

} catch (PDOException $e) {
    error_log('DB Error: ' . $e->getMessage());
    sendJson(false, null, 'Erreur de base de donnees', 500);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    sendJson(false, null, $e->getMessage(), 500);
}
?>
