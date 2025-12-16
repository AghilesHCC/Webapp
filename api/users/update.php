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
    $auth = Auth::verifyAuth();

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
    $data = json_decode($rawInput);

    if (!$data) {
        Response::error("Données manquantes ou JSON invalide", 400);
    }

    $db = Database::getInstance()->getConnection();

    // Construire dynamiquement la requête UPDATE
    // Mapping camelCase -> snake_case et snake_case direct
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
        'type_entreprise' => 'type_entreprise',
        'nif' => 'nif',
        'nis' => 'nis',
        'registreCommerce' => 'registre_commerce',
        'registre_commerce' => 'registre_commerce',
        'articleImposition' => 'article_imposition',
        'article_imposition' => 'article_imposition',
        'numeroAutoEntrepreneur' => 'numero_auto_entrepreneur',
        'numero_auto_entrepreneur' => 'numero_auto_entrepreneur',
        'raisonSociale' => 'raison_sociale',
        'raison_sociale' => 'raison_sociale',
        'dateCreationEntreprise' => 'date_creation_entreprise',
        'date_creation_entreprise' => 'date_creation_entreprise',
        'capital' => 'capital',
        'siegeSocial' => 'siege_social',
        'siege_social' => 'siege_social',
        'activitePrincipale' => 'activite_principale',
        'activite_principale' => 'activite_principale',
        'formeJuridique' => 'forme_juridique',
        'forme_juridique' => 'forme_juridique'
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
            $value = $data->$camelField;

            if ($dbField === 'date_creation_entreprise' && $value) {
                $timestamp = strtotime($value);
                if ($timestamp === false) {
                    $value = null;
                } else {
                    $value = date('Y-m-d H:i:s', $timestamp);
                }
            }

            if ($dbField === 'capital' && $value !== null && $value !== '') {
                $value = floatval($value);
            }

            $paramName = $dbField;
            $updates[] = "$dbField = :$paramName";
            $params[":$paramName"] = $value;
        }
    }

    if (empty($updates)) {
        Response::error("Aucune donnée à mettre à jour", 400);
    }

    $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";

    $stmt = $db->prepare($query);

    if (!$stmt) {
        error_log("Prepare failed: " . print_r($db->errorInfo(), true));
        throw new Exception("Erreur de préparation de la requête");
    }

    $checkStmt = $db->prepare("SELECT id FROM users WHERE id = :id");
    $checkStmt->execute([':id' => $userId]);
    if (!$checkStmt->fetch()) {
        Response::error("Utilisateur non trouvé", 404);
    }

    $result = $stmt->execute($params);

    if (!$result) {
        error_log("Execute failed: " . print_r($stmt->errorInfo(), true));
        throw new Exception("Erreur d'exécution de la requête: " . implode(', ', $stmt->errorInfo()));
    }

    Response::success(['id' => $userId], "Utilisateur mis à jour avec succès");

} catch (Exception $e) {
    error_log("User update error: " . $e->getMessage());
    error_log("User update trace: " . $e->getTraceAsString());

    $isDev = getenv('APP_ENV') === 'development' || ($_ENV['APP_ENV'] ?? '') === 'development';
    if ($isDev) {
        Response::error($e->getMessage(), 500);
    } else {
        Response::serverError("Erreur lors de la mise à jour");
    }
}
?>
