<?php
/**
 * API: Inscription utilisateur
 * POST /api/auth/register.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';
require_once '../utils/Validator.php';
require_once '../utils/RateLimiter.php';

try {
    $rateLimiter = new RateLimiter();
    $rateLimiter->checkLimit('register');

    $data = json_decode(file_get_contents("php://input"));

    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::error("Données JSON invalides", 400);
    }

    // Utiliser la classe Validator
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

    $db = Database::getInstance()->getConnection();

    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        error_log("Email already exists: " . $data->email);
        Response::error("Cet email est déjà utilisé", 409);
    }

    error_log("Hashing password...");
    $password_hash = Auth::hashPassword($data->password);

    $user_id = UuidHelper::generate();
    error_log("Generated user ID: " . $user_id);

    $profession = $data->profession ?? null;
    $entreprise = $data->entreprise ?? null;

    $query = "INSERT INTO users (id, email, password_hash, nom, prenom, telephone, profession, entreprise, role, statut)
              VALUES (:id, :email, :password_hash, :nom, :prenom, :telephone, :profession, :entreprise, 'user', 'actif')";

    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':id' => $user_id,
        ':email' => $data->email,
        ':password_hash' => $password_hash,
        ':nom' => $data->nom,
        ':prenom' => $data->prenom,
        ':telephone' => $data->telephone ?? null,
        ':profession' => $profession,
        ':entreprise' => $entreprise
    ]);

    if (!$result) {
        error_log("Failed to insert user: " . print_r($stmt->errorInfo(), true));
        Response::error("Erreur lors de la création de l'utilisateur", 500);
    }

    error_log("User created successfully");

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

    error_log("Parrainage code created: " . $code_parrain);

    // Traiter le code parrainage si fourni
    if (!empty($data->codeParrainage)) {
        error_log("Processing referral code: " . $data->codeParrainage);

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

            error_log("Referral bonus credited to parrain: " . $parrainage['parrain_id']);
        }
    }

    $token = Auth::generateToken($user_id, $data->email, 'user');
    $refreshToken = Auth::generateRefreshToken($user_id, $data->email, 'user');
    error_log("Tokens generated");

    // Sessions table removed - using JWT only
    error_log("Registration complete for: " . $data->email);

    Response::success([
        'token' => $token,
        'refreshToken' => $refreshToken,
        'user' => [
            'id' => $user_id,
            'email' => $data->email,
            'nom' => $data->nom,
            'prenom' => $data->prenom,
            'role' => 'user'
        ]
    ], "Inscription réussie", 201);

} catch (PDOException $e) {
    error_log("Database error in register: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    Response::serverError("Erreur lors de l'inscription");
} catch (Exception $e) {
    error_log("Register error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    Response::serverError("Erreur lors de l'inscription");
}
?>
