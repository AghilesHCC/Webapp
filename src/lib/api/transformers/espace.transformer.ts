import { Espace } from '../../../types';

export interface ApiEspace {
  id: string;
  nom: string;
  type: string;
  capacite: number;
  prix_heure: number;
  prix_demi_journee: number;
  prix_jour: number;
  prix_semaine: number;
  disponible: boolean | number;
  description: string;
  equipements: string | string[];
  created_at: string;
  updated_at: string;
  image?: string;
  image_url?: string;
  etage?: number;
}

export function transformEspaceFromApi(data: ApiEspace): Espace {
  let equipements: string[] = [];

  if (typeof data.equipements === 'string') {
    try {
      equipements = JSON.parse(data.equipements);
    } catch {
      equipements = data.equipements.split(',').map(e => e.trim()).filter(Boolean);
    }
  } else if (Array.isArray(data.equipements)) {
    equipements = data.equipements;
  }

  return {
    id: data.id,
    nom: data.nom,
    type: data.type as any,
    capacite: Number(data.capacite) || 0,
    prixHeure: Number(data.prix_heure) || 0,
    prixDemiJournee: Number(data.prix_demi_journee) || 0,
    prixJour: Number(data.prix_jour) || 0,
    prixSemaine: Number(data.prix_semaine) || 0,
    disponible: Boolean(data.disponible),
    description: data.description || '',
    equipements,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    image: data.image,
    imageUrl: data.image_url,
    etage: data.etage,
  };
}

export function transformEspaceToApi(data: Partial<Espace>): Partial<ApiEspace> {
  const apiData: Partial<ApiEspace> = {};

  if (data.nom !== undefined) apiData.nom = data.nom;
  if (data.type !== undefined) apiData.type = data.type;
  if (data.capacite !== undefined) apiData.capacite = data.capacite;
  if (data.prixHeure !== undefined) apiData.prix_heure = data.prixHeure;
  if (data.prixDemiJournee !== undefined) apiData.prix_demi_journee = data.prixDemiJournee;
  if (data.prixJour !== undefined) apiData.prix_jour = data.prixJour;
  if (data.prixSemaine !== undefined) apiData.prix_semaine = data.prixSemaine;
  if (data.disponible !== undefined) apiData.disponible = data.disponible ? 1 : 0;
  if (data.description !== undefined) apiData.description = data.description;
  if (data.equipements !== undefined) {
    apiData.equipements = JSON.stringify(data.equipements);
  }
  if (data.image !== undefined) apiData.image = data.image;
  if (data.etage !== undefined) apiData.etage = data.etage;

  return apiData;
}
