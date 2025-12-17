export interface ApiUser {
  id: string
  email: string
  nom: string
  prenom: string
  telephone?: string | null
  role: 'admin' | 'user'
  statut: 'actif' | 'inactif' | 'suspendu'
  created_at: string
  updated_at?: string
  derniere_connexion?: string | null
  avatar?: string | null
  profession?: string | null
  entreprise?: string | null
  adresse?: string | null
  bio?: string | null
  wilaya?: string | null
  commune?: string | null
  type_entreprise?: string | null
  nif?: string | null
  nis?: string | null
  registre_commerce?: string | null
  article_imposition?: string | null
  numero_auto_entrepreneur?: string | null
  raison_sociale?: string | null
  date_creation_entreprise?: string | null
  capital?: string | null
  siege_social?: string | null
  activite_principale?: string | null
  forme_juridique?: string | null
  absences?: number
  banned_until?: string | null
  code_parrainage?: string
  parrain_id?: string
  nombre_parrainages?: number
  typeEntreprise?: string
  registreCommerce?: string
  articleImposition?: string
  numeroAutoEntrepreneur?: string
  raisonSociale?: string
  dateCreationEntreprise?: string
  siegeSocial?: string
  activitePrincipale?: string
  formeJuridique?: string
  bannedUntil?: string | null
  derniereConnexion?: string | null
  createdAt?: string
  updatedAt?: string
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
  disponible: boolean | number
  description: string | null
  equipements: string | string[] | null
  created_at: string
  updated_at: string
  image?: string
  image_url?: string | null
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
  mode_paiement?: string | null
  reduction?: number
  code_promo_id?: string | null
  notes?: string | null
  participants?: number
  created_at?: string
  updated_at?: string
  utilisateur?: ApiUser
  espace?: ApiEspace | { nom?: string; type?: string; capacite?: number }
  user?: { nom?: string; prenom?: string; email?: string; telephone?: string | null }
}

export interface ApiDomiciliation {
  id: string
  user_id: string
  raison_sociale: string
  forme_juridique: string
  nif?: string | null
  nis?: string | null
  registre_commerce?: string | null
  article_imposition?: string | null
  numero_auto_entrepreneur?: string | null
  coordonnees_fiscales?: string | null
  coordonnees_administratives?: string | null
  representant_nom?: string | null
  representant_prenom?: string | null
  representant_fonction?: string | null
  representant_telephone?: string | null
  representant_email?: string | null
  activite_principale?: string | null
  adresse_actuelle?: string | null
  capital?: number | null
  date_creation_entreprise?: string | null
  statut: 'en_attente' | 'en_cours' | 'validee' | 'active' | 'rejetee' | 'expiree'
  commentaire_admin?: string | null
  notes_admin?: string | null
  date_validation?: string | null
  date_debut?: string | null
  date_fin?: string | null
  montant_mensuel?: number | null
  visible_sur_site?: boolean | number
  date_creation?: string
  created_at: string
  updated_at: string
  utilisateur?: ApiUser
  wilaya?: string | null
  commune?: string | null
}

export interface ApiCodePromo {
  id: string
  code: string
  type: 'pourcentage' | 'montant_fixe'
  valeur: number
  date_debut: string
  date_fin: string
  utilisations_max: number | null
  utilisations_actuelles: number
  montant_min: number
  types_application?: string | null
  actif: boolean | number
  description?: string | null
  conditions?: string | null
  created_at: string
  updated_at: string
}

export interface ApiParrainage {
  id: string
  parrain_id: string
  code_parrain: string
  parraines: number
  recompenses_totales: number
  created_at: string
  updated_at: string
  parrain?: ApiUser
  filleul_id?: string
  code_parrainage?: string
  statut?: 'en_attente' | 'valide' | 'recompense_versee' | 'annule'
  recompense_parrain?: number
  recompense_filleul?: number
  date_inscription_filleul?: string
  date_validation?: string
  date_recompense?: string
  notes?: string
}

export interface ApiAbonnement {
  id: string
  nom: string
  type: string
  prix: number
  prix_avec_domiciliation?: number | null
  duree_mois: number
  description: string | null
  avantages: string | string[] | null
  actif: boolean | number
  statut?: string
  ordre: number
  created_at?: string
  updated_at?: string
}

export interface ApiNotification {
  id: string
  user_id: string
  titre: string
  message: string
  type: 'parrainage' | 'reservation' | 'domiciliation' | 'abonnement' | 'system' | 'info' | 'success' | 'warning' | 'error'
  lue: boolean | number
  created_at: string
  utilisateur?: ApiUser
}

export interface ApiAvailability {
  espace_id: string
  date: string
  total_capacity: number
  reserved_seats: number
  available_seats: number
  reservations: Array<{
    id: string
    date_debut: string
    date_fin: string
    participants: number
    statut: string
  }>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
