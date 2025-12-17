import { User } from '../../../types';

export interface ApiUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: 'admin' | 'user';
  statut?: string;
  actif?: boolean | number;
  date_creation?: string;
  created_at?: string;
  derniere_connexion?: string;
  updated_at?: string;
  avatar?: string | null;
  profession?: string;
  entreprise?: string;
  adresse?: string;
  bio?: string;
  wilaya?: string;
  commune?: string;
  type_entreprise?: string;
  nif?: string;
  nis?: string;
  registre_commerce?: string;
  article_imposition?: string;
  numero_auto_entrepreneur?: string;
  raison_sociale?: string;
  date_creation_entreprise?: string;
  capital?: string;
  siege_social?: string;
  activite_principale?: string;
  forme_juridique?: string;
  absences?: number;
  banned_until?: string | null;
  code_parrainage?: string;
  parrain_id?: string;
  nombre_parrainages?: number;
}

export function transformUserFromApi(data: ApiUser): User {
  const actif = data.actif !== undefined ? Boolean(data.actif) : undefined;
  const statut = data.statut || (actif ? 'actif' : 'inactif');

  return {
    id: data.id,
    email: data.email,
    nom: data.nom,
    prenom: data.prenom,
    telephone: data.telephone,
    role: data.role,
    statut: statut as any,
    dateCreation: data.date_creation ? new Date(data.date_creation) : undefined,
    created_at: data.created_at,
    derniereConnexion: data.derniere_connexion ? new Date(data.derniere_connexion) : undefined,
    updatedAt: data.updated_at,
    avatar: data.avatar,
    profession: data.profession,
    entreprise: data.entreprise,
    adresse: data.adresse,
    bio: data.bio,
    wilaya: data.wilaya,
    commune: data.commune,
    typeEntreprise: data.type_entreprise,
    nif: data.nif,
    nis: data.nis,
    registreCommerce: data.registre_commerce,
    articleImposition: data.article_imposition,
    numeroAutoEntrepreneur: data.numero_auto_entrepreneur,
    raisonSociale: data.raison_sociale,
    dateCreationEntreprise: data.date_creation_entreprise,
    capital: data.capital,
    siegeSocial: data.siege_social,
    activitePrincipale: data.activite_principale,
    formeJuridique: data.forme_juridique,
    absences: data.absences,
    bannedUntil: data.banned_until ? new Date(data.banned_until) : null,
    codeParrainage: data.code_parrainage,
    parrainId: data.parrain_id,
    nombreParrainages: data.nombre_parrainages,
  };
}

export function transformUserToApi(data: Partial<User>): Partial<ApiUser> {
  const apiData: Partial<ApiUser> = {};

  if (data.email !== undefined) apiData.email = data.email;
  if (data.nom !== undefined) apiData.nom = data.nom;
  if (data.prenom !== undefined) apiData.prenom = data.prenom;
  if (data.telephone !== undefined) apiData.telephone = data.telephone;
  if (data.role !== undefined) apiData.role = data.role;
  if (data.statut !== undefined) apiData.statut = data.statut;
  if (data.profession !== undefined) apiData.profession = data.profession;
  if (data.entreprise !== undefined) apiData.entreprise = data.entreprise;
  if (data.adresse !== undefined) apiData.adresse = data.adresse;
  if (data.bio !== undefined) apiData.bio = data.bio;
  if (data.wilaya !== undefined) apiData.wilaya = data.wilaya;
  if (data.commune !== undefined) apiData.commune = data.commune;
  if (data.typeEntreprise !== undefined) apiData.type_entreprise = data.typeEntreprise;
  if (data.nif !== undefined) apiData.nif = data.nif;
  if (data.nis !== undefined) apiData.nis = data.nis;
  if (data.registreCommerce !== undefined) apiData.registre_commerce = data.registreCommerce;
  if (data.articleImposition !== undefined) apiData.article_imposition = data.articleImposition;
  if (data.numeroAutoEntrepreneur !== undefined) apiData.numero_auto_entrepreneur = data.numeroAutoEntrepreneur;
  if (data.raisonSociale !== undefined) apiData.raison_sociale = data.raisonSociale;
  if (data.dateCreationEntreprise !== undefined) apiData.date_creation_entreprise = data.dateCreationEntreprise;
  if (data.capital !== undefined) apiData.capital = data.capital;
  if (data.siegeSocial !== undefined) apiData.siege_social = data.siegeSocial;
  if (data.activitePrincipale !== undefined) apiData.activite_principale = data.activitePrincipale;
  if (data.formeJuridique !== undefined) apiData.forme_juridique = data.formeJuridique;
  if (data.codeParrainage !== undefined) apiData.code_parrainage = data.codeParrainage;

  return apiData;
}
