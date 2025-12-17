/*
  # Ajout de la policy INSERT pour les notifications
  
  1. Policy ajoutée
    - Permet aux utilisateurs authentifiés d'insérer des notifications
    - Nécessaire pour le système de parrainage
  
  2. Sécurité
    - Seuls les utilisateurs authentifiés peuvent créer des notifications
    - Utilisé pour les notifications de parrainage entre utilisateurs
*/

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
