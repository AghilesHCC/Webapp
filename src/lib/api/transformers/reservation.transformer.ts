import { Reservation } from '../../../types';

export interface ApiReservation {
  id: string;
  user_id: string;
  utilisateur_id?: string;
  espace_id: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  type_reservation?: string;
  montant_total: number;
  montant_paye?: number;
  mode_paiement?: string;
  reduction?: number;
  code_promo?: string;
  notes?: string;
  participants?: number;
  date_creation?: string;
  created_at?: string;
  updated_at?: string;
  utilisateur?: any;
  espace?: any;
}

export function transformReservationFromApi(data: ApiReservation): Reservation {
  const userId = data.user_id || data.utilisateur_id || '';

  return {
    id: data.id,
    userId,
    utilisateurId: userId,
    espaceId: data.espace_id,
    dateDebut: data.date_debut,
    dateFin: data.date_fin,
    statut: data.statut as any,
    typeReservation: data.type_reservation as any,
    montantTotal: Number(data.montant_total) || 0,
    montantPaye: data.montant_paye ? Number(data.montant_paye) : undefined,
    modePaiement: data.mode_paiement,
    reduction: data.reduction ? Number(data.reduction) : undefined,
    codePromo: data.code_promo,
    notes: data.notes,
    participants: data.participants,
    dateCreation: data.date_creation ? new Date(data.date_creation) : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    utilisateur: data.utilisateur,
    espace: data.espace,
  } as Reservation;
}

export function transformReservationToApi(data: Partial<Reservation>): Partial<ApiReservation> {
  const apiData: Partial<ApiReservation> = {};

  const userId = data.userId || (data as any).utilisateurId;
  if (userId) {
    apiData.user_id = userId;
    apiData.utilisateur_id = userId;
  }

  if (data.espaceId !== undefined) apiData.espace_id = data.espaceId;
  if (data.dateDebut !== undefined) {
    apiData.date_debut = typeof data.dateDebut === 'string'
      ? data.dateDebut
      : data.dateDebut.toISOString();
  }
  if (data.dateFin !== undefined) {
    apiData.date_fin = typeof data.dateFin === 'string'
      ? data.dateFin
      : data.dateFin.toISOString();
  }
  if (data.statut !== undefined) apiData.statut = data.statut;
  if (data.typeReservation !== undefined) apiData.type_reservation = data.typeReservation;
  if (data.montantTotal !== undefined) apiData.montant_total = data.montantTotal;
  if (data.montantPaye !== undefined) apiData.montant_paye = data.montantPaye;
  if (data.modePaiement !== undefined) apiData.mode_paiement = data.modePaiement;
  if (data.reduction !== undefined) apiData.reduction = data.reduction;
  if (data.codePromo !== undefined) apiData.code_promo = data.codePromo;
  if (data.notes !== undefined) apiData.notes = data.notes;
  if (data.participants !== undefined) apiData.participants = data.participants;

  return apiData;
}
