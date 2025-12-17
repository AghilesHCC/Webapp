export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          nom: string
          prenom: string
          telephone: string | null
          role: 'admin' | 'user'
          statut: 'actif' | 'inactif' | 'suspendu'
          avatar: string | null
          profession: string | null
          entreprise: string | null
          adresse: string | null
          bio: string | null
          wilaya: string | null
          commune: string | null
          type_entreprise: 'auto_entrepreneur' | 'eurl' | 'sarl' | 'spa' | 'snc' | 'scs' | 'freelance' | 'autre' | null
          nif: string | null
          nis: string | null
          registre_commerce: string | null
          article_imposition: string | null
          numero_auto_entrepreneur: string | null
          raison_sociale: string | null
          date_creation_entreprise: string | null
          capital: number | null
          siege_social: string | null
          activite_principale: string | null
          forme_juridique: string | null
          absences: number
          banned_until: string | null
          derniere_connexion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          nom: string
          prenom: string
          telephone?: string | null
          role?: 'admin' | 'user'
          statut?: 'actif' | 'inactif' | 'suspendu'
          avatar?: string | null
          profession?: string | null
          entreprise?: string | null
          adresse?: string | null
          bio?: string | null
          wilaya?: string | null
          commune?: string | null
          type_entreprise?: 'auto_entrepreneur' | 'eurl' | 'sarl' | 'spa' | 'snc' | 'scs' | 'freelance' | 'autre' | null
          nif?: string | null
          nis?: string | null
          registre_commerce?: string | null
          article_imposition?: string | null
          numero_auto_entrepreneur?: string | null
          raison_sociale?: string | null
          date_creation_entreprise?: string | null
          capital?: number | null
          siege_social?: string | null
          activite_principale?: string | null
          forme_juridique?: string | null
          absences?: number
          banned_until?: string | null
          derniere_connexion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          role?: 'admin' | 'user'
          statut?: 'actif' | 'inactif' | 'suspendu'
          avatar?: string | null
          profession?: string | null
          entreprise?: string | null
          adresse?: string | null
          bio?: string | null
          wilaya?: string | null
          commune?: string | null
          type_entreprise?: 'auto_entrepreneur' | 'eurl' | 'sarl' | 'spa' | 'snc' | 'scs' | 'freelance' | 'autre' | null
          nif?: string | null
          nis?: string | null
          registre_commerce?: string | null
          article_imposition?: string | null
          numero_auto_entrepreneur?: string | null
          raison_sociale?: string | null
          date_creation_entreprise?: string | null
          capital?: number | null
          siege_social?: string | null
          activite_principale?: string | null
          forme_juridique?: string | null
          absences?: number
          banned_until?: string | null
          derniere_connexion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      espaces: {
        Row: {
          id: string
          nom: string
          type: 'box_4' | 'box_3' | 'open_space' | 'salle_reunion' | 'poste_informatique'
          capacite: number
          prix_heure: number
          prix_jour: number
          prix_semaine: number
          description: string | null
          equipements: Json | null
          disponible: boolean
          etage: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          type: 'box_4' | 'box_3' | 'open_space' | 'salle_reunion' | 'poste_informatique'
          capacite: number
          prix_heure: number
          prix_jour: number
          prix_semaine?: number
          description?: string | null
          equipements?: Json | null
          disponible?: boolean
          etage?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          type?: 'box_4' | 'box_3' | 'open_space' | 'salle_reunion' | 'poste_informatique'
          capacite?: number
          prix_heure?: number
          prix_jour?: number
          prix_semaine?: number
          description?: string | null
          equipements?: Json | null
          disponible?: boolean
          etage?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      abonnements: {
        Row: {
          id: string
          nom: string
          type: string
          prix: number
          prix_avec_domiciliation: number | null
          duree_mois: number
          description: string | null
          avantages: Json | null
          actif: boolean
          statut: 'actif' | 'inactif' | 'archive'
          ordre: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          type: string
          prix: number
          prix_avec_domiciliation?: number | null
          duree_mois?: number
          description?: string | null
          avantages?: Json | null
          actif?: boolean
          statut?: 'actif' | 'inactif' | 'archive'
          ordre?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          type?: string
          prix?: number
          prix_avec_domiciliation?: number | null
          duree_mois?: number
          description?: string | null
          avantages?: Json | null
          actif?: boolean
          statut?: 'actif' | 'inactif' | 'archive'
          ordre?: number
          created_at?: string
          updated_at?: string
        }
      }
      abonnements_utilisateurs: {
        Row: {
          id: string
          user_id: string
          abonnement_id: string
          date_debut: string
          date_fin: string
          statut: 'actif' | 'expire' | 'suspendu' | 'annule'
          auto_renouvellement: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          abonnement_id: string
          date_debut: string
          date_fin: string
          statut?: 'actif' | 'expire' | 'suspendu' | 'annule'
          auto_renouvellement?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          abonnement_id?: string
          date_debut?: string
          date_fin?: string
          statut?: 'actif' | 'expire' | 'suspendu' | 'annule'
          auto_renouvellement?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          espace_id: string
          date_debut: string
          date_fin: string
          statut: 'confirmee' | 'en_attente' | 'en_cours' | 'annulee' | 'terminee'
          type_reservation: 'heure' | 'jour' | 'semaine'
          montant_total: number
          reduction: number
          code_promo_id: string | null
          montant_paye: number
          mode_paiement: string | null
          notes: string | null
          annulee_par: string | null
          raison_annulation: string | null
          date_annulation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          espace_id: string
          date_debut: string
          date_fin: string
          statut?: 'confirmee' | 'en_attente' | 'en_cours' | 'annulee' | 'terminee'
          type_reservation?: 'heure' | 'jour' | 'semaine'
          montant_total: number
          reduction?: number
          code_promo_id?: string | null
          montant_paye?: number
          mode_paiement?: string | null
          notes?: string | null
          annulee_par?: string | null
          raison_annulation?: string | null
          date_annulation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          espace_id?: string
          date_debut?: string
          date_fin?: string
          statut?: 'confirmee' | 'en_attente' | 'en_cours' | 'annulee' | 'terminee'
          type_reservation?: 'heure' | 'jour' | 'semaine'
          montant_total?: number
          reduction?: number
          code_promo_id?: string | null
          montant_paye?: number
          mode_paiement?: string | null
          notes?: string | null
          annulee_par?: string | null
          raison_annulation?: string | null
          date_annulation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      domiciliations: {
        Row: {
          id: string
          user_id: string
          raison_sociale: string
          forme_juridique: string
          capital: number | null
          activite_principale: string | null
          nif: string | null
          nis: string | null
          registre_commerce: string | null
          article_imposition: string | null
          numero_auto_entrepreneur: string | null
          wilaya: string | null
          commune: string | null
          adresse_actuelle: string | null
          representant_nom: string | null
          representant_prenom: string | null
          representant_telephone: string | null
          representant_email: string | null
          statut: 'en_attente' | 'en_cours' | 'validee' | 'active' | 'rejetee' | 'expiree'
          date_debut: string | null
          date_fin: string | null
          montant_mensuel: number | null
          documents: Json | null
          notes_admin: string | null
          visible_sur_site: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raison_sociale: string
          forme_juridique: string
          capital?: number | null
          activite_principale?: string | null
          nif?: string | null
          nis?: string | null
          registre_commerce?: string | null
          article_imposition?: string | null
          numero_auto_entrepreneur?: string | null
          wilaya?: string | null
          commune?: string | null
          adresse_actuelle?: string | null
          representant_nom?: string | null
          representant_prenom?: string | null
          representant_telephone?: string | null
          representant_email?: string | null
          statut?: 'en_attente' | 'en_cours' | 'validee' | 'active' | 'refusee' | 'expiree' | 'resiliee'
          date_debut?: string | null
          date_fin?: string | null
          montant_mensuel?: number | null
          documents?: Json | null
          notes_admin?: string | null
          visible_sur_site?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          raison_sociale?: string
          forme_juridique?: string
          capital?: number | null
          activite_principale?: string | null
          nif?: string | null
          nis?: string | null
          registre_commerce?: string | null
          article_imposition?: string | null
          numero_auto_entrepreneur?: string | null
          wilaya?: string | null
          commune?: string | null
          adresse_actuelle?: string | null
          representant_nom?: string | null
          representant_prenom?: string | null
          representant_telephone?: string | null
          representant_email?: string | null
          statut?: 'en_attente' | 'en_cours' | 'validee' | 'active' | 'refusee' | 'expiree' | 'resiliee'
          date_debut?: string | null
          date_fin?: string | null
          montant_mensuel?: number | null
          documents?: Json | null
          notes_admin?: string | null
          visible_sur_site?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'abonnement' | 'reservation' | 'domiciliation' | 'remboursement'
          montant: number
          statut: 'en_attente' | 'completee' | 'echouee' | 'remboursee'
          mode_paiement: string | null
          reference: string | null
          description: string | null
          metadata: Json | null
          date_paiement: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'abonnement' | 'reservation' | 'domiciliation' | 'remboursement'
          montant: number
          statut?: 'en_attente' | 'completee' | 'echouee' | 'remboursee'
          mode_paiement?: string | null
          reference?: string | null
          description?: string | null
          metadata?: Json | null
          date_paiement?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'abonnement' | 'reservation' | 'domiciliation' | 'remboursement'
          montant?: number
          statut?: 'en_attente' | 'completee' | 'echouee' | 'remboursee'
          mode_paiement?: string | null
          reference?: string | null
          description?: string | null
          metadata?: Json | null
          date_paiement?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reservation' | 'abonnement' | 'domiciliation' | 'paiement' | 'promo' | 'parrainage' | 'systeme'
          titre: string
          message: string
          lue: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reservation' | 'abonnement' | 'domiciliation' | 'paiement' | 'promo' | 'parrainage' | 'systeme'
          titre: string
          message: string
          lue?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reservation' | 'abonnement' | 'domiciliation' | 'paiement' | 'promo' | 'parrainage' | 'systeme'
          titre?: string
          message?: string
          lue?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      codes_promo: {
        Row: {
          id: string
          code: string
          type: 'pourcentage' | 'montant_fixe'
          valeur: number
          date_debut: string
          date_fin: string
          utilisations_max: number | null
          utilisations_actuelles: number
          montant_min: number
          description: string | null
          conditions: string | null
          types_application: string | null
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'pourcentage' | 'montant_fixe'
          valeur: number
          date_debut: string
          date_fin: string
          utilisations_max?: number | null
          utilisations_actuelles?: number
          montant_min?: number
          description?: string | null
          conditions?: string | null
          types_application?: string | null
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'pourcentage' | 'montant_fixe'
          valeur?: number
          date_debut?: string
          date_fin?: string
          utilisations_max?: number | null
          utilisations_actuelles?: number
          montant_min?: number
          description?: string | null
          conditions?: string | null
          types_application?: string | null
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parrainages: {
        Row: {
          id: string
          parrain_id: string
          code_parrain: string
          parraines: number
          recompenses_totales: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parrain_id: string
          code_parrain: string
          parraines?: number
          recompenses_totales?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parrain_id?: string
          code_parrain?: string
          parraines?: number
          recompenses_totales?: number
          created_at?: string
          updated_at?: string
        }
      }
      parrainages_details: {
        Row: {
          id: string
          parrainage_id: string
          filleul_id: string
          recompense_parrain: number
          recompense_filleul: number
          statut: 'en_attente' | 'valide' | 'paye'
          date_inscription: string
          date_validation: string | null
        }
        Insert: {
          id?: string
          parrainage_id: string
          filleul_id: string
          recompense_parrain?: number
          recompense_filleul?: number
          statut?: 'en_attente' | 'valide' | 'paye'
          date_inscription?: string
          date_validation?: string | null
        }
        Update: {
          id?: string
          parrainage_id?: string
          filleul_id?: string
          recompense_parrain?: number
          recompense_filleul?: number
          statut?: 'en_attente' | 'valide' | 'paye'
          date_inscription?: string
          date_validation?: string | null
        }
      }
      utilisations_codes_promo: {
        Row: {
          id: string
          code_promo_id: string
          user_id: string
          reservation_id: string | null
          abonnement_id: string | null
          domiciliation_id: string | null
          montant_reduction: number
          montant_avant: number
          montant_apres: number
          type_utilisation: 'reservation' | 'abonnement' | 'domiciliation'
          created_at: string
        }
        Insert: {
          id?: string
          code_promo_id: string
          user_id: string
          reservation_id?: string | null
          abonnement_id?: string | null
          domiciliation_id?: string | null
          montant_reduction: number
          montant_avant: number
          montant_apres: number
          type_utilisation: 'reservation' | 'abonnement' | 'domiciliation'
          created_at?: string
        }
        Update: {
          id?: string
          code_promo_id?: string
          user_id?: string
          reservation_id?: string | null
          abonnement_id?: string | null
          domiciliation_id?: string | null
          montant_reduction?: number
          montant_avant?: number
          montant_apres?: number
          type_utilisation?: 'reservation' | 'abonnement' | 'domiciliation'
          created_at?: string
        }
      }
    }
  }
}
