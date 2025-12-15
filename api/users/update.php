<?php
/**
 * API: Mettre à jour un utilisateur
 * PUT /api/users/update.php?id=xxx
 * POST /api/users/update.php?id=xxx (alternative)
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth(true);

    // Récupérer l'ID depuis query params
    $userId = $_GET['id'] ?? null;

    if (!$userId) {
        Response::error("ID utilisateur manquant", 400);
    }

    // Un utilisateur peut mettre à jour ses propres infos, ou l'admin peut tout modifier
    if ($auth['role'] !== 'admin' && $auth['id'] !== $userId) {
        Response::error("Accès refusé", 403);
    }

    $rawInput = file_get_contents("php://input");
    error_log("Raw input: " . $rawInput);

    $data = json_decode($rawInput);

    if (!$data) {
        error_log("JSON decode failed: " . json_last_error_msg());
        Response::error("Données manquantes ou JSON invalide", 400);
    }

    error_log("Decoded data: " . print_r($data, true));

    $db = Database::getInstance()->getConnection();

    // Construire dynamiquement la requête UPDATE
    // Mapping camelCase -> snake_case
    $fieldMapping = [
        'nom' => 'nom',
        'prenom' => 'prenom',
        'telephone' => 'telephone',
        'profession' => 'profession',
        'entreprise' => 'entreprise',
        'adresse' => 'adresse',
        'bio' => 'bio',
        'wilaya' => 'wilaya',
        'commune' => 'commune',
        'avatar' => 'avatar',
        'typeEntreprise' => 'type_entreprise',
        'nif' => 'nif',
        'nis' => 'nis',
        'registreCommerce' => 'registre_commerce',
        'articleImposition' => 'article_imposition',
        'numeroAutoEntrepreneur' => 'numero_auto_entrepreneur',
        'raisonSociale' => 'raison_sociale',
        'dateCreationEntreprise' => 'date_creation_entreprise',
        'capital' => 'capital',
        'siegeSocial' => 'siege_social',
        'activitePrincipale' => 'activite_principale',
        'formeJuridique' => 'forme_juridique'
    ];

    // L'admin peut aussi changer le rôle et le statut
    if ($auth['role'] === 'admin') {
        $fieldMapping['role'] = 'role';
        $fieldMapping['statut'] = 'statut';
    }

    $updates = [];
    $params = [':id' => $userId];

    foreach ($fieldMapping as $camelField => $dbField) {
        if (property_exists($data, $camelField)) {
            // Utiliser le nom du champ de base de données directement comme nom de paramètre
            $paramName = $dbField;
            $updates[] = "$dbField = :$paramName";
            $params[":$paramName"] = $data->$camelField;
        }
    }

    if (empty($updates)) {
        Response::error("Aucune donnée à mettre à jour", 400);
    }

    $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";

    error_log("SQL Query: " . $query);
    error_log("SQL Params: " . print_r($params, true));

    $stmt = $db->prepare($query);

    if (!$stmt) {
        error_log("Prepare failed: " . print_r($db->errorInfo(), true));
        throw new Exception("Erreur de préparation de la requête");
    }

    $result = $stmt->execute($params);

    if (!$result) {
        error_log("Execute failed: " . print_r($stmt->errorInfo(), true));
        throw new Exception("Erreur d'exécution de la requête: " . implode(', ', $stmt->errorInfo()));
    }

    if ($stmt->rowCount() === 0) {
        Response::error("Utilisateur non trouvé ou aucune modification", 404);
    }

    Response::success(['id' => $userId], "Utilisateur mis à jour avec succès");

} catch (Exception $e) {
    error_log("User update error: " . $e->getMessage());
    error_log("User update trace: " . $e->getTraceAsString());

    // En mode debug, retourner l'erreur complète
    if (getenv('APP_ENV') === 'development' || $_ENV['APP_ENV'] === 'development') {
        Response::error($e->getMessage(), 500);
    } else {
        Response::serverError("Erreur lors de la mise à jour: " . $e->getMessage());
    }
}
?>
