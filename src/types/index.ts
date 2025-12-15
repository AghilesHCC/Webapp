export type TypeEntreprise =
  | 'auto_entrepreneur'
  | 'eurl'
  | 'sarl'
  | 'spa'
  | 'snc'
  | 'scs'
  | 'freelance'
  | 'autre'

export interface IdentificationEntreprise {
  typeEntreprise: TypeEntreprise
  nif?: string // Numéro d'Identification Fiscale (20 caractères)
  nis?: string // Numéro d'Identification Statistique (15 caractères)
  registreCommerce?: string // Numéro du Registre du Commerce
  articleImposition?: string // Article d'imposition
  numeroAutoEntrepreneur?: string // Pour les auto-entrepreneurs
  raisonSociale?: string
  dateCreation?: Date
  capital?: number
  siegeSocial?: string
  activitePrincipale?: string
  formeJuridique?: string
}

export interface User {
  id: string
  email: string
  password?: string
  nom: string
  prenom: string
  telephone?: string
  role: 'admin' | 'user'
  statut?: 'actif' | 'inactif' | 'suspendu'
  dateCreation?: Date
  created_at?: string
  createdAt?: string
  derniereConnexion?: Date
  updatedAt?: string
  avatar?: string | null
  profession?: string
  entreprise?: string
  adresse?: string
  bio?: string
  wilaya?: string
  commune?: string
  typeEntreprise?: string
  nif?: string
  nis?: string
  registreCommerce?: string
  articleImposition?: string
  numeroAutoEntrepreneur?: string
  raisonSociale?: string
  dateCreationEntreprise?: string
  capital?: string
  siegeSocial?: string
  activitePrincipale?: string
  formeJuridique?: string
  identificationEntreprise?: IdentificationEntreprise
  absences?: number
  bannedUntil?: Date | null
  codeParrainage?: string
  parrainId?: string
  nombreParrainages?: number
  companyName?: string
  billingAddress?: string
}

export interface Espace {
  id: string
  nom: string
  type: string
  capacite: number
  prixHeure: number
  prixDemiJournee: number
  prixJour: number
  prixSemaine: number
  disponible: boolean
  description: string
  equipements: string[]
  createdAt: Date
  updatedAt: Date
  image?: string
  imageUrl?: string
  etage?: number
}

export interface Reservation {
  id: string
  userId: string
  espaceId: string
  utilisateur?: User
  espace?: Espace | { id: string; nom: string; type: string }
  dateDebut: Date | string
  dateFin: Date | string
  statut: 'confirmee' | 'en_attente' | 'annulee' | 'en_cours' | 'terminee'
  typeReservation?: string
  montantTotal: number
  montantPaye?: number
  modePaiement?: string
  reduction?: number
  codePromo?: string
  notes?: string
  participants?: number
  dateCreation?: Date
  createdAt?: Date | string
  updatedAt?: Date | string
  isActive?: boolean
}

export interface Notification {
  id: string
  utilisateur: User
  titre: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  lu: boolean
  dateCreation: Date
}

export interface Transaction {
  id: string
  utilisateur: User
  type: 'reservation' | 'domiciliation' | 'remboursement'
  montant: number
  statut: 'en_attente' | 'validee' | 'echouee'
  methode: string
  dateCreation: Date
  description?: string
}

export interface DocumentLegal {
  id: string
  type: 'statuts' | 'kbis' | 'nif' | 'nis' | 'rc' | 'article_imposition' | 'carte_auto_entrepreneur' | 'autre'
  nom: string
  url?: string
  dateUpload: Date
  statut: 'en_attente' | 'valide' | 'rejete'
  commentaire?: string
}

export interface DemandeDomiciliation {
  id: string
  userId: string
  utilisateur: User
  raisonSociale: string
  formeJuridique: TypeEntreprise
  nif: string
  nis: string
  registreCommerce: string
  articleImposition: string
  coordonneesFiscales: string
  coordonneesAdministratives: string
  representantLegal: {
    nom: string
    prenom: string
    fonction: string
    telephone: string
    email: string
  }
  domaineActivite: string
  adresseSiegeSocial: string
  capital?: number
  dateCreationEntreprise?: Date
  statut: 'en_attente' | 'validee' | 'rejetee'
  commentaireAdmin?: string
  dateValidation?: Date
  dateCreation: Date
  updatedAt: Date
}

export interface DomiciliationService {
  id: string
  userId: string
  demande: DemandeDomiciliation
  companyName: string
  legalForm: TypeEntreprise
  identification: IdentificationEntreprise
  startDate: Date
  endDate: Date
  status: 'active' | 'pending' | 'expired' | 'suspended'
  address: string
  services: string[]
  monthlyFee: number
  setupFee: number
  documentsLegaux: DocumentLegal[]
  representantLegal: {
    nom: string
    prenom: string
    fonction: string
    telephone: string
    email: string
  }
  activityDomain?: string
  dateSignatureContrat?: Date
  numeroContrat?: string
  visibleSurSite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CodePromo {
  id: string
  code: string
  type: 'pourcentage' | 'montant_fixe'
  valeur: number
  dateDebut: Date
  dateFin: Date
  utilisationsMax: number
  utilisationsActuelles: number
  actif: boolean
  description?: string
  conditions?: string
  montantMin?: number
  montantMaxReduction?: number
  utilisationsParUser?: number
  typesApplication?: ('reservation' | 'domiciliation')[]
  premiereCommandeSeulement?: boolean
  codeParrainageRequis?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Parrainage {
  id: string
  parrainId: string
  filleulId: string
  codeParrainage: string
  statut: 'en_attente' | 'valide' | 'recompense_versee' | 'annule'
  recompenseParrain: number
  recompenseFilleul: number
  dateInscriptionFilleul: Date
  dateValidation?: Date
  dateRecompense?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface UtilisationCodePromo {
  id: string
  codePromoId: string
  userId: string
  reservationId?: string
  domiciliationId?: string
  montantReduction: number
  montantAvant: number
  montantApres: number
  typeUtilisation: 'reservation' | 'domiciliation'
  createdAt: Date
}

export interface ValidationCodePromoResult {
  valid: boolean
  reduction: number
  codePromoId?: string
  montantFinal?: number
  error?: string
}

export interface ReservationForm {
  espaceId: string
  dateDebut: string
  dateFin: string
  participants?: number
  notes?: string
  codePromo?: string
}

export interface UserForm {
  email: string
  password: string
  nom: string
  prenom: string
  telephone?: string
  profession?: string
  entreprise?: string
  codeParrainage?: string
}

export interface CreateReservationData {
  userId?: string
  espaceId: string
  dateDebut: Date
  dateFin: Date
  montantTotal?: number
  notes?: string
  codePromo?: string
  participants?: number
  reduction?: number
}

export interface CreateDomiciliationData {
  userId: string
  raisonSociale: string
  formeJuridique: string
  nif: string
  nis: string
  registreCommerce: string
  articleImposition: string
  coordonneesFiscales?: string
  coordonneesAdministratives?: string
  representantLegal: {
    nom: string
    prenom: string
    fonction?: string
    telephone: string
    email: string
  }
  domaineActivite: string
  adresseSiegeSocial: string
  capital?: number
  dateCreationEntreprise?: string
}

export interface AdminStats {
  totalRevenue: number
  totalReservations: number
  totalUsers: number
  activeUsers: number
  occupancyRate: number
  tauxOccupation?: number
  monthlyRevenue: number
  caMois?: number
  reservationsCeMois?: number
  popularSpaces: Array<{ name: string; count: number }>
  recentActivity: Array<{ type: string; description: string; date: Date }>
}

export interface Abonnement {
  id: string
  nom: string
  type: string
  prix: number
  prixAvecDomiciliation?: number
  creditsMensuels?: number
  creditMensuel?: number
  dureeMois: number
  dureeJours: number
  description: string
  avantages: string[]
  actif: boolean
  statut?: string
  couleur?: string
  ordre: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface AbonnementUtilisateur {
  id: string
  userId: string
  abonnementId: string
  utilisateur?: User
  abonnement?: Abonnement
  dateDebut: Date | string
  dateFin: Date | string
  statut: 'actif' | 'expire' | 'suspendu' | 'annule'
  autoRenouvellement: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface NotificationSettings {
  emailEnabled: boolean
  emailNewReservation: boolean
  emailReservationConfirmed: boolean
  emailReservationCancelled: boolean
  smsEnabled: boolean
  smsNewReservation: boolean
  smsReservationConfirmed: boolean
  pushEnabled: boolean
  pushNewReservation: boolean
}
