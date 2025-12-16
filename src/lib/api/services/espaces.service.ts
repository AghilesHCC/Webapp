import { httpClient } from '../core/http-client'
import type { ApiResponse } from '../core/types'

class EspacesService {
  async getEspaces(): Promise<ApiResponse> {
    return httpClient.request('/espaces/index.php')
  }

  async getEspace(id: string): Promise<ApiResponse> {
    return httpClient.request(`/espaces/show.php?id=${id}`)
  }

  async createEspace(data: any): Promise<ApiResponse> {
    return httpClient.request('/espaces/create.php', {
      method: 'POST',
      body: JSON.stringify({
        nom: data.nom,
        type: data.type,
        capacite: data.capacite,
        prix_heure: data.prixHeure,
        prix_demi_journee: data.prixDemiJournee,
        prix_jour: data.prixJour,
        prix_semaine: data.prixSemaine,
        description: data.description,
        equipements: data.equipements,
        disponible: data.disponible,
        etage: data.etage,
        image_url: data.imageUrl
      })
    })
  }

  async updateEspace(id: string, data: any): Promise<ApiResponse> {
    return httpClient.request('/espaces/update.php', {
      method: 'PUT',
      body: JSON.stringify({
        id,
        nom: data.nom,
        type: data.type,
        capacite: data.capacite,
        prix_heure: data.prixHeure,
        prix_demi_journee: data.prixDemiJournee,
        prix_jour: data.prixJour,
        prix_semaine: data.prixSemaine,
        description: data.description,
        equipements: data.equipements,
        disponible: data.disponible,
        etage: data.etage,
        image_url: data.imageUrl
      })
    })
  }

  async deleteEspace(id: string): Promise<ApiResponse> {
    return httpClient.request('/espaces/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    })
  }
}

export const espacesService = new EspacesService()
