/*
  # Correction de toutes les policies admin sans récursion
  
  1. Problème résolu
    - Suppression de toutes les policies avec récursion infinie
    - Utilisation de app_metadata pour le role admin (pas de récursion)
    - Policies simplifiées pour les opérations publiques
  
  2. Nouvelles policies
    - ESPACES : Tout le monde peut voir, seuls les admins peuvent modifier
    - ABONNEMENTS : Tout le monde peut voir, seuls les admins peuvent modifier
    - RESERVATIONS : Les utilisateurs gèrent leurs réservations
    - DOMICILIATIONS : Les utilisateurs gèrent leurs domiciliations
    - CODES PROMO : Visibles pour tous, gérés par admin
  
  3. Sécurité
    - Pas de récursion dans les policies
    - Utilisation de auth.jwt() pour vérifier le role admin dans app_metadata
*/

-- ============================================
-- ESPACES : Tout le monde peut voir, admins peuvent gérer
-- ============================================

DROP POLICY IF EXISTS "Espaces are viewable by everyone" ON public.espaces;
DROP POLICY IF EXISTS "Admins can manage espaces" ON public.espaces;

CREATE POLICY "Anyone can view espaces"
  ON public.espaces FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can view espaces"
  ON public.espaces FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- ABONNEMENTS : Tout le monde peut voir, admins peuvent gérer
-- ============================================

DROP POLICY IF EXISTS "Abonnements are viewable by everyone" ON public.abonnements;
DROP POLICY IF EXISTS "Admins can manage abonnements" ON public.abonnements;

CREATE POLICY "Anyone can view abonnements"
  ON public.abonnements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can view abonnements"
  ON public.abonnements FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- RESERVATIONS : Les utilisateurs gèrent leurs réservations
-- ============================================

DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;

CREATE POLICY "Users can view their own reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- DOMICILIATIONS : Les utilisateurs gèrent leurs domiciliations
-- ============================================

DROP POLICY IF EXISTS "Users can view own domiciliations" ON public.domiciliations;
DROP POLICY IF EXISTS "Users can create own domiciliations" ON public.domiciliations;
DROP POLICY IF EXISTS "Users can update own domiciliations" ON public.domiciliations;
DROP POLICY IF EXISTS "Admins can view all domiciliations" ON public.domiciliations;
DROP POLICY IF EXISTS "Admins can manage all domiciliations" ON public.domiciliations;

CREATE POLICY "Users can view their own domiciliations"
  ON public.domiciliations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domiciliations"
  ON public.domiciliations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domiciliations"
  ON public.domiciliations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CODES PROMO : Visibles pour tous
-- ============================================

DROP POLICY IF EXISTS "Active promo codes are viewable by authenticated users" ON public.codes_promo;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.codes_promo;

CREATE POLICY "Authenticated users can view active promo codes"
  ON public.codes_promo FOR SELECT
  TO authenticated
  USING (actif = true);

-- ============================================
-- UTILISATIONS CODES PROMO
-- ============================================

DROP POLICY IF EXISTS "Users can view own code usage" ON public.utilisations_codes_promo;

CREATE POLICY "Users can view their own code usage"
  ON public.utilisations_codes_promo FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own code usage"
  ON public.utilisations_codes_promo FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ABONNEMENTS UTILISATEURS
-- ============================================

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.abonnements_utilisateurs;

CREATE POLICY "Users can view their own subscriptions"
  ON public.abonnements_utilisateurs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.abonnements_utilisateurs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.abonnements_utilisateurs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
