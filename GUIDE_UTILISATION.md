# Guide d'utilisation - Application COFFICE

## Comment créer un compte et se connecter

### Option 1 : Créer un nouveau compte (Recommandé)

1. **Accédez à la page d'inscription**
   - Allez sur `/inscription` ou cliquez sur "Créer un compte"

2. **Remplissez le formulaire d'inscription**
   - Email : Votre adresse email
   - Mot de passe : Au moins 6 caractères
   - Nom : Votre nom de famille
   - Prénom : Votre prénom
   - Téléphone : Votre numéro de téléphone
   - Profession : Votre profession (optionnel)
   - Entreprise : Nom de votre entreprise (optionnel)
   - Code de parrainage : Code d'un ami (optionnel)

3. **Cliquez sur "Créer mon compte"**
   - Vous serez automatiquement connecté
   - Votre profil sera créé automatiquement
   - Un code de parrainage personnel vous sera attribué

4. **Profitez de l'application !**
   - Vous pouvez maintenant réserver des espaces
   - Demander une domiciliation
   - Voir votre tableau de bord

### Option 2 : Se connecter avec un compte existant

Si vous avez déjà créé un compte précédemment :

1. **Accédez à la page de connexion**
   - Allez sur `/connexion` ou cliquez sur "Se connecter"

2. **Entrez vos identifiants**
   - Email : Votre adresse email
   - Mot de passe : Votre mot de passe

3. **Cliquez sur "Se connecter"**
   - Vous serez redirigé vers votre tableau de bord

## Problèmes courants et solutions

### "Email ou mot de passe incorrect"

**Causes possibles :**
- Vous n'avez pas encore créé de compte → Allez sur `/inscription`
- Votre mot de passe est incorrect → Vérifiez votre mot de passe
- Vous utilisez le mauvais email → Vérifiez votre email

**Solution :**
- Si vous n'avez jamais créé de compte, créez-en un nouveau
- Si vous avez oublié votre mot de passe, créez un nouveau compte avec un autre email

### "Impossible de charger le profil"

**Cause :**
- Le profil n'a pas été créé correctement lors de l'inscription

**Solution :**
- Créez un nouveau compte avec un email différent
- Attendez 2-3 secondes après l'inscription avant de se connecter

### La page ne se charge pas

**Solution :**
- Rafraîchissez la page (F5)
- Videz le cache du navigateur (Ctrl+Shift+Del)
- Essayez en navigation privée
- Vérifiez votre connexion Internet

## Fonctionnalités disponibles

### Pour tous les utilisateurs

1. **Page d'accueil** (`/`)
   - Présentation de COFFICE
   - Appel à l'action pour réserver

2. **Espaces et tarifs** (`/espaces`)
   - Voir tous les espaces disponibles
   - Consulter les tarifs
   - Voir les équipements

3. **Domiciliation** (`/domiciliation`)
   - Informations sur la domiciliation commerciale
   - Formulaire de demande

4. **À propos** (`/a-propos`)
   - Histoire de COFFICE
   - Valeurs et mission

### Utilisateurs connectés

5. **Tableau de bord** (`/dashboard`)
   - Vue d'ensemble de votre activité
   - Statistiques personnelles

6. **Mes réservations** (`/dashboard/reservations`)
   - Créer une nouvelle réservation
   - Voir toutes vos réservations
   - Annuler des réservations

7. **Ma domiciliation** (`/dashboard/domiciliation`)
   - Demander une domiciliation commerciale
   - Suivre l'état de votre demande
   - Gérer votre domiciliation

8. **Mon entreprise** (`/dashboard/ma-societe`)
   - Compléter les informations de votre entreprise
   - Gérer vos documents

9. **Mon profil** (`/dashboard/profil`)
   - Modifier vos informations personnelles
   - Changer votre mot de passe
   - Voir votre code de parrainage

10. **Codes promo** (`/dashboard/codes-promo`)
    - Voir les codes promo disponibles
    - Utiliser un code promo

### Administrateurs

11. **Gestion des utilisateurs** (`/dashboard/admin/users`)
    - Voir tous les utilisateurs
    - Modifier les rôles
    - Gérer les statuts

12. **Gestion des espaces** (`/dashboard/admin/spaces`)
    - Créer/modifier/supprimer des espaces
    - Gérer la disponibilité
    - Fixer les tarifs

13. **Gestion des réservations** (`/dashboard/admin/reservations`)
    - Voir toutes les réservations
    - Confirmer/annuler des réservations

14. **Gestion des domiciliations** (`/dashboard/admin/domiciliations`)
    - Voir toutes les demandes
    - Approuver/rejeter des domiciliations

15. **Codes promo** (`/dashboard/admin/codes-promo`)
    - Créer des codes promo
    - Gérer les codes existants

16. **Parrainages** (`/dashboard/admin/parrainages`)
    - Voir tous les codes de parrainage
    - Statistiques de parrainage

17. **Abonnements** (`/dashboard/admin/abonnements`)
    - Gérer les formules d'abonnement

18. **Statistiques** (`/dashboard/admin/analytics`)
    - Tableau de bord analytique
    - Revenus et statistiques

## Architecture technique

### Frontend
- **React** 18.2 avec TypeScript
- **Vite** pour le build
- **React Router** pour la navigation
- **Zustand** pour la gestion d'état
- **React Query** pour les requêtes
- **Tailwind CSS** pour le design

### Backend
- **PHP** avec API REST
  - Authentication (email/password + Google OAuth)
  - Base de donnees MySQL
  - Validation et securite JWT
  - API structuree

### Sécurité
- Authentification securisee avec JWT
- Validation côté client et serveur
- Sessions sécurisées avec JWT
- Protection CORS automatique

## Support

En cas de problème :

1. Vérifiez ce guide
2. Videz le cache du navigateur
3. Essayez en navigation privée
4. Créez un nouveau compte avec un email différent

## Notes importantes

- **Confirmation d'email** : Désactivée pour faciliter les tests
- **Mot de passe minimum** : 6 caractères
- **Sessions** : Persistantes, vous restez connecté
- **Déconnexion automatique** : Aucune, sauf déconnexion manuelle

## Prochaines fonctionnalités

- [ ] Paiement en ligne (CIB/Chargily)
- [ ] Notifications en temps réel
- [ ] Chat support
- [ ] Export PDF des réservations
- [ ] Application mobile
- [ ] Multi-langues (AR/FR/EN)
