/*
  # Trigger de création automatique du profil utilisateur
  
  1. Fonction
    - Crée automatiquement un profil dans la table `profiles` quand un utilisateur s'inscrit via Supabase Auth
    - Crée automatiquement un code de parrainage unique pour chaque nouvel utilisateur
  
  2. Trigger
    - Se déclenche après insertion dans `auth.users`
    - Gère à la fois l'inscription par email/password et OAuth (Google)
  
  3. Sécurité
    - Utilise les données de `raw_user_meta_data` pour les informations utilisateur
    - Génère un code parrainage unique basé sur l'ID utilisateur
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_code_parrain TEXT;
BEGIN
  v_code_parrain := 'COFFICE' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  
  INSERT INTO public.profiles (
    id,
    email,
    nom,
    prenom,
    telephone,
    profession,
    entreprise,
    role,
    statut,
    derniere_connexion
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    NEW.raw_user_meta_data->>'telephone',
    NEW.raw_user_meta_data->>'profession',
    NEW.raw_user_meta_data->>'entreprise',
    'user',
    'actif',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.parrainages (
    parrain_id,
    code_parrain,
    parraines,
    recompenses_totales
  )
  VALUES (
    NEW.id,
    v_code_parrain,
    0,
    0
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
