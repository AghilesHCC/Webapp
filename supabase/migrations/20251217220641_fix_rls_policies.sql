/*
  # Correction des policies RLS sans récursion
  
  1. Problème résolu
    - Suppression des policies avec récursion infinie
    - Création de policies simples et efficaces
    - Permission pour le trigger de créer des profils
  
  2. Nouvelles policies
    - Profiles : Les utilisateurs peuvent voir/modifier leur propre profil
    - Parrainages : Les utilisateurs peuvent voir tous les codes et modifier le leur
    - Notifications : Les utilisateurs peuvent voir leurs propres notifications
  
  3. Sécurité
    - Pas de récursion dans les policies
    - Les triggers utilisent SECURITY DEFINER pour contourner RLS
*/

-- Supprimer toutes les policies existantes qui causent la récursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own parrainage" ON public.parrainages;
DROP POLICY IF EXISTS "Users can view all parrainage codes" ON public.parrainages;
DROP POLICY IF EXISTS "Admins can manage parrainages" ON public.parrainages;

-- PROFILES: Policies simples sans récursion
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PARRAINAGES: Les utilisateurs peuvent voir tous les codes de parrainage
CREATE POLICY "Users can view all referral codes"
  ON public.parrainages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own referral"
  ON public.parrainages FOR SELECT
  TO authenticated
  USING (auth.uid() = parrain_id);

CREATE POLICY "Users can update their own referral"
  ON public.parrainages FOR UPDATE
  TO authenticated
  USING (auth.uid() = parrain_id)
  WITH CHECK (auth.uid() = parrain_id);

-- NOTIFICATIONS: Les utilisateurs peuvent voir et mettre à jour leurs propres notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
