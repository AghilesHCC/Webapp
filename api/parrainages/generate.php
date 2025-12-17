<?php
require_once __DIR__ . '/../bootstrap.php';

try {
    $auth = Auth::verifyAuth();
    $db = Database::getInstance()->getConnection();
    
    $query = "SELECT id, parrain_id, code_parrain, parraines, recompenses_totales, created_at
              FROM parrainages
              WHERE parrain_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->execute([':user_id' => $auth['id']]);
    $parrainage = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($parrainage) {
        Response::success([
            'id' => $parrainage['id'],
            'parrainId' => $parrainage['parrain_id'],
            'codeParrain' => $parrainage['code_parrain'],
            'parraines' => (int)$parrainage['parraines'],
            'recompensesTotales' => (float)$parrainage['recompenses_totales'],
            'createdAt' => $parrainage['created_at']
        ]);
    }
    
    function generateCodeParrainage($prenom, $nom) {
        $prefix = strtoupper(substr($prenom, 0, 2) . substr($nom, 0, 2));
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        return $prefix . $random;
    }
    
    $db->beginTransaction();
    
    try {
        $query = "SELECT prenom, nom FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $auth['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            $db->rollBack();
            Response::error("Utilisateur introuvable", 404);
        }
        
        $codeParrain = generateCodeParrainage($user['prenom'], $user['nom']);
        
        $maxAttempts = 10;
        $attempt = 0;
        
        while ($attempt < $maxAttempts) {
            $checkQuery = "SELECT id FROM parrainages WHERE code_parrain = :code";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([':code' => $codeParrain]);
            
            if ($checkStmt->rowCount() === 0) {
                break;
            }
            
            $codeParrain = generateCodeParrainage($user['prenom'], $user['nom']);
            $attempt++;
        }
        
        if ($attempt >= $maxAttempts) {
            $db->rollBack();
            Response::error("Impossible de générer un code unique", 500);
        }
        
        $id = UuidHelper::generate();
        $insertQuery = "INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales)
                        VALUES (:id, :parrain_id, :code_parrain, 0, 0.00)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([
            ':id' => $id,
            ':parrain_id' => $auth['id'],
            ':code_parrain' => $codeParrain
        ]);
        
        $db->commit();
        
        Response::success([
            'id' => $id,
            'parrainId' => $auth['id'],
            'codeParrain' => $codeParrain,
            'parraines' => 0,
            'recompensesTotales' => 0.00,
            'createdAt' => date('Y-m-d H:i:s')
        ], "Code de parrainage généré avec succès", 201);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Generate parrainage error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::serverError("Erreur lors de la génération du code de parrainage");
}
