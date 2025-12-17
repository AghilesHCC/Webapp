-- ============================================
-- Fix domiciliations table
-- Compatible avec MySQL 5.7+ et phpMyAdmin
-- IMPORTANT: Exécutez ce script dans phpMyAdmin ou via mysql CLI
-- ============================================

-- NOTE: MySQL ne supporte pas "IF NOT EXISTS" pour ALTER TABLE ADD COLUMN
-- Ce script utilise une approche procédurale pour éviter les erreurs

-- Ajouter coordonnees_fiscales si elle n'existe pas
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'domiciliations'
    AND COLUMN_NAME = 'coordonnees_fiscales'
);

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_fiscales` TEXT DEFAULT NULL',
    'SELECT "coordonnees_fiscales existe déjà" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter coordonnees_administratives si elle n'existe pas
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'domiciliations'
    AND COLUMN_NAME = 'coordonnees_administratives'
);

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_administratives` TEXT DEFAULT NULL',
    'SELECT "coordonnees_administratives existe déjà" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter representant_fonction si elle n'existe pas
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'domiciliations'
    AND COLUMN_NAME = 'representant_fonction'
);

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `representant_fonction` VARCHAR(100) DEFAULT NULL',
    'SELECT "representant_fonction existe déjà" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter date_creation_entreprise si elle n'existe pas
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'domiciliations'
    AND COLUMN_NAME = 'date_creation_entreprise'
);

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `date_creation_entreprise` DATE DEFAULT NULL',
    'SELECT "date_creation_entreprise existe déjà" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter l'index si nécessaire
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'domiciliations'
    AND INDEX_NAME = 'idx_domiciliations_date_creation_entreprise'
);

SET @query = IF(@index_exists = 0,
    'CREATE INDEX `idx_domiciliations_date_creation_entreprise` ON `domiciliations` (`date_creation_entreprise`)',
    'SELECT "Index existe déjà" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration terminée avec succès!' AS result;
