export interface ApiUser {
  id: string
  email: string
  nom: string
  prenom: string
  telephone?: string
  role: 'admin' | 'user'
  statut: 'actif' | 'inactif' | 'suspendu'
  date_creation: string
  created_at: string
  derniere_connexion?: string
  updated_at?: string
  avatar?: string | null
  profession?: string
  entreprise?: string
  adresse?: string
  bio?: string
  wilaya?: string
  commune?: string
  type_entreprise?: string
  nif?: string
  nis?: string
  registre_commerce?: string
  article_imposition?: string
  numero_auto_entrepreneur?: string
  raison_sociale?: string
  date_creation_entreprise?: string
  capital?: string
  siege_social?: string
  activite_principale?: string
  forme_juridique?: string
  absences?: number
  banned_until?: string | null
  code_parrainage?: string
  parrain_id?: string
  nombre_parrainages?: number
}

export interface ApiEspace {
  id: string
  nom: string
  type: string
  capacite: number
  prix_heure: number
  prix_demi_journee: number
  prix_jour: number
  prix_semaine: number
  disponible: boolean
  description: string
  equipements: string | string[]
  created_at: string
  updated_at: string
  image?: string
  image_url?: string
  etage?: number
}

export interface ApiReservation {
  id: string
  user_id: string
  espace_id: string
  date_debut: string
  date_fin: string
  statut: string
  type_reservation?: string
  montant_total: number
  montant_paye?: number
  mode_paiement?: string
  reduction?: number
  code_promo?: string
  notes?: string
  participants?: number
  date_creation?: string
  created_at?: string
  updated_at?: string
  utilisateur?: ApiUser
  espace?: ApiEspace
}

export interface ApiDomiciliation {
  id: string
  user_id: string
  raison_sociale: string
  forme_juridique: string
  nif?: string
  nis?: string
  registre_commerce?: string
  article_imposition?: string
  numero_auto_entrepreneur?: string
  coordonnees_fiscales?: string
  coordonnees_administratives?: string
  representant_nom?: string
  representant_prenom?: string
  representant_fonction?: string
  representant_telephone?: string
  representant_email?: string
  activite_principale?: string
  adresse_actuelle?: string
  capital?: number
  date_creation_entreprise?: string
  statut: 'en_attente' | 'validee' | 'rejetee'
  commentaire_admin?: string
  date_validation?: string
  date_creation: string
  updated_at: string
  utilisateur?: ApiUser
  wilaya?: string
  commune?: string
  montant_mensuel?: number
}

export interface ApiCodePromo {
  id: string
  code: string
  type: 'pourcentage' | 'montant_fixe'
  valeur: number
  date_debut: string
  date_fin: string
  usage_max: number
  usage_actuel: number
  actif: boolean
  description?: string
  conditions?: string
  montant_minimum?: number
  montant_max_reduction?: number
  usage_par_user?: number
  type_reservation?: string
  premiere_commande_seulement?: boolean
  code_parrainage_requis?: boolean
  created_at: string
  updated_at: string
}

export interface ApiParrainage {
  id: string
  parrain_id: string
  filleul_id: string
  code_parrainage: string
  statut: 'en_attente' | 'valide' | 'recompense_versee' | 'annule'
  recompense_parrain: number
  recompense_filleul: number
  date_inscription_filleul: string
  date_validation?: string
  date_recompense?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ApiAbonnement {
  id: string
  nom: string
  type: string
  prix: number
  prix_avec_domiciliation?: number
  credits_mensuels?: number
  duree_mois: number
  description: string
  avantages: string | string[]
  actif: boolean
  couleur?: string
  ordre: number
  created_at?: string
  updated_at?: string
}

export interface ApiNotification {
  id: string
  user_id: string
  titre: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  lu: boolean
  date_creation: string
  utilisateur?: ApiUser
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
