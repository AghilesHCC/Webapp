-- ============================================
-- COFFICE - Script de création de base de données
-- Version: 3.0.0
-- Compatible: MySQL 8.0+
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLE: users
-- Stocke tous les comptes utilisateurs
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `telephone` VARCHAR(20) DEFAULT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `statut` ENUM('actif', 'inactif', 'suspendu') NOT NULL DEFAULT 'actif',
    `avatar` VARCHAR(500) DEFAULT NULL,
    `profession` VARCHAR(100) DEFAULT NULL,
    `entreprise` VARCHAR(200) DEFAULT NULL,
    `adresse` TEXT DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `wilaya` VARCHAR(100) DEFAULT NULL,
    `commune` VARCHAR(100) DEFAULT NULL,
    `type_entreprise` VARCHAR(100) DEFAULT NULL,
    `nif` VARCHAR(50) DEFAULT NULL,
    `nis` VARCHAR(50) DEFAULT NULL,
    `registre_commerce` VARCHAR(50) DEFAULT NULL,
    `article_imposition` VARCHAR(50) DEFAULT NULL,
    `numero_auto_entrepreneur` VARCHAR(50) DEFAULT NULL,
    `raison_sociale` VARCHAR(200) DEFAULT NULL,
    `date_creation_entreprise` DATE DEFAULT NULL,
    `capital` DECIMAL(15, 2) DEFAULT NULL,
    `siege_social` VARCHAR(255) DEFAULT NULL,
    `activite_principale` VARCHAR(200) DEFAULT NULL,
    `forme_juridique` VARCHAR(50) DEFAULT NULL,
    `absences` INT DEFAULT 0,
    `banned_until` DATETIME DEFAULT NULL,
    `derniere_connexion` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    KEY `idx_users_role` (`role`),
    KEY `idx_users_statut` (`statut`),
    KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: espaces
-- Stocke les espaces de travail disponibles
-- ============================================
DROP TABLE IF EXISTS `espaces`;
CREATE TABLE `espaces` (
    `id` VARCHAR(36) NOT NULL,
    `nom` VARCHAR(200) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `capacite` INT NOT NULL DEFAULT 1,
    `equipements` JSON DEFAULT NULL,
    `prix_heure` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `prix_demi_journee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `prix_jour` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `prix_semaine` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `disponible` TINYINT(1) NOT NULL DEFAULT 1,
    `image_url` VARCHAR(500) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_espaces_type` (`type`),
    KEY `idx_espaces_disponible` (`disponible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: codes_promo
-- Stocke les codes promotionnels
-- ============================================
DROP TABLE IF EXISTS `codes_promo`;
CREATE TABLE `codes_promo` (
    `id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `type` ENUM('pourcentage', 'montant_fixe') NOT NULL DEFAULT 'pourcentage',
    `valeur` DECIMAL(10, 2) NOT NULL,
    `date_debut` DATETIME NOT NULL,
    `date_fin` DATETIME NOT NULL,
    `utilisations_max` INT DEFAULT NULL,
    `utilisations_actuelles` INT NOT NULL DEFAULT 0,
    `montant_min` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `types_application` JSON DEFAULT NULL,
    `actif` TINYINT(1) NOT NULL DEFAULT 1,
    `description` TEXT DEFAULT NULL,
    `conditions` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_codes_promo_code` (`code`),
    KEY `idx_codes_promo_actif` (`actif`),
    KEY `idx_codes_promo_dates` (`date_debut`, `date_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reservations
-- Stocke les reservations d'espaces
-- ============================================
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `espace_id` VARCHAR(36) NOT NULL,
    `date_debut` DATETIME NOT NULL,
    `date_fin` DATETIME NOT NULL,
    `statut` ENUM('en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee') NOT NULL DEFAULT 'en_attente',
    `type_reservation` ENUM('heure', 'demi_journee', 'jour') NOT NULL DEFAULT 'heure',
    `montant_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `reduction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `code_promo_id` VARCHAR(36) DEFAULT NULL,
    `montant_paye` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `mode_paiement` VARCHAR(50) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `participants` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_reservations_user_id` (`user_id`),
    KEY `idx_reservations_espace_id` (`espace_id`),
    KEY `idx_reservations_statut` (`statut`),
    KEY `idx_reservations_dates` (`date_debut`, `date_fin`),
    KEY `idx_reservations_created_at` (`created_at`),
    CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reservations_espace` FOREIGN KEY (`espace_id`) REFERENCES `espaces` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reservations_code_promo` FOREIGN KEY (`code_promo_id`) REFERENCES `codes_promo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: utilisations_codes_promo
-- Historique d'utilisation des codes promo
-- ============================================
DROP TABLE IF EXISTS `utilisations_codes_promo`;
CREATE TABLE `utilisations_codes_promo` (
    `id` VARCHAR(36) NOT NULL,
    `code_promo_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `reservation_id` VARCHAR(36) DEFAULT NULL,
    `montant_reduction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `montant_avant` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `montant_apres` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `type_utilisation` ENUM('reservation', 'domiciliation', 'abonnement') NOT NULL DEFAULT 'reservation',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_utilisations_user_promo` (`code_promo_id`, `user_id`),
    KEY `idx_utilisations_user_id` (`user_id`),
    CONSTRAINT `fk_utilisations_code_promo` FOREIGN KEY (`code_promo_id`) REFERENCES `codes_promo` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_utilisations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_utilisations_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: parrainages
-- Systeme de parrainage
-- ============================================
DROP TABLE IF EXISTS `parrainages`;
CREATE TABLE `parrainages` (
    `id` VARCHAR(36) NOT NULL,
    `parrain_id` VARCHAR(36) NOT NULL,
    `code_parrain` VARCHAR(20) NOT NULL,
    `parraines` INT NOT NULL DEFAULT 0,
    `recompenses_totales` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_parrainages_parrain_id` (`parrain_id`),
    UNIQUE KEY `uk_parrainages_code` (`code_parrain`),
    CONSTRAINT `fk_parrainages_user` FOREIGN KEY (`parrain_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: notifications
-- Notifications utilisateurs
-- ============================================
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `type` ENUM('parrainage', 'reservation', 'domiciliation', 'abonnement', 'system') NOT NULL DEFAULT 'system',
    `titre` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `lue` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_id` (`user_id`),
    KEY `idx_notifications_lue` (`lue`),
    KEY `idx_notifications_created_at` (`created_at`),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: domiciliations
-- Demandes de domiciliation d'entreprise
-- ============================================
DROP TABLE IF EXISTS `domiciliations`;
CREATE TABLE `domiciliations` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `raison_sociale` VARCHAR(200) NOT NULL,
    `forme_juridique` VARCHAR(50) NOT NULL,
    `capital` DECIMAL(15, 2) DEFAULT NULL,
    `activite_principale` VARCHAR(200) DEFAULT NULL,
    `nif` VARCHAR(50) DEFAULT NULL,
    `nis` VARCHAR(50) DEFAULT NULL,
    `registre_commerce` VARCHAR(50) DEFAULT NULL,
    `article_imposition` VARCHAR(50) DEFAULT NULL,
    `numero_auto_entrepreneur` VARCHAR(50) DEFAULT NULL,
    `wilaya` VARCHAR(100) DEFAULT NULL,
    `commune` VARCHAR(100) DEFAULT NULL,
    `adresse_actuelle` TEXT DEFAULT NULL,
    `representant_nom` VARCHAR(100) DEFAULT NULL,
    `representant_prenom` VARCHAR(100) DEFAULT NULL,
    `representant_fonction` VARCHAR(100) DEFAULT NULL,
    `representant_telephone` VARCHAR(20) DEFAULT NULL,
    `representant_email` VARCHAR(255) DEFAULT NULL,
    `coordonnees_fiscales` TEXT DEFAULT NULL,
    `coordonnees_administratives` TEXT DEFAULT NULL,
    `date_creation_entreprise` DATE DEFAULT NULL,
    `statut` ENUM('en_attente', 'en_cours', 'validee', 'active', 'rejetee', 'expiree') NOT NULL DEFAULT 'en_attente',
    `montant_mensuel` DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
    `notes_admin` TEXT DEFAULT NULL,
    `visible_sur_site` TINYINT(1) DEFAULT 0,
    `date_debut` DATE DEFAULT NULL,
    `date_fin` DATE DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_domiciliations_user_id` (`user_id`),
    KEY `idx_domiciliations_statut` (`statut`),
    KEY `idx_domiciliations_created_at` (`created_at`),
    CONSTRAINT `fk_domiciliations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: abonnements
-- Plans d'abonnement disponibles
-- ============================================
DROP TABLE IF EXISTS `abonnements`;
CREATE TABLE `abonnements` (
    `id` VARCHAR(36) NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `type` ENUM('mensuel', 'trimestriel', 'annuel') NOT NULL DEFAULT 'mensuel',
    `prix` DECIMAL(10, 2) NOT NULL,
    `prix_avec_domiciliation` DECIMAL(10, 2) DEFAULT NULL,
    `duree_mois` INT NOT NULL DEFAULT 1,
    `description` TEXT DEFAULT NULL,
    `avantages` JSON DEFAULT NULL,
    `actif` TINYINT(1) NOT NULL DEFAULT 1,
    `statut` ENUM('actif', 'inactif') NOT NULL DEFAULT 'actif',
    `ordre` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_abonnements_actif` (`actif`),
    KEY `idx_abonnements_ordre` (`ordre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: abonnements_utilisateurs
-- Abonnements des utilisateurs
-- ============================================
DROP TABLE IF EXISTS `abonnements_utilisateurs`;
CREATE TABLE `abonnements_utilisateurs` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `abonnement_id` VARCHAR(36) NOT NULL,
    `date_debut` DATE NOT NULL,
    `date_fin` DATE NOT NULL,
    `statut` ENUM('actif', 'inactif', 'expire', 'annule') NOT NULL DEFAULT 'actif',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_abonnements_utilisateurs_user_id` (`user_id`),
    KEY `idx_abonnements_utilisateurs_abonnement_id` (`abonnement_id`),
    KEY `idx_abonnements_utilisateurs_statut` (`statut`),
    KEY `idx_abonnements_utilisateurs_dates` (`date_debut`, `date_fin`),
    CONSTRAINT `fk_abonnements_utilisateurs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_abonnements_utilisateurs_abonnement` FOREIGN KEY (`abonnement_id`) REFERENCES `abonnements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DONNEES INITIALES
-- ============================================

-- Creer un compte administrateur par defaut
-- Email: admin@coffice.dz / Mot de passe: Admin123!
INSERT INTO `users` (`id`, `email`, `password_hash`, `nom`, `prenom`, `role`, `statut`) VALUES
(UUID(), 'admin@coffice.dz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Coffice', 'admin', 'actif');

-- Espaces de travail par defaut
-- 3 Private Booths (exclusifs) + 1 Espace Coworking (12 places partagees)
INSERT INTO `espaces` (`id`, `nom`, `type`, `description`, `capacite`, `equipements`, `prix_heure`, `prix_demi_journee`, `prix_jour`, `prix_semaine`, `disponible`, `image_url`) VALUES
(UUID(), 'Booth Atlas', 'booth', 'Booth privatif calme et confortable pour travailler en toute concentration', 4, '["WiFi haut debit", "Prise electrique", "Climatisation", "Eclairage LED"]', 1000, 3500, 6000, 0, 1, '/booth-atlas.jpeg'),
(UUID(), 'Booth Aures', 'booth', 'Booth privatif insonorise ideal pour les appels et visioconferences', 4, '["WiFi haut debit", "Prise electrique", "Insonorisation", "Climatisation"]', 1000, 3500, 6000, 0, 1, '/booth-aures.jpeg'),
(UUID(), 'Booth Hoggar', 'booth', 'Booth premium compact avec vue panoramique', 2, '["WiFi haut debit", "Prise electrique", "Climatisation", "Vue panoramique"]', 800, 3000, 5000, 0, 1, '/booth-hoggar.jpeg'),
(UUID(), 'Espace Coworking', 'open_space', 'Espace de coworking partage avec 12 postes individuels', 12, '["WiFi haut debit", "Imprimante", "Cuisine", "Climatisation", "Casiers", "Cafe et the"]', 200, 600, 1200, 0, 1, '/espace-coworking.jpeg');

-- Abonnements par defaut
INSERT INTO `abonnements` (`id`, `nom`, `type`, `prix`, `prix_avec_domiciliation`, `duree_mois`, `description`, `avantages`, `actif`, `ordre`) VALUES
(UUID(), 'Nomade', 'mensuel', 8000, 12000, 1, 'Accès flexible aux espaces de coworking', '["5 jours d''accès par mois", "WiFi haut débit", "Café et thé inclus", "Accès aux événements"]', 1, 1),
(UUID(), 'Résident', 'mensuel', 15000, 19000, 1, 'Accès illimité aux espaces partagés', '["Accès illimité", "Bureau dédié", "Casier personnel", "Salle de réunion 2h/mois", "Café et thé inclus"]', 1, 2),
(UUID(), 'Premium', 'mensuel', 25000, 28000, 1, 'Bureau privé et services premium', '["Bureau privé", "Accès 24/7", "Salle de réunion 5h/mois", "Adresse commerciale", "Services conciergerie"]', 1, 3);
