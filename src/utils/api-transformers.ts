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

export const transformUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  nom: apiUser.nom,
  prenom: apiUser.prenom,
  telephone: apiUser.telephone,
  role: apiUser.role,
  statut: apiUser.statut,
  dateCreation: new Date(apiUser.date_creation || apiUser.created_at),
  created_at: apiUser.created_at,
  createdAt: apiUser.created_at,
  derniereConnexion: apiUser.derniere_connexion ? new Date(apiUser.derniere_connexion) : undefined,
  updatedAt: apiUser.updated_at,
  avatar: apiUser.avatar,
  profession: apiUser.profession,
  entreprise: apiUser.entreprise,
  adresse: apiUser.adresse,
  bio: apiUser.bio,
  wilaya: apiUser.wilaya,
  commune: apiUser.commune,
  typeEntreprise: apiUser.type_entreprise,
  nif: apiUser.nif,
  nis: apiUser.nis,
  registreCommerce: apiUser.registre_commerce,
  articleImposition: apiUser.article_imposition,
  numeroAutoEntrepreneur: apiUser.numero_auto_entrepreneur,
  raisonSociale: apiUser.raison_sociale,
  dateCreationEntreprise: apiUser.date_creation_entreprise,
  capital: apiUser.capital,
  siegeSocial: apiUser.siege_social,
  activitePrincipale: apiUser.activite_principale,
  formeJuridique: apiUser.forme_juridique,
  absences: apiUser.absences,
  bannedUntil: apiUser.banned_until ? new Date(apiUser.banned_until) : null,
  codeParrainage: apiUser.code_parrainage,
  parrainId: apiUser.parrain_id,
  nombreParrainages: apiUser.nombre_parrainages
})

export const transformEspace = (apiEspace: ApiEspace): Espace => ({
  id: apiEspace.id,
  nom: apiEspace.nom,
  type: apiEspace.type as Espace['type'],
  capacite: apiEspace.capacite,
  prixHeure: apiEspace.prix_heure,
  prixDemiJournee: apiEspace.prix_demi_journee,
  prixJour: apiEspace.prix_jour,
  prixSemaine: apiEspace.prix_semaine,
  disponible: apiEspace.disponible,
  description: apiEspace.description,
  equipements: typeof apiEspace.equipements === 'string'
    ? JSON.parse(apiEspace.equipements)
    : apiEspace.equipements,
  createdAt: new Date(apiEspace.created_at),
  updatedAt: new Date(apiEspace.updated_at),
  image: apiEspace.image,
  imageUrl: apiEspace.image_url,
  etage: apiEspace.etage
})

export const transformReservation = (apiReservation: ApiReservation): Reservation => {
  const utilisateur = (apiReservation as any).user_email ? {
    id: apiReservation.user_id,
    email: (apiReservation as any).user_email,
    nom: (apiReservation as any).user_nom || '',
    prenom: (apiReservation as any).user_prenom || '',
    role: 'user' as const
  } as User : (apiReservation.utilisateur ? transformUser(apiReservation.utilisateur) : undefined)

  const espace = (apiReservation as any).espace_nom ? {
    id: apiReservation.espace_id,
    nom: (apiReservation as any).espace_nom,
    type: (apiReservation as any).espace_type
  } as Partial<Espace> as Espace : (apiReservation.espace ? (
    'prix_heure' in apiReservation.espace
      ? transformEspace(apiReservation.espace as ApiEspace)
      : ({
          id: (apiReservation.espace as any).id,
          nom: (apiReservation.espace as any).nom,
          type: (apiReservation.espace as any).type
        } as Partial<Espace> as Espace)
  ) : undefined)

  return {
    id: apiReservation.id,
    userId: apiReservation.user_id,
    espaceId: apiReservation.espace_id,
    dateDebut: apiReservation.date_debut,
    dateFin: apiReservation.date_fin,
    statut: apiReservation.statut as Reservation['statut'],
    typeReservation: apiReservation.type_reservation as Reservation['typeReservation'],
    montantTotal: apiReservation.montant_total,
    montantPaye: apiReservation.montant_paye,
    modePaiement: apiReservation.mode_paiement,
    reduction: apiReservation.reduction,
    codePromo: apiReservation.code_promo,
    notes: apiReservation.notes,
    participants: apiReservation.participants,
    dateCreation: apiReservation.date_creation ? new Date(apiReservation.date_creation) : new Date(apiReservation.created_at),
    createdAt: apiReservation.created_at,
    updatedAt: apiReservation.updated_at,
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

  const utilisateur = (apiDom as any).email ? {
    id: apiDom.user_id,
    email: (apiDom as any).email,
    nom: (apiDom as any).nom || '',
    prenom: (apiDom as any).prenom || '',
    role: 'user' as const
  } as User : (apiDom.utilisateur ? transformUser(apiDom.utilisateur) : undefined)

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
    domaineActivite: apiDom.activite_principale || '',
    adresseSiegeSocial: apiDom.adresse_actuelle || '',
    capital: apiDom.capital,
    dateCreationEntreprise: apiDom.date_creation_entreprise ? new Date(apiDom.date_creation_entreprise) : undefined,
    statut: apiDom.statut,
    commentaireAdmin: apiDom.commentaire_admin,
    dateValidation: apiDom.date_validation ? new Date(apiDom.date_validation) : undefined,
    dateCreation: new Date(apiDom.date_creation || apiDom.created_at),
    updatedAt: new Date(apiDom.updated_at)
  }
}

export const transformCodePromo = (apiCode: ApiCodePromo): CodePromo => ({
  id: apiCode.id,
  code: apiCode.code,
  type: apiCode.type,
  valeur: apiCode.valeur,
  dateDebut: new Date(apiCode.date_debut),
  dateFin: new Date(apiCode.date_fin),
  utilisationsMax: apiCode.usage_max,
  utilisationsActuelles: apiCode.usage_actuel,
  actif: apiCode.actif,
  description: apiCode.description,
  conditions: apiCode.conditions,
  montantMin: apiCode.montant_minimum,
  montantMaxReduction: apiCode.montant_max_reduction,
  utilisationsParUser: apiCode.usage_par_user,
  typesApplication: apiCode.type_reservation ? [apiCode.type_reservation as 'reservation' | 'domiciliation'] : undefined,
  premiereCommandeSeulement: apiCode.premiere_commande_seulement,
  codeParrainageRequis: apiCode.code_parrainage_requis,
  createdAt: new Date(apiCode.created_at),
  updatedAt: new Date(apiCode.updated_at)
})

export const transformParrainage = (apiParrainage: ApiParrainage): Parrainage => ({
  id: apiParrainage.id,
  parrainId: apiParrainage.parrain_id,
  filleulId: apiParrainage.filleul_id,
  codeParrainage: apiParrainage.code_parrainage,
  statut: apiParrainage.statut,
  recompenseParrain: apiParrainage.recompense_parrain,
  recompenseFilleul: apiParrainage.recompense_filleul,
  dateInscriptionFilleul: new Date(apiParrainage.date_inscription_filleul),
  dateValidation: apiParrainage.date_validation ? new Date(apiParrainage.date_validation) : undefined,
  dateRecompense: apiParrainage.date_recompense ? new Date(apiParrainage.date_recompense) : undefined,
  notes: apiParrainage.notes,
  createdAt: new Date(apiParrainage.created_at),
  updatedAt: new Date(apiParrainage.updated_at)
})

export const transformAbonnement = (apiAbo: ApiAbonnement): Abonnement => ({
  id: apiAbo.id,
  nom: apiAbo.nom,
  type: apiAbo.type,
  prix: apiAbo.prix,
  prixAvecDomiciliation: apiAbo.prix_avec_domiciliation,
  creditsMensuels: apiAbo.credits_mensuels,
  creditMensuel: apiAbo.credits_mensuels,
  dureeMois: apiAbo.duree_mois,
  dureeJours: apiAbo.duree_mois * 30,
  description: apiAbo.description,
  avantages: typeof apiAbo.avantages === 'string'
    ? JSON.parse(apiAbo.avantages)
    : apiAbo.avantages,
  actif: apiAbo.actif,
  couleur: apiAbo.couleur,
  ordre: apiAbo.ordre,
  createdAt: apiAbo.created_at,
  updatedAt: apiAbo.updated_at
})

export const transformNotification = (apiNotif: ApiNotification): Notification => ({
  id: apiNotif.id,
  utilisateur: apiNotif.utilisateur ? transformUser(apiNotif.utilisateur) : {} as User,
  titre: apiNotif.titre,
  message: apiNotif.message,
  type: apiNotif.type,
  lu: apiNotif.lu,
  dateCreation: new Date(apiNotif.date_creation)
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
  etage: espace.etage,
  image_url: espace.imageUrl
})
