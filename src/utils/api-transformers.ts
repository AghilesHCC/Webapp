import type {
  ApiUser,
  ApiEspace,
  ApiReservation,
  ApiDomiciliation,
  ApiCodePromo,
  ApiParrainage,
  ApiAbonnement,
  ApiNotification
} from '../types/api.types'
import type {
  User,
  Espace,
  Reservation,
  DemandeDomiciliation,
  CodePromo,
  Parrainage,
  Abonnement,
  Notification
} from '../types'

const toBool = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val === 1
  if (typeof val === 'string') return val === '1' || val === 'true'
  return false
}

const toNumber = (val: unknown): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val) || 0
  return 0
}

const parseJson = <T>(val: unknown, fallback: T): T => {
  if (Array.isArray(val)) return val as T
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

export const transformUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  nom: apiUser.nom,
  prenom: apiUser.prenom,
  telephone: apiUser.telephone ?? undefined,
  role: apiUser.role,
  statut: apiUser.statut,
  dateCreation: new Date(apiUser.created_at || Date.now()),
  created_at: apiUser.created_at,
  createdAt: apiUser.createdAt || apiUser.created_at,
  derniereConnexion: (apiUser.derniere_connexion || apiUser.derniereConnexion)
    ? new Date(apiUser.derniere_connexion || apiUser.derniereConnexion!)
    : undefined,
  updatedAt: apiUser.updatedAt || apiUser.updated_at,
  avatar: apiUser.avatar,
  profession: apiUser.profession ?? undefined,
  entreprise: apiUser.entreprise ?? undefined,
  adresse: apiUser.adresse ?? undefined,
  bio: apiUser.bio ?? undefined,
  wilaya: apiUser.wilaya ?? undefined,
  commune: apiUser.commune ?? undefined,
  typeEntreprise: (apiUser.typeEntreprise || apiUser.type_entreprise) ?? undefined,
  nif: apiUser.nif ?? undefined,
  nis: apiUser.nis ?? undefined,
  registreCommerce: (apiUser.registreCommerce || apiUser.registre_commerce) ?? undefined,
  articleImposition: (apiUser.articleImposition || apiUser.article_imposition) ?? undefined,
  numeroAutoEntrepreneur: (apiUser.numeroAutoEntrepreneur || apiUser.numero_auto_entrepreneur) ?? undefined,
  raisonSociale: (apiUser.raisonSociale || apiUser.raison_sociale) ?? undefined,
  dateCreationEntreprise: (apiUser.dateCreationEntreprise || apiUser.date_creation_entreprise) ?? undefined,
  capital: apiUser.capital ?? undefined,
  siegeSocial: (apiUser.siegeSocial || apiUser.siege_social) ?? undefined,
  activitePrincipale: (apiUser.activitePrincipale || apiUser.activite_principale) ?? undefined,
  formeJuridique: (apiUser.formeJuridique || apiUser.forme_juridique) ?? undefined,
  absences: apiUser.absences,
  bannedUntil: (apiUser.bannedUntil || apiUser.banned_until)
    ? new Date(apiUser.bannedUntil || apiUser.banned_until!)
    : null,
  codeParrainage: apiUser.code_parrainage,
  parrainId: apiUser.parrain_id,
  nombreParrainages: apiUser.nombre_parrainages
})

export const transformEspace = (apiEspace: ApiEspace): Espace => ({
  id: apiEspace.id,
  nom: apiEspace.nom,
  type: apiEspace.type as Espace['type'],
  capacite: toNumber(apiEspace.capacite),
  prixHeure: toNumber(apiEspace.prix_heure),
  prixDemiJournee: toNumber(apiEspace.prix_demi_journee),
  prixJour: toNumber(apiEspace.prix_jour),
  prixSemaine: toNumber(apiEspace.prix_semaine),
  disponible: toBool(apiEspace.disponible),
  description: apiEspace.description || '',
  equipements: parseJson<string[]>(apiEspace.equipements, []),
  createdAt: new Date(apiEspace.created_at || Date.now()),
  updatedAt: new Date(apiEspace.updated_at || Date.now()),
  image: apiEspace.image,
  imageUrl: apiEspace.image_url ?? undefined
})

export const transformReservation = (apiReservation: ApiReservation): Reservation => {
  const userId = apiReservation.userId || apiReservation.user_id
  const espaceId = apiReservation.espaceId || apiReservation.espace_id
  const dateDebut = apiReservation.dateDebut || apiReservation.date_debut
  const dateFin = apiReservation.dateFin || apiReservation.date_fin
  const createdAt = apiReservation.createdAt || apiReservation.created_at || apiReservation.dateCreation

  let utilisateur: User | undefined
  if (apiReservation.user) {
    utilisateur = {
      id: userId,
      email: apiReservation.user.email || '',
      nom: apiReservation.user.nom || '',
      prenom: apiReservation.user.prenom || '',
      role: 'user' as const
    }
  } else if (apiReservation.utilisateur) {
    utilisateur = transformUser(apiReservation.utilisateur)
  }

  let espace: Espace | { id: string; nom: string; type: string } | undefined
  if (apiReservation.espace) {
    if ('prix_heure' in apiReservation.espace) {
      espace = transformEspace(apiReservation.espace as ApiEspace)
    } else {
      espace = {
        id: espaceId,
        nom: (apiReservation.espace as any).nom || '',
        type: (apiReservation.espace as any).type || ''
      }
    }
  }

  return {
    id: apiReservation.id,
    userId,
    espaceId,
    dateDebut,
    dateFin,
    statut: apiReservation.statut as Reservation['statut'],
    typeReservation: (apiReservation.typeReservation || apiReservation.type_reservation) as Reservation['typeReservation'],
    montantTotal: toNumber(apiReservation.montantTotal ?? apiReservation.montant_total),
    montantPaye: toNumber(apiReservation.montantPaye ?? apiReservation.montant_paye),
    modePaiement: (apiReservation.modePaiement || apiReservation.mode_paiement) ?? undefined,
    reduction: toNumber(apiReservation.reduction),
    codePromo: (apiReservation.codePromoId || apiReservation.code_promo_id) ?? undefined,
    notes: apiReservation.notes ?? undefined,
    participants: toNumber(apiReservation.participants) || 1,
    dateCreation: createdAt ? new Date(createdAt) : new Date(),
    createdAt,
    updatedAt: apiReservation.updatedAt || apiReservation.updated_at,
    utilisateur,
    espace
  }
}

export const transformDomiciliation = (apiDom: ApiDomiciliation): DemandeDomiciliation => {
  const representantLegal = {
    nom: apiDom.representant_nom || '',
    prenom: apiDom.representant_prenom || '',
    fonction: apiDom.representant_fonction || '',
    telephone: apiDom.representant_telephone || '',
    email: apiDom.representant_email || ''
  }

  let utilisateur: User
  if (apiDom.utilisateur) {
    utilisateur = transformUser(apiDom.utilisateur)
  } else {
    utilisateur = {
      id: apiDom.user_id,
      email: '',
      nom: '',
      prenom: '',
      role: 'user' as const
    }
  }

  return {
    id: apiDom.id,
    userId: apiDom.user_id,
    utilisateur,
    raisonSociale: apiDom.raison_sociale,
    formeJuridique: apiDom.forme_juridique as DemandeDomiciliation['formeJuridique'],
    nif: apiDom.nif || '',
    nis: apiDom.nis || '',
    registreCommerce: apiDom.registre_commerce || '',
    articleImposition: apiDom.article_imposition || '',
    coordonneesFiscales: apiDom.coordonnees_fiscales || '',
    coordonneesAdministratives: apiDom.coordonnees_administratives || '',
    representantLegal,
    activitePrincipale: apiDom.activite_principale || '',
    adresseActuelle: apiDom.adresse_actuelle || '',
    capital: apiDom.capital ?? undefined,
    dateCreationEntreprise: apiDom.date_creation_entreprise ? new Date(apiDom.date_creation_entreprise) : undefined,
    statut: apiDom.statut as DemandeDomiciliation['statut'],
    commentaireAdmin: (apiDom.commentaire_admin || apiDom.notes_admin) ?? undefined,
    dateValidation: apiDom.date_validation ? new Date(apiDom.date_validation) : undefined,
    dateCreation: new Date(apiDom.date_creation || apiDom.created_at || Date.now()),
    updatedAt: new Date(apiDom.updated_at || Date.now())
  }
}

export const transformCodePromo = (apiCode: ApiCodePromo): CodePromo => ({
  id: apiCode.id,
  code: apiCode.code,
  type: apiCode.type,
  valeur: toNumber(apiCode.valeur),
  dateDebut: new Date(apiCode.date_debut || Date.now()),
  dateFin: new Date(apiCode.date_fin || Date.now()),
  utilisationsMax: toNumber(apiCode.utilisations_max),
  utilisationsActuelles: toNumber(apiCode.utilisations_actuelles),
  actif: toBool(apiCode.actif),
  description: apiCode.description ?? undefined,
  conditions: apiCode.conditions ?? undefined,
  montantMin: toNumber(apiCode.montant_min),
  typesApplication: parseJson<('reservation' | 'domiciliation')[]>(apiCode.types_application, undefined),
  createdAt: new Date(apiCode.created_at || Date.now()),
  updatedAt: new Date(apiCode.updated_at || Date.now())
})

export const transformParrainage = (apiParrainage: ApiParrainage): Parrainage => ({
  id: apiParrainage.id,
  parrainId: apiParrainage.parrain_id,
  filleulId: apiParrainage.filleul_id || '',
  codeParrainage: apiParrainage.code_parrainage || apiParrainage.code_parrain,
  statut: apiParrainage.statut || 'en_attente',
  recompenseParrain: toNumber(apiParrainage.recompense_parrain),
  recompenseFilleul: toNumber(apiParrainage.recompense_filleul),
  dateInscriptionFilleul: new Date(apiParrainage.date_inscription_filleul || apiParrainage.created_at || Date.now()),
  dateValidation: apiParrainage.date_validation ? new Date(apiParrainage.date_validation) : undefined,
  dateRecompense: apiParrainage.date_recompense ? new Date(apiParrainage.date_recompense) : undefined,
  notes: apiParrainage.notes,
  createdAt: new Date(apiParrainage.created_at || Date.now()),
  updatedAt: new Date(apiParrainage.updated_at || Date.now())
})

export const transformAbonnement = (apiAbo: ApiAbonnement): Abonnement => ({
  id: apiAbo.id,
  nom: apiAbo.nom,
  type: apiAbo.type,
  prix: toNumber(apiAbo.prix),
  prixAvecDomiciliation: apiAbo.prix_avec_domiciliation ? toNumber(apiAbo.prix_avec_domiciliation) : undefined,
  dureeMois: toNumber(apiAbo.duree_mois),
  dureeJours: toNumber(apiAbo.duree_mois) * 30,
  description: apiAbo.description || '',
  avantages: parseJson<string[]>(apiAbo.avantages, []),
  actif: toBool(apiAbo.actif),
  statut: apiAbo.statut,
  ordre: toNumber(apiAbo.ordre),
  createdAt: apiAbo.created_at,
  updatedAt: apiAbo.updated_at
})

export const transformNotification = (apiNotif: ApiNotification): Notification => ({
  id: apiNotif.id,
  utilisateur: apiNotif.utilisateur ? transformUser(apiNotif.utilisateur) : {} as User,
  titre: apiNotif.titre,
  message: apiNotif.message,
  type: (['info', 'success', 'warning', 'error'].includes(apiNotif.type)
    ? apiNotif.type
    : 'info') as Notification['type'],
  lu: toBool(apiNotif.lue),
  dateCreation: new Date(apiNotif.created_at || Date.now())
})

export const userToApi = (user: Partial<User>): Record<string, unknown> => {
  const apiData: Record<string, unknown> = {}
  const fieldMap: Record<string, string> = {
    nom: 'nom',
    prenom: 'prenom',
    telephone: 'telephone',
    profession: 'profession',
    entreprise: 'entreprise',
    adresse: 'adresse',
    bio: 'bio',
    wilaya: 'wilaya',
    commune: 'commune',
    avatar: 'avatar',
    role: 'role',
    statut: 'statut',
    typeEntreprise: 'type_entreprise',
    nif: 'nif',
    nis: 'nis',
    registreCommerce: 'registre_commerce',
    articleImposition: 'article_imposition',
    numeroAutoEntrepreneur: 'numero_auto_entrepreneur',
    raisonSociale: 'raison_sociale',
    dateCreationEntreprise: 'date_creation_entreprise',
    capital: 'capital',
    siegeSocial: 'siege_social',
    activitePrincipale: 'activite_principale',
    formeJuridique: 'forme_juridique'
  }

  Object.keys(user).forEach(key => {
    const apiKey = fieldMap[key] || key
    const value = user[key as keyof User]
    if (value !== undefined) {
      apiData[apiKey] = value
    }
  })

  return apiData
}

export const espaceToApi = (espace: Partial<Espace>): Record<string, unknown> => ({
  nom: espace.nom,
  type: espace.type,
  capacite: espace.capacite,
  prix_heure: espace.prixHeure,
  prix_demi_journee: espace.prixDemiJournee,
  prix_jour: espace.prixJour,
  prix_semaine: espace.prixSemaine,
  description: espace.description,
  equipements: espace.equipements,
  disponible: espace.disponible,
  image_url: espace.imageUrl
})

export const reservationToApi = (reservation: Partial<Reservation>): Record<string, unknown> => ({
  user_id: reservation.userId,
  espace_id: reservation.espaceId,
  date_debut: reservation.dateDebut instanceof Date
    ? reservation.dateDebut.toISOString()
    : reservation.dateDebut,
  date_fin: reservation.dateFin instanceof Date
    ? reservation.dateFin.toISOString()
    : reservation.dateFin,
  statut: reservation.statut,
  type_reservation: reservation.typeReservation,
  montant_total: reservation.montantTotal,
  montant_paye: reservation.montantPaye,
  mode_paiement: reservation.modePaiement,
  reduction: reservation.reduction,
  code_promo: reservation.codePromo,
  notes: reservation.notes,
  participants: reservation.participants
})
