<?php
require_once __DIR__ . '/../bootstrap.php';

try {
    $auth = Auth::verifyAuth();
    $db = Database::getInstance()->getConnection();

    if ($auth['role'] === 'admin') {
        $query = "SELECT d.*, u.email, u.nom, u.prenom, u.telephone
                  FROM domiciliations d
                  LEFT JOIN users u ON d.user_id = u.id
                  ORDER BY d.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
    } else {
        $query = "SELECT * FROM domiciliations
                  WHERE user_id = :user_id
                  ORDER BY created_at DESC
                  LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute([':user_id' => $auth['id']]);
    }

    $domiciliations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formatted = array_map(function($d) {
        $result = [
            'id' => $d['id'],
            'userId' => $d['user_id'],
            'raisonSociale' => $d['raison_sociale'],
            'formeJuridique' => $d['forme_juridique'],
            'capital' => $d['capital'],
            'activitePrincipale' => $d['activite_principale'],
            'nif' => $d['nif'],
            'nis' => $d['nis'],
            'registreCommerce' => $d['registre_commerce'],
            'articleImposition' => $d['article_imposition'],
            'numeroAutoEntrepreneur' => $d['numero_auto_entrepreneur'],
            'wilaya' => $d['wilaya'],
            'commune' => $d['commune'],
            'adresseActuelle' => $d['adresse_actuelle'],
            'coordonneesFiscales' => $d['coordonnees_fiscales'],
            'coordonneesAdministratives' => $d['coordonnees_administratives'],
            'dateCreationEntreprise' => $d['date_creation_entreprise'],
            'statut' => $d['statut'],
            'montantMensuel' => (float)$d['montant_mensuel'],
            'dateDebut' => $d['date_debut'],
            'dateFin' => $d['date_fin'],
            'commentaireAdmin' => $d['commentaire_admin'],
            'createdAt' => $d['created_at'],
            'updatedAt' => $d['updated_at'],
            'dateCreation' => $d['created_at']
        ];
        
        if (isset($d['representant_nom'])) {
            $result['representantLegal'] = [
                'nom' => $d['representant_nom'],
                'prenom' => $d['representant_prenom'],
                'fonction' => $d['representant_fonction'],
                'telephone' => $d['representant_telephone'],
                'email' => $d['representant_email']
            ];
        }
        
        if (isset($d['email'])) {
            $result['user'] = [
                'email' => $d['email'],
                'nom' => $d['nom'],
                'prenom' => $d['prenom'],
                'telephone' => $d['telephone']
            ];
        }
        
        return $result;
    }, $domiciliations);

    Response::success($formatted);

} catch (Exception $e) {
    error_log("Domiciliations index error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::serverError("Erreur lors de la récupération des domiciliations");
}
