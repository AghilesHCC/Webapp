-- ============================================
-- Migration: Add Google ID to users table
-- Description: Adds google_id column for Google OAuth authentication
-- ============================================

ALTER TABLE `users` ADD COLUMN `google_id` VARCHAR(255) DEFAULT NULL AFTER `avatar`;

CREATE INDEX `idx_users_google_id` ON `users` (`google_id`);
