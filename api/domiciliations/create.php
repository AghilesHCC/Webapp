<?php
/**
 * API: Créer une demande de domiciliation
 * POST /api/domiciliations/create.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';
require_once '../utils/Validator.php';
require_once '../utils/Sanitizer.php';

try {
    $auth = Auth::verifyAuth();

    $data = json_decode(file_get_contents("php://input"));

    $validator = new Validator();

    if (!$validator->validateRequired($data->raison_sociale ?? '', 'raison_sociale') ||
        !$validator->validateRequired($data->forme_juridique ?? '', 'forme_juridique')) {
        Response::error($validator->getErrors(), 400);
    }

    if (isset($data->representant_email) && !empty($data->representant_email)) {
        if (!$validator->validateEmail($data->representant_email, 'representant_email')) {
            Response::error($validator->getErrors(), 400);
        }
    }

    if (isset($data->capital) && !empty($data->capital)) {
        if (!$validator->validateNumeric($data->capital, 'capital')) {
            Response::error($validator->getErrors(), 400);
        }
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Vérifier si l'utilisateur a déjà une domiciliation active
    $query = "SELECT id FROM domiciliations
              WHERE user_id = :user_id
              AND statut IN ('en_attente', 'en_cours', 'validee', 'active')";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $auth['id']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        Response::error("Vous avez déjà une demande de domiciliation en cours ou active", 400);
    }

    // Créer la demande
    $id = UuidHelper::generate();

    $query = "INSERT INTO domiciliations
              (id, user_id, raison_sociale, forme_juridique, capital,
               activite_principale, nif, nis, registre_commerce, article_imposition,
               numero_auto_entrepreneur, wilaya, commune, adresse_actuelle,
               coordonnees_fiscales, coordonnees_administratives, date_creation_entreprise,
               representant_nom, representant_prenom, representant_fonction, representant_telephone,
               representant_email, statut, montant_mensuel)
              VALUES
              (:id, :user_id, :raison_sociale, :forme_juridique, :capital,
               :activite_principale, :nif, :nis, :registre_commerce, :article_imposition,
               :numero_auto_entrepreneur, :wilaya, :commune, :adresse_actuelle,
               :coordonnees_fiscales, :coordonnees_administratives, :date_creation_entreprise,
               :representant_nom, :representant_prenom, :representant_fonction, :representant_telephone,
               :representant_email, 'en_attente', :montant_mensuel)";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $id,
        ':user_id' => $auth['id'],
        ':raison_sociale' => Sanitizer::sanitizeString($data->raison_sociale),
        ':forme_juridique' => Sanitizer::sanitizeString($data->forme_juridique),
        ':capital' => isset($data->capital) ? Sanitizer::sanitizeString($data->capital) : null,
        ':activite_principale' => isset($data->activite_principale) ? Sanitizer::sanitizeString($data->activite_principale) : null,
        ':nif' => isset($data->nif) ? Sanitizer::sanitizeString($data->nif) : null,
        ':nis' => isset($data->nis) ? Sanitizer::sanitizeString($data->nis) : null,
        ':registre_commerce' => isset($data->registre_commerce) ? Sanitizer::sanitizeString($data->registre_commerce) : null,
        ':article_imposition' => isset($data->article_imposition) ? Sanitizer::sanitizeString($data->article_imposition) : null,
        ':numero_auto_entrepreneur' => isset($data->numero_auto_entrepreneur) ? Sanitizer::sanitizeString($data->numero_auto_entrepreneur) : null,
        ':wilaya' => isset($data->wilaya) ? Sanitizer::sanitizeString($data->wilaya) : null,
        ':commune' => isset($data->commune) ? Sanitizer::sanitizeString($data->commune) : null,
        ':adresse_actuelle' => isset($data->adresse_actuelle) ? Sanitizer::sanitizeString($data->adresse_actuelle) : null,
        ':coordonnees_fiscales' => isset($data->coordonnees_fiscales) ? Sanitizer::sanitizeString($data->coordonnees_fiscales) : null,
        ':coordonnees_administratives' => isset($data->coordonnees_administratives) ? Sanitizer::sanitizeString($data->coordonnees_administratives) : null,
        ':date_creation_entreprise' => isset($data->date_creation_entreprise) ? $data->date_creation_entreprise : null,
        ':representant_nom' => isset($data->representant_nom) ? Sanitizer::sanitizeString($data->representant_nom) : null,
        ':representant_prenom' => isset($data->representant_prenom) ? Sanitizer::sanitizeString($data->representant_prenom) : null,
        ':representant_fonction' => isset($data->representant_fonction) ? Sanitizer::sanitizeString($data->representant_fonction) : null,
        ':representant_telephone' => isset($data->representant_telephone) ? Sanitizer::sanitizeString($data->representant_telephone) : null,
        ':representant_email' => isset($data->representant_email) ? Sanitizer::sanitizeEmail($data->representant_email) : null,
        ':montant_mensuel' => $data->montant_mensuel ?? 5000
    ]);

    Response::success(['id' => $id], "Demande de domiciliation créée avec succès", 201);

} catch (Exception $e) {
    error_log("Create domiciliation error: " . $e->getMessage());
    Response::serverError();
}
?>
