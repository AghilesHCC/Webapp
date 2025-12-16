-- ============================================
-- Migration: Add missing fields to domiciliations table
-- Date: 2025-12-16
-- Description: Adds coordonnees_fiscales, coordonnees_administratives,
--              and representant_fonction fields to align with frontend form
-- ============================================

-- Add missing columns to domiciliations table
ALTER TABLE `domiciliations`
ADD COLUMN IF NOT EXISTS `coordonnees_fiscales` TEXT DEFAULT NULL COMMENT 'Coordonnées fiscales de l''entreprise',
ADD COLUMN IF NOT EXISTS `coordonnees_administratives` TEXT DEFAULT NULL COMMENT 'Coordonnées administratives',
ADD COLUMN IF NOT EXISTS `representant_fonction` VARCHAR(100) DEFAULT NULL COMMENT 'Fonction du représentant légal',
ADD COLUMN IF NOT EXISTS `date_creation_entreprise` DATE DEFAULT NULL COMMENT 'Date de création de l''entreprise';

-- Add index for date_creation_entreprise for reporting queries
CREATE INDEX IF NOT EXISTS `idx_domiciliations_date_creation_entreprise` ON `domiciliations` (`date_creation_entreprise`);
