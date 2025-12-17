# Configuration Supabase

## ✅ Ce qui est déjà configuré

L'application utilise maintenant **Supabase** au lieu de PHP/MySQL :

- ✅ Base de données Supabase cloud
- ✅ Authentification email/password
- ✅ Gestion automatique des sessions
- ✅ Triggers de création de profil
- ✅ Système de parrainage
- ✅ Pas de serveur PHP requis !

## 🌐 Avantages de Supabase

1. **Fonctionne partout** : En local, en production, n'importe où
2. **Pas de serveur** : Plus besoin de gérer PHP/MySQL
3. **Sécurisé** : Authentification gérée par Supabase
4. **Temps réel** : Support des mises à jour en temps réel
5. **Gratuit** : 50 000 utilisateurs actifs mensuels gratuits

## 🔐 Configuration Google OAuth (optionnel)

### Étape 1 : Créer une application Google

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API"
4. Allez dans "APIs & Services" > "Credentials"
5. Cliquez sur "Create Credentials" > "OAuth 2.0 Client ID"
6. Configurez l'écran de consentement OAuth si demandé
7. Sélectionnez "Web application"
8. Ajoutez ces URLs de redirection autorisées :
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```
9. Copiez le **Client ID** et **Client Secret**

### Étape 2 : Configurer Supabase

1. Allez sur [votre dashboard Supabase](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f)
2. Allez dans "Authentication" > "Providers"
3. Trouvez "Google" et activez-le
4. Collez votre **Client ID** et **Client Secret**
5. Sauvegardez

### Étape 3 : Testez

1. Redémarrez votre application : `npm run dev`
2. Allez sur `/connexion` ou `/inscription`
3. Cliquez sur "Continuer avec Google"
4. Connectez-vous avec votre compte Google

## 🚀 Déploiement

### Variables d'environnement

Votre `.env` contient déjà les bonnes variables :

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Déployer sur n'importe quel hébergeur

Vous pouvez déployer sur :

- **Vercel** : `vercel deploy`
- **Netlify** : `netlify deploy`
- **Votre serveur cPanel** : Uploadez le dossier `dist/`
- **GitHub Pages** : Push sur GitHub et activez Pages

Pas besoin de PHP ni MySQL ! Juste des fichiers statiques.

## 📦 Structure actuelle

```
src/
├── lib/
│   └── supabase.ts          # Client Supabase configuré
├── store/
│   └── authStore.ts         # Store d'authentification (Zustand + Supabase)
├── pages/
│   ├── Login.tsx            # Page de connexion (email + Google)
│   └── Register.tsx         # Page d'inscription (email + Google)
```

## 🔧 API Backend (ancien PHP)

L'ancien backend PHP (`/api/*`) n'est **plus nécessaire** mais reste disponible si vous voulez migrer progressivement.

Pour utiliser uniquement Supabase, tous vos appels API se font maintenant via le client Supabase :

```typescript
import { supabase } from './lib/supabase'

// Login
await supabase.auth.signInWithPassword({ email, password })

// Register
await supabase.auth.signUp({ email, password })

// Get user
await supabase.auth.getUser()

// Logout
await supabase.auth.signOut()
```

## 🆘 Support

Si vous avez besoin d'aide :
1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Vérifiez les logs dans le [dashboard Supabase](https://supabase.com/dashboard)
