<?php
/**
 * API: Inscription utilisateur
 * POST /api/auth/register.php
 */

// Nettoyer tout output buffer
while (ob_get_level()) {
    ob_end_clean();
}

// Démarrer un nouveau buffer
ob_start();

// Handler d'erreur global - TOUJOURS retourner du JSON
function sendJsonError($message, $code = 500) {
    while (ob_get_level()) {
        ob_end_clean();
    }
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $message,
        'message' => $message
    ]);
    exit;
}

// Capturer toutes les erreurs
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile:$errline");
    if ($errno === E_ERROR || $errno === E_CORE_ERROR || $errno === E_COMPILE_ERROR) {
        sendJsonError("Erreur serveur interne", 500);
    }
    return false;
});

// Capturer les erreurs fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        error_log("Fatal error: " . print_r($error, true));
        sendJsonError("Erreur serveur fatale", 500);
    }
});

try {
    // Charger les dépendances
    $basePath = __DIR__ . '/..';

    if (!file_exists($basePath . '/config/cors.php')) {
        throw new Exception("Fichier cors.php introuvable");
    }
    require_once $basePath . '/config/cors.php';

    if (!file_exists($basePath . '/config/database.php')) {
        throw new Exception("Fichier database.php introuvable");
    }
    require_once $basePath . '/config/database.php';

    if (!file_exists($basePath . '/utils/Auth.php')) {
        throw new Exception("Fichier Auth.php introuvable");
    }
    require_once $basePath . '/utils/Auth.php';

    if (!file_exists($basePath . '/utils/Response.php')) {
        throw new Exception("Fichier Response.php introuvable");
    }
    require_once $basePath . '/utils/Response.php';

    if (!file_exists($basePath . '/utils/UuidHelper.php')) {
        throw new Exception("Fichier UuidHelper.php introuvable");
    }
    require_once $basePath . '/utils/UuidHelper.php';

    if (!file_exists($basePath . '/utils/Validator.php')) {
        throw new Exception("Fichier Validator.php introuvable");
    }
    require_once $basePath . '/utils/Validator.php';

    // Lire les données POST
    $input = file_get_contents("php://input");
    if (empty($input)) {
        Response::error("Aucune donnée reçue", 400);
    }

    $data = json_decode($input);
    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::error("Données JSON invalides: " . json_last_error_msg(), 400);
    }

    // Validation des champs requis
    $validator = new Validator();

    $validator->validateRequired($data->email ?? '', 'email');
    $validator->validateEmail($data->email ?? '', 'email');
    $validator->validateRequired($data->password ?? '', 'password');
    $validator->validatePassword($data->password ?? '', 'password');
    $validator->validateRequired($data->nom ?? '', 'nom');
    $validator->validateMinLength($data->nom ?? '', 2, 'nom');
    $validator->validateRequired($data->prenom ?? '', 'prenom');
    $validator->validateMinLength($data->prenom ?? '', 2, 'prenom');

    // Validation téléphone si fourni
    if (!empty($data->telephone)) {
        $validator->validatePhone($data->telephone, 'telephone', false);
    }

    if ($validator->hasErrors()) {
        Response::error($validator->getFirstError(), 400);
    }

    // Connexion base de données
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new Exception("Impossible de se connecter à la base de données");
    }

    // Vérifier si l'email existe déjà
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        Response::error("Cet email est déjà utilisé", 409);
    }

    // Hasher le mot de passe
    $password_hash = Auth::hashPassword($data->password);
    if (!$password_hash) {
        throw new Exception("Erreur lors du hashage du mot de passe");
    }

    // Générer l'ID utilisateur
    $user_id = UuidHelper::generate();
    if (!$user_id) {
        throw new Exception("Erreur lors de la génération de l'ID utilisateur");
    }

    // Préparer les données optionnelles
    $profession = $data->profession ?? null;
    $entreprise = $data->entreprise ?? null;
    $telephone = $data->telephone ?? null;

    // Insérer l'utilisateur
    $query = "INSERT INTO users (id, email, password_hash, nom, prenom, telephone, profession, entreprise, role, statut)
              VALUES (:id, :email, :password_hash, :nom, :prenom, :telephone, :profession, :entreprise, 'user', 'actif')";

    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':id' => $user_id,
        ':email' => $data->email,
        ':password_hash' => $password_hash,
        ':nom' => $data->nom,
        ':prenom' => $data->prenom,
        ':telephone' => $telephone,
        ':profession' => $profession,
        ':entreprise' => $entreprise
    ]);

    if (!$result) {
        $errorInfo = $stmt->errorInfo();
        error_log("Failed to insert user: " . print_r($errorInfo, true));
        throw new Exception("Erreur lors de la création de l'utilisateur: " . $errorInfo[2]);
    }

    // Créer le code de parrainage pour ce nouvel utilisateur
    $code_parrain = 'COFFICE' . strtoupper(substr(str_replace('-', '', $user_id), 0, 6));
    $parrainage_id = UuidHelper::generate();

    $query = "INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales)
              VALUES (:id, :parrain_id, :code_parrain, 0, 0)";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $parrainage_id,
        ':parrain_id' => $user_id,
        ':code_parrain' => $code_parrain
    ]);

    // Traiter le code parrainage si fourni
    if (!empty($data->codeParrainage)) {
        $query = "SELECT id, parrain_id FROM parrainages
                  WHERE code_parrain = :code
                  LIMIT 1";

        $stmt = $db->prepare($query);
        $stmt->execute([':code' => $data->codeParrainage]);
        $parrainage = $stmt->fetch();

        if ($parrainage && $parrainage['parrain_id'] !== $user_id) {
            // Incrémenter les compteurs du parrain
            $query = "UPDATE parrainages
                      SET parraines = parraines + 1,
                          recompenses_totales = recompenses_totales + 3000,
                          updated_at = NOW()
                      WHERE id = :id";

            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $parrainage['id']]);

            // Créer une notification pour le parrain
            $notif_id = UuidHelper::generate();
            $query = "INSERT INTO notifications (id, user_id, type, titre, message, lue)
                      VALUES (:id, :user_id, 'parrainage', 'Nouveau filleul!',
                              'Vous avez gagné 3000 DA grâce à votre code de parrainage', 0)";

            $stmt = $db->prepare($query);
            $stmt->execute([
                ':id' => $notif_id,
                ':user_id' => $parrainage['parrain_id']
            ]);
        }
    }

    // Générer les tokens JWT
    $token = Auth::generateToken($user_id, $data->email, 'user');
    $refreshToken = Auth::generateRefreshToken($user_id, $data->email, 'user');

    if (!$token || !$refreshToken) {
        throw new Exception("Erreur lors de la génération des tokens");
    }

    // Retourner la réponse
    Response::success([
        'token' => $token,
        'refreshToken' => $refreshToken,
        'user' => [
            'id' => $user_id,
            'email' => $data->email,
            'nom' => $data->nom,
            'prenom' => $data->prenom,
            'telephone' => $telephone,
            'profession' => $profession,
            'entreprise' => $entreprise,
            'role' => 'user',
            'statut' => 'actif'
        ]
    ], "Inscription réussie", 201);

} catch (PDOException $e) {
    error_log("Database error in register: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJsonError("Erreur de base de données: " . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("Register error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJsonError($e->getMessage(), 500);
}
?>
