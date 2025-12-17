-- ============================================
-- Migration: Add missing fields to domiciliations table
-- Date: 2025-12-16
-- Description: Adds coordonnees_fiscales, coordonnees_administratives,
--              and representant_fonction fields to align with frontend form
-- ============================================

-- Add coordonnees_fiscales if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'coordonnees_fiscales';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_fiscales` TEXT DEFAULT NULL COMMENT ''Coordonnées fiscales de l''''entreprise''',
    'SELECT "Column coordonnees_fiscales already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add coordonnees_administratives if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'coordonnees_administratives';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_administratives` TEXT DEFAULT NULL COMMENT ''Coordonnées administratives''',
    'SELECT "Column coordonnees_administratives already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add representant_fonction if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'representant_fonction';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `representant_fonction` VARCHAR(100) DEFAULT NULL COMMENT ''Fonction du représentant légal''',
    'SELECT "Column representant_fonction already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add date_creation_entreprise if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'date_creation_entreprise';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `date_creation_entreprise` DATE DEFAULT NULL COMMENT ''Date de création de l''''entreprise''',
    'SELECT "Column date_creation_entreprise already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for date_creation_entreprise if it doesn't exist
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND INDEX_NAME = 'idx_domiciliations_date_creation_entreprise';

SET @query = IF(@index_exists = 0,
    'CREATE INDEX `idx_domiciliations_date_creation_entreprise` ON `domiciliations` (`date_creation_entreprise`)',
    'SELECT "Index idx_domiciliations_date_creation_entreprise already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
