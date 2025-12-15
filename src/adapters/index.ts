/**
 * Adapters - Transformation de données entre API et frontend
 * Centralise la logique de transformation snake_case <-> camelCase
 */

import type { Espace, Reservation, User, Abonnement, DemandeDomiciliation } from '../types'

/**
 * Adapter pour les espaces
 */
export const espaceAdapter = {
  fromAPI: (apiData: any): Espace => ({
    id: apiData.id,
    nom: apiData.nom,
    type: apiData.type,
    capacite: apiData.capacite,
    prixHeure: apiData.prix_heure,
    prixDemiJournee: apiData.prix_demi_journee || 0,
    prixJour: apiData.prix_jour,
    prixSemaine: apiData.prix_semaine,
    description: apiData.description,
    equipements: apiData.equipements || [],
    disponible: apiData.disponible,
    etage: apiData.etage,
    imageUrl: apiData.image_url,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at
  }),

  toAPI: (espace: Partial<Espace>): any => ({
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
}

/**
 * Adapter pour les réservations
 */
export const reservationAdapter = {
  fromAPI: (apiData: any): Reservation => ({
    id: apiData.id,
    userId: apiData.user_id,
    espaceId: apiData.espace_id,
    dateDebut: apiData.date_debut,
    dateFin: apiData.date_fin,
    statut: apiData.statut,
    typeReservation: apiData.type_reservation,
    montantTotal: apiData.montant_total,
    reduction: apiData.reduction,
    montantPaye: apiData.montant_paye,
    modePaiement: apiData.mode_paiement,
    notes: apiData.notes,
    dateCreation: apiData.created_at,
    createdAt: apiData.created_at,
    espace: apiData.espace_nom ? {
      id: apiData.espace_id,
      nom: apiData.espace_nom,
      type: apiData.espace_type
    } : undefined,
    utilisateur: apiData.user_nom ? {
      id: apiData.user_id,
      nom: apiData.user_nom,
      prenom: apiData.user_prenom,
      email: apiData.user_email,
      role: 'user' as const
    } : undefined
  }),

  toAPI: (reservation: Partial<Reservation>): any => ({
    espace_id: reservation.espaceId,
    date_debut: reservation.dateDebut,
    date_fin: reservation.dateFin,
    statut: reservation.statut,
    notes: reservation.notes
  })
}

/**
 * Adapter pour les abonnements
 */
export const abonnementAdapter = {
  fromAPI: (apiData: any): Abonnement => ({
    id: apiData.id,
    nom: apiData.nom,
    type: apiData.type,
    prix: apiData.prix,
    prixAvecDomiciliation: apiData.prix_avec_domiciliation,
    creditsMensuels: apiData.credits_mensuels,
    creditMensuel: apiData.credits_mensuels,
    dureeMois: apiData.duree_mois,
    dureeJours: (apiData.duree_mois || 1) * 30,
    description: apiData.description,
    avantages: apiData.avantages || [],
    actif: apiData.actif,
    couleur: apiData.couleur || '#3B82F6',
    ordre: apiData.ordre,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at || apiData.created_at
  }),

  toAPI: (abonnement: Partial<Abonnement>): any => ({
    nom: abonnement.nom,
    type: abonnement.type,
    prix: abonnement.prix,
    prix_avec_domiciliation: abonnement.prixAvecDomiciliation,
    duree_mois: abonnement.dureeMois,
    description: abonnement.description,
    avantages: abonnement.avantages,
    actif: abonnement.actif,
    ordre: abonnement.ordre
  })
}

/**
 * Adapter pour les utilisateurs
 */
export const userAdapter = {
  fromAPI: (apiData: any): User => ({
    id: apiData.id,
    email: apiData.email,
    nom: apiData.nom,
    prenom: apiData.prenom,
    telephone: apiData.telephone,
    role: apiData.role,
    statut: apiData.statut,
    avatar: apiData.avatar,
    profession: apiData.profession,
    entreprise: apiData.entreprise,
    adresse: apiData.adresse,
    bio: apiData.bio,
    wilaya: apiData.wilaya,
    commune: apiData.commune,
    typeEntreprise: apiData.type_entreprise,
    nif: apiData.nif,
    nis: apiData.nis,
    registreCommerce: apiData.registre_commerce,
    articleImposition: apiData.article_imposition,
    numeroAutoEntrepreneur: apiData.numero_auto_entrepreneur,
    raisonSociale: apiData.raison_sociale,
    dateCreationEntreprise: apiData.date_creation_entreprise,
    capital: apiData.capital,
    siegeSocial: apiData.siege_social,
    activitePrincipale: apiData.activite_principale,
    formeJuridique: apiData.forme_juridique,
    absences: apiData.absences,
    bannedUntil: apiData.banned_until,
    derniereConnexion: apiData.derniere_connexion,
    dateCreation: apiData.created_at,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at
  }),

  toAPI: (user: Partial<User>): any => {
    const apiData: any = {}

    const fieldMapping: Record<string, string> = {
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

    Object.entries(fieldMapping).forEach(([camelKey, snakeKey]) => {
      if (user[camelKey as keyof User] !== undefined) {
        apiData[snakeKey] = user[camelKey as keyof User]
      }
    })

    return apiData
  }
}

/**
 * Adapter pour les domiciliations
 */
export const domiciliationAdapter = {
  fromAPI: (apiData: any): DemandeDomiciliation => ({
    id: apiData.id,
    userId: apiData.user_id,
    utilisateur: apiData.utilisateur,
    raisonSociale: apiData.raison_sociale,
    formeJuridique: apiData.forme_juridique,
    nif: apiData.nif,
    nis: apiData.nis,
    registreCommerce: apiData.registre_commerce,
    articleImposition: apiData.article_imposition,
    coordonneesFiscales: apiData.coordonnees_fiscales,
    coordonneesAdministratives: apiData.coordonnees_administratives,
    representantLegal: typeof apiData.representant_legal === 'string'
      ? JSON.parse(apiData.representant_legal)
      : apiData.representant_legal,
    domaineActivite: apiData.domaine_activite,
    adresseSiegeSocial: apiData.adresse_siege_social,
    capital: apiData.capital,
    dateCreationEntreprise: apiData.date_creation_entreprise,
    statut: apiData.statut,
    commentaireAdmin: apiData.commentaire_admin,
    dateValidation: apiData.date_validation,
    dateCreation: apiData.created_at,
    updatedAt: apiData.updated_at
  }),

  toAPI: (domiciliation: Partial<DemandeDomiciliation>): any => ({
    raison_sociale: domiciliation.raisonSociale,
    forme_juridique: domiciliation.formeJuridique,
    nif: domiciliation.nif,
    nis: domiciliation.nis,
    registre_commerce: domiciliation.registreCommerce,
    article_imposition: domiciliation.articleImposition,
    representant_legal: domiciliation.representantLegal,
    domaine_activite: domiciliation.domaineActivite,
    adresse_siege_social: domiciliation.adresseSiegeSocial,
    capital: domiciliation.capital,
    date_creation_entreprise: domiciliation.dateCreationEntreprise
  })
}
