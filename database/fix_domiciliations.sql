-- ============================================
-- Fix domiciliations table - Run this on your database
-- ============================================

-- Check and add coordonnees_fiscales
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'coordonnees_fiscales';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_fiscales` TEXT DEFAULT NULL',
    'SELECT "coordonnees_fiscales exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add coordonnees_administratives
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'coordonnees_administratives';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `coordonnees_administratives` TEXT DEFAULT NULL',
    'SELECT "coordonnees_administratives exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add representant_fonction
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'representant_fonction';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `representant_fonction` VARCHAR(100) DEFAULT NULL',
    'SELECT "representant_fonction exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add date_creation_entreprise
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'domiciliations'
AND COLUMN_NAME = 'date_creation_entreprise';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE `domiciliations` ADD COLUMN `date_creation_entreprise` DATE DEFAULT NULL',
    'SELECT "date_creation_entreprise exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration completed successfully' AS result;
