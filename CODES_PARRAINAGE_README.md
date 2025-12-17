# Système de Parrainage Automatique

## Résumé des Changements

Le système de parrainage a été modifié pour créer automatiquement un code de parrainage pour chaque utilisateur lors de l'inscription.

## Fonctionnement

### 1. Création Automatique lors de l'Inscription

Chaque nouvel utilisateur reçoit automatiquement un code de parrainage au format :
```
COFFICE + 6 caractères de son ID
Exemple: COFFICE3A2F1E
```

Ce code est créé automatiquement par l'API d'inscription (`api/auth/register.php`).

### 2. Affichage du Code

Le code de parrainage est maintenant **toujours visible** dans :

- **Dashboard utilisateur** : Carte "Mon Code" avec statistiques
- **Page Profil** : Section complète avec options de partage

Plus besoin de cliquer sur "Générer mon code" - le code est créé automatiquement et affiché immédiatement.

### 3. Migration pour Utilisateurs Existants

Si vous avez des utilisateurs créés avant cette mise à jour qui n'ont pas de code de parrainage, un script de migration est disponible :

**Fichier** : `api/parrainages/create-missing-codes.php`

**Utilisation** (en tant qu'admin) :
```bash
# Appel API avec token d'admin
POST /api/parrainages/create-missing-codes.php
Authorization: Bearer {admin_token}
```

Le script va :
1. Identifier tous les utilisateurs sans code de parrainage
2. Créer un code unique pour chacun
3. Retourner un rapport avec le nombre de codes créés

## Modifications Techniques

### Fichiers Modifiés

1. **src/pages/dashboard/Profile.tsx**
   - Suppression du bouton "Générer mon code"
   - Affichage automatique du code de parrainage
   - Boutons désactivés si le code n'est pas encore disponible

2. **src/components/dashboard/UserDashboard.tsx**
   - Suppression de la condition d'affichage
   - Carte toujours visible avec le code
   - Gestion de l'état "Chargement..." si le code n'est pas disponible

3. **api/auth/register.php**
   - Création automatique du code lors de l'inscription (déjà en place)

### Fichiers Créés

1. **api/parrainages/create-missing-codes.php**
   - Script de migration pour utilisateurs existants
   - Accessible uniquement aux administrateurs

## Flux Utilisateur

### Nouvel Utilisateur

1. Inscription sur la plateforme
2. Code de parrainage créé automatiquement
3. Code visible immédiatement dans le dashboard
4. Possibilité de partager le code avec les boutons "Copier" et "Partager"

### Utilisation du Code

1. L'utilisateur partage son code
2. Un nouvel utilisateur s'inscrit avec ce code
3. Le parrain reçoit :
   - +1 filleul dans ses statistiques
   - +3000 DA de récompenses
   - Une notification
4. Les statistiques sont mises à jour en temps réel

## Avantages

- **Simplicité** : Plus besoin de générer manuellement un code
- **Immédiateté** : Code disponible dès l'inscription
- **Cohérence** : Tous les utilisateurs ont un code
- **Meilleure UX** : Moins de clics, plus d'engagement
