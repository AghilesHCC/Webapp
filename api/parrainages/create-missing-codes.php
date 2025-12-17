<?php
/**
 * Script de migration - Créer les codes de parrainage manquants
 * Ce script crée automatiquement des codes de parrainage pour tous les utilisateurs qui n'en ont pas
 */

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Vérifier que c'est un admin qui exécute ce script
    $auth = Auth::verifyAuth();
    if ($auth['role'] !== 'admin') {
        Response::error('Accès non autorisé', 403);
    }

    $db = Database::getInstance()->getConnection();

    // Fonction pour générer un code de parrainage
    function generateCodeParrainage($userId) {
        return 'COFFICE' . strtoupper(substr(str_replace('-', '', $userId), 0, 6));
    }

    // Trouver tous les utilisateurs sans code de parrainage
    $query = "SELECT u.id, u.prenom, u.nom
              FROM users u
              LEFT JOIN parrainages p ON u.id = p.parrain_id
              WHERE p.id IS NULL";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $usersWithoutCode = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($usersWithoutCode)) {
        Response::success([
            'created' => 0,
            'message' => 'Tous les utilisateurs ont déjà un code de parrainage'
        ]);
    }

    $created = 0;
    $errors = [];

    // Créer un code pour chaque utilisateur
    foreach ($usersWithoutCode as $user) {
        try {
            $codeParrain = generateCodeParrainage($user['id']);
            $parrainageId = UuidHelper::generate();

            $insertQuery = "INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales)
                           VALUES (:id, :parrain_id, :code_parrain, 0, 0.00)";

            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->execute([
                ':id' => $parrainageId,
                ':parrain_id' => $user['id'],
                ':code_parrain' => $codeParrain
            ]);

            $created++;
            error_log("Code created for user {$user['id']}: {$codeParrain}");

        } catch (Exception $e) {
            $errors[] = [
                'userId' => $user['id'],
                'nom' => $user['nom'],
                'prenom' => $user['prenom'],
                'error' => $e->getMessage()
            ];
            error_log("Error creating code for user {$user['id']}: " . $e->getMessage());
        }
    }

    Response::success([
        'created' => $created,
        'total' => count($usersWithoutCode),
        'errors' => $errors
    ], "Codes de parrainage créés avec succès");

} catch (Exception $e) {
    error_log("Create missing codes error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::serverError("Erreur lors de la création des codes de parrainage");
}
