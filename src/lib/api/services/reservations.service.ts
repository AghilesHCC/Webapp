import { httpClient } from '../core/http-client'
import type { ApiResponse, ReservationData } from '../core/types'

class ReservationsService {
  async getReservations(userId?: string): Promise<ApiResponse> {
    const query = userId ? `?user_id=${userId}` : ''
    return httpClient.request(`/reservations/index.php${query}`)
  }

  async getReservation(id: string): Promise<ApiResponse> {
    return httpClient.request(`/reservations/show.php?id=${id}`)
  }

  async createReservation(data: ReservationData): Promise<ApiResponse> {
    return httpClient.request('/reservations/create.php', {
      method: 'POST',
      body: JSON.stringify({
        espace_id: data.espaceId,
        date_debut: data.dateDebut,
        date_fin: data.dateFin,
        participants: data.participants || 1,
        notes: data.notes,
        code_promo: data.codePromo,
        montant_total: data.montantTotal || 0,
        statut: 'en_attente',
        type_reservation: 'heure',
        mode_paiement: null,
        montant_paye: 0
      })
    })
  }

  async updateReservation(id: string, data: any): Promise<ApiResponse> {
    return httpClient.request('/reservations/update.php', {
      method: 'PUT',
      body: JSON.stringify({
        id,
        espace_id: data.espaceId,
        date_debut: data.dateDebut,
        date_fin: data.dateFin,
        statut: data.statut,
        notes: data.notes,
        montant_total: data.montantTotal,
        montant_paye: data.montantPaye,
        mode_paiement: data.modePaiement
      })
    })
  }

  async cancelReservation(id: string): Promise<ApiResponse> {
    return httpClient.request('/reservations/cancel.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    })
  }
}

export const reservationsService = new ReservationsService()
