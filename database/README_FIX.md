# Correction de la table domiciliations

## Problème

La syntaxe `ADD COLUMN IF NOT EXISTS` n'existe **pas** dans MySQL. C'est une syntaxe PostgreSQL/SQLite uniquement.

## Étape 1: Diagnostic (Obligatoire)

Avant de corriger, vérifiez quelles colonnes manquent en accédant à:

```
https://test.coffice.dz/api/check-domiciliations-table.php
```

Ce script affichera:
- Les colonnes existantes
- Les colonnes manquantes
- Le statut de la table

## Étape 2: Solutions disponibles

### Option 1: Script PHP (Recommandé - Plus simple)

Uploadez le fichier `api/fix-domiciliations-table.php` sur votre serveur, puis accédez-y via navigateur:

```
https://test.coffice.dz/api/fix-domiciliations-table.php
```

Le script affichera un JSON avec le résultat de chaque colonne ajoutée.

**Avantages:**
- Simple à exécuter
- Retourne un résultat clair
- Sûr (vérifie avant d'ajouter)

### Option 2: Script SQL via phpMyAdmin

1. Connectez-vous à phpMyAdmin
2. Sélectionnez votre base de données
3. Allez dans l'onglet "SQL"
4. Copiez-collez le contenu de `database/fix_domiciliations.sql`
5. Cliquez sur "Exécuter"

**Note:** Certains hébergeurs désactivent les requêtes PREPARE/EXECUTE. Si vous avez une erreur, utilisez l'Option 1.

### Option 3: Script SQL via ligne de commande

```bash
mysql -u votre_user -p votre_base < database/fix_domiciliations.sql
```

## Vérification

Après l'exécution, vérifiez que les colonnes ont été ajoutées:

```sql
DESCRIBE domiciliations;
```

Vous devriez voir:
- `coordonnees_fiscales` (TEXT)
- `coordonnees_administratives` (TEXT)
- `representant_fonction` (VARCHAR)
- `date_creation_entreprise` (DATE)

## Suppression après correction

Une fois la correction appliquée avec succès, vous pouvez **supprimer** le fichier `api/fix-domiciliations-table.php` pour des raisons de sécurité.
