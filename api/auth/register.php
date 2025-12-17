<?php
// TOUT NETTOYER
while (ob_get_level()) ob_end_clean();
ob_start();

// Headers CORS et JSON en premier
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Fonction pour toujours retourner du JSON
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

// Capturer toutes les erreurs
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        sendJson(false, null, 'Erreur PHP: ' . $error['message'] . ' dans ' . $error['file'], 500);
    }
});

try {
    // 1. Vérifier la méthode
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJson(false, null, 'Méthode non autorisée', 405);
    }

    // 2. Lire les données
    $input = file_get_contents("php://input");
    if (empty($input)) {
        sendJson(false, null, 'Aucune donnée reçue', 400);
    }

    $data = json_decode($input);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendJson(false, null, 'JSON invalide: ' . json_last_error_msg(), 400);
    }

    // 3. Valider les champs de base
    if (empty($data->email)) sendJson(false, null, 'Email requis', 400);
    if (empty($data->password)) sendJson(false, null, 'Mot de passe requis', 400);
    if (empty($data->nom)) sendJson(false, null, 'Nom requis', 400);
    if (empty($data->prenom)) sendJson(false, null, 'Prénom requis', 400);

    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        sendJson(false, null, 'Email invalide', 400);
    }

    // 4. Connexion à la base de données
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'cofficed_coffice';
    $user = getenv('DB_USER') ?: 'cofficed_user';
    $pass = getenv('DB_PASSWORD') ?: 'CofficeADMIN2025!';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 5. Vérifier si l'email existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    if ($stmt->rowCount() > 0) {
        sendJson(false, null, 'Cet email est déjà utilisé', 409);
    }

    // 6. Créer l'utilisateur
    $user_id = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("
        INSERT INTO users (id, email, password_hash, nom, prenom, telephone, profession, entreprise, role, statut)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', 'actif')
    ");

    $stmt->execute([
        $user_id,
        $data->email,
        $password_hash,
        $data->nom,
        $data->prenom,
        $data->telephone ?? null,
        $data->profession ?? null,
        $data->entreprise ?? null
    ]);

    // 7. Créer le code de parrainage
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

    // 8. Traiter le code de parrainage si fourni
    if (!empty($data->codeParrainage)) {
        $stmt = $pdo->prepare("SELECT id, parrain_id FROM parrainages WHERE code_parrain = ? LIMIT 1");
        $stmt->execute([$data->codeParrainage]);
        $parrainage = $stmt->fetch();

        if ($parrainage && $parrainage['parrain_id'] !== $user_id) {
            $stmt = $pdo->prepare("
                UPDATE parrainages
                SET parraines = parraines + 1,
                    recompenses_totales = recompenses_totales + 3000,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$parrainage['id']]);

            $notif_id = sprintf(
                '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            $stmt = $pdo->prepare("
                INSERT INTO notifications (id, user_id, type, titre, message, lue)
                VALUES (?, ?, 'parrainage', 'Nouveau filleul!', 'Vous avez gagné 3000 DA grâce à votre code de parrainage', 0)
            ");
            $stmt->execute([$notif_id, $parrainage['parrain_id']]);
        }
    }

    // 9. Générer les tokens JWT
    $secret = getenv('JWT_SECRET') ?: 'lLghQl2WUH5z29yk4SzYaMcHu0jNJ3oymw5QZIChJ6yVxs63Q8UpjjFOeUKUxJKLvBaOc0Af38yhnojB2EaoMg==';

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'sub' => $user_id,
        'email' => $data->email,
        'role' => 'user',
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 jours
    ]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    $token = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

    // Refresh token (30 jours)
    $refreshPayload = json_encode([
        'sub' => $user_id,
        'email' => $data->email,
        'role' => 'user',
        'iat' => time(),
        'exp' => time() + (30 * 24 * 60 * 60),
        'type' => 'refresh'
    ]);

    $base64UrlRefreshPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($refreshPayload));
    $refreshSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlRefreshPayload, $secret, true);
    $base64UrlRefreshSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($refreshSignature));

    $refreshToken = $base64UrlHeader . "." . $base64UrlRefreshPayload . "." . $base64UrlRefreshSignature;

    // 10. Retourner la réponse
    sendJson(true, [
        'token' => $token,
        'refreshToken' => $refreshToken,
        'user' => [
            'id' => $user_id,
            'email' => $data->email,
            'nom' => $data->nom,
            'prenom' => $data->prenom,
            'telephone' => $data->telephone ?? null,
            'profession' => $data->profession ?? null,
            'entreprise' => $data->entreprise ?? null,
            'role' => 'user',
            'statut' => 'actif'
        ]
    ], null, 201);

} catch (PDOException $e) {
    error_log('DB Error: ' . $e->getMessage());
    sendJson(false, null, 'Erreur de base de données: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    sendJson(false, null, $e->getMessage(), 500);
}
?>
