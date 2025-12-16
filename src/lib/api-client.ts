/**
 * Client API pour MySQL/PHP Backend
 * Remplace complètement Supabase
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.token = localStorage.getItem('auth_token')
    this.refreshToken = localStorage.getItem('refresh_token')
  }

  setToken(token: string | null, refreshToken?: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }

    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      } else {
        localStorage.removeItem('refresh_token')
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refresh_token')
    }
    return this.refreshToken
  }

  private isTokenExpired(): boolean {
    const token = this.getToken()
    if (!token) return true

    try {
      const parts = token.split('.')
      if (parts.length !== 3) return true

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      const exp = payload.exp * 1000
      const now = Date.now()

      return now >= exp
    } catch {
      return true
    }
  }

  private isTokenExpiringSoon(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const parts = token.split('.')
      if (parts.length !== 3) return false

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      const exp = payload.exp * 1000
      const now = Date.now()
      const timeLeft = exp - now

      return timeLeft < 5 * 60 * 1000
    } catch {
      return false
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken()

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await fetch(`${API_URL}/auth/refresh.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        })

        if (!response.ok) {
          throw new Error('Failed to refresh token')
        }

        const data = await response.json()

        if (data.success && data.data) {
          this.setToken(data.data.token, data.data.refreshToken)
          return data.data.token
        }

        throw new Error('Invalid refresh response')
      } catch (error) {
        this.handleAuthError()
        throw error
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryWithRefresh: boolean = true,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    }

    // Endpoints qui ne nécessitent PAS d'authentification
    const publicEndpoints = ['/auth/login.php', '/auth/register.php']
    const isPublicEndpoint = publicEndpoints.some(ep => endpoint.includes(ep))

    if (!isPublicEndpoint) {
      // VERIFICATION 1: Token complètement expiré
      if (this.isTokenExpired()) {
        try {
          await this.refreshAccessToken()
        } catch (error) {
          this.handleAuthError()
          return {
            success: false,
            error: 'Session expirée. Veuillez vous reconnecter.'
          }
        }
      }
      // VERIFICATION 2: Token expire bientôt
      else if (this.isTokenExpiringSoon() && retryWithRefresh) {
        try {
          await this.refreshAccessToken()
        } catch (error) {
          // Continue avec le token actuel
        }
      }

      const currentToken = this.getToken()
      if (!currentToken) {
        this.handleAuthError()
        return {
          success: false,
          error: 'Non authentifié. Veuillez vous reconnecter.'
        }
      }

      headers['Authorization'] = `Bearer ${currentToken}`
    }

    const url = `${API_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      let data: any
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        await response.text()

        // Retry sur erreurs serveur
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return this.request<T>(endpoint, options, retryWithRefresh, retryCount + 1)
        }

        throw new Error('Réponse serveur invalide')
      }

      // Gestion spéciale de l'erreur 401
      if (response.status === 401) {
        if (retryWithRefresh && !isPublicEndpoint) {
          try {
            await this.refreshAccessToken()
            return this.request<T>(endpoint, options, false, retryCount)
          } catch (refreshError) {
            this.handleAuthError()
            throw new Error(data.error || 'Session expirée. Veuillez vous reconnecter.')
          }
        } else {
          this.handleAuthError()
          throw new Error(data.error || 'Session expirée. Veuillez vous reconnecter.')
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur API')
      }

      return data
    } catch (error: any) {
      // Retry sur erreurs réseau
      if (error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return this.request<T>(endpoint, options, retryWithRefresh, retryCount + 1)
      }

      if (error.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
        }
      }

      return {
        success: false,
        error: error.message || 'Erreur de connexion au serveur'
      }
    }
  }

  private handleAuthError() {
    this.setToken(null, null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('coffice-auth')

      const protectedPaths = ['/app', '/erp', '/dashboard', '/tableau-de-bord', '/admin', '/profil', '/reservations', '/mes-reservations']
      const currentPath = window.location.pathname
      const isProtectedPage = protectedPaths.some(path => currentPath.startsWith(path) || currentPath.includes(path))

      if (isProtectedPage && !currentPath.includes('/connexion')) {
        window.location.href = '/connexion?session_expired=1'
      }
    }
  }

  async login(email: string, password: string) {
    return this.request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(data: {
    email: string
    password: string
    nom: string
    prenom: string
    telephone?: string
    profession?: string
    entreprise?: string
    codeParrainage?: string
  }) {
    return this.request('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        profession: data.profession,
        entreprise: data.entreprise,
        code_parrainage: data.codeParrainage
      })
    })
  }

  async me() {
    return this.request('/auth/me.php')
  }

  async logout() {
    try {
      // Appeler l'endpoint logout pour logger la déconnexion côté serveur
      await this.request('/auth/logout.php', {
        method: 'POST'
      })
    } catch (error) {
      // Continuer même si l'appel échoue
    } finally {
      // Toujours nettoyer le token côté client
      this.setToken(null)
    }
    return { success: true, message: 'Déconnexion réussie' }
  }

  // ============= UTILISATEURS =============
  async getUsers() {
    return this.request('/users/index.php')
  }

  async getUser(id: string) {
    return this.request(`/users/show.php?id=${id}`)
  }

  async updateUser(id: string, data: any) {
    const apiData: Record<string, any> = {}
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
    Object.keys(data).forEach(key => {
      const apiKey = fieldMap[key] || key
      if (data[key] !== undefined) {
        apiData[apiKey] = data[key]
      }
    })
    return this.request(`/users/update.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData)
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/delete.php?id=${id}`, {
      method: 'DELETE'
    })
  }

  // ============= ESPACES =============
  async getEspaces() {
    return this.request('/espaces/index.php')
  }

  async getEspace(id: string) {
    return this.request(`/espaces/show.php?id=${id}`)
  }

  async createEspace(data: any) {
    return this.request('/espaces/create.php', {
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

  async updateEspace(id: string, data: any) {
    return this.request('/espaces/update.php', {
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

  async deleteEspace(id: string) {
    return this.request('/espaces/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    })
  }

  // ============= RÉSERVATIONS =============
  async getReservations(userId?: string) {
    const query = userId ? `?user_id=${userId}` : ''
    return this.request(`/reservations/index.php${query}`)
  }

  async getReservation(id: string) {
    return this.request(`/reservations/show.php?id=${id}`)
  }

  async createReservation(data: {
    espaceId: string
    dateDebut: string
    dateFin: string
    participants?: number
    notes?: string
    codePromo?: string
    montantTotal?: number
  }) {
    return this.request('/reservations/create.php', {
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

  async updateReservation(id: string, data: any) {
    return this.request('/reservations/update.php', {
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

  async cancelReservation(id: string) {
    return this.request('/reservations/cancel.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    })
  }

  // ============= DOMICILIATION =============
  async getDomiciliations() {
    return this.request('/domiciliations/index.php')
  }

  async getUserDomiciliation(userId: string) {
    return this.request(`/domiciliations/user.php?user_id=${userId}`)
  }

  async createDemandeDomiciliation(data: any) {
    const apiData = {
      raison_sociale: data.raisonSociale,
      forme_juridique: data.formeJuridique,
      capital: data.capital || null,
      activite_principale: data.activitePrincipale || null,
      nif: data.nif || null,
      nis: data.nis || null,
      registre_commerce: data.registreCommerce || null,
      article_imposition: data.articleImposition || null,
      numero_auto_entrepreneur: data.numeroAutoEntrepreneur || null,
      wilaya: data.wilaya || null,
      commune: data.commune || null,
      adresse_actuelle: data.adresseActuelle || null,
      coordonnees_fiscales: data.coordonneesFiscales || null,
      coordonnees_administratives: data.coordonneesAdministratives || null,
      date_creation_entreprise: data.dateCreationEntreprise || null,
      representant_nom: data.representantLegal?.nom || null,
      representant_prenom: data.representantLegal?.prenom || null,
      representant_fonction: data.representantLegal?.fonction || null,
      representant_telephone: data.representantLegal?.telephone || null,
      representant_email: data.representantLegal?.email || null,
      montant_mensuel: data.montantMensuel || 5000
    }

    return this.request('/domiciliations/create.php', {
      method: 'POST',
      body: JSON.stringify(apiData)
    })
  }

  async updateDemandeDomiciliation(id: string, data: any) {
    const apiData: Record<string, any> = { id }

    if (data.representantLegal) {
      apiData.representant_nom = data.representantLegal.nom
      apiData.representant_prenom = data.representantLegal.prenom
      apiData.representant_fonction = data.representantLegal.fonction
      apiData.representant_telephone = data.representantLegal.telephone
      apiData.representant_email = data.representantLegal.email
    }

    if (data.raisonSociale !== undefined) apiData.raison_sociale = data.raisonSociale
    if (data.formeJuridique !== undefined) apiData.forme_juridique = data.formeJuridique
    if (data.capital !== undefined) apiData.capital = data.capital
    if (data.nif !== undefined) apiData.nif = data.nif
    if (data.nis !== undefined) apiData.nis = data.nis
    if (data.registreCommerce !== undefined) apiData.registre_commerce = data.registreCommerce
    if (data.articleImposition !== undefined) apiData.article_imposition = data.articleImposition
    if (data.activitePrincipale !== undefined) apiData.activite_principale = data.activitePrincipale
    if (data.adresseActuelle !== undefined) apiData.adresse_actuelle = data.adresseActuelle
    if (data.coordonneesFiscales !== undefined) apiData.coordonnees_fiscales = data.coordonneesFiscales
    if (data.coordonneesAdministratives !== undefined) apiData.coordonnees_administratives = data.coordonneesAdministratives
    if (data.dateCreationEntreprise !== undefined) apiData.date_creation_entreprise = data.dateCreationEntreprise
    if (data.statut !== undefined) apiData.statut = data.statut
    if (data.commentaireAdmin !== undefined) apiData.commentaire_admin = data.commentaireAdmin

    return this.request('/domiciliations/update.php', {
      method: 'PUT',
      body: JSON.stringify(apiData)
    })
  }

  // ============= ABONNEMENTS =============
  async getAbonnements() {
    return this.request('/abonnements/index.php')
  }

  async createAbonnement(data: any) {
    return this.request('/abonnements/create.php', {
      method: 'POST',
      body: JSON.stringify({
        nom: data.nom,
        type: data.type,
        prix: data.prix,
        prix_avec_domiciliation: data.prixAvecDomiciliation,
        credits_mensuels: data.creditsMensuels || data.creditMensuel,
        duree_mois: data.dureeMois,
        description: data.description,
        avantages: data.avantages,
        actif: data.actif,
        couleur: data.couleur,
        ordre: data.ordre
      })
    })
  }

  async updateAbonnement(id: string, data: any) {
    return this.request('/abonnements/update.php', {
      method: 'PUT',
      body: JSON.stringify({
        id,
        nom: data.nom,
        type: data.type,
        prix: data.prix,
        prix_avec_domiciliation: data.prixAvecDomiciliation,
        credits_mensuels: data.creditsMensuels || data.creditMensuel,
        duree_mois: data.dureeMois,
        description: data.description,
        avantages: data.avantages,
        actif: data.actif,
        couleur: data.couleur,
        ordre: data.ordre
      })
    })
  }

  async deleteAbonnement(id: string) {
    return this.request('/abonnements/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    })
  }

  // ============= CODES PROMO =============
  async validateCodePromo(code: string, montant: number, type: string) {
    return this.request('/codes-promo/validate.php', {
      method: 'POST',
      body: JSON.stringify({ code, montant, type })
    }).then(response => {
      if (response.success && response.data) {
        const data = response.data as any
        return {
          valid: true,
          codePromoId: data.id || data.code,
          reduction: data.reduction || 0
        }
      }
      return {
        valid: false,
        error: response.error || 'Code invalide'
      }
    })
  }

  async getCodesPromo() {
    return this.request('/codes-promo/index.php')
  }

  async getPublicCodesPromo() {
    return this.request('/codes-promo/public.php')
  }

  async createCodePromo(data: any) {
    return this.request('/codes-promo/create.php', {
      method: 'POST',
      body: JSON.stringify({
        code: data.code,
        type: data.type,
        valeur: data.valeur,
        date_debut: data.dateDebut,
        date_fin: data.dateFin,
        usage_max: data.usageMax,
        usage_actuel: data.usageActuel || 0,
        actif: data.actif,
        type_reservation: data.typeReservation,
        montant_minimum: data.montantMinimum
      })
    })
  }

  async updateCodePromo(id: string, data: any) {
    return this.request(`/codes-promo/update.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        code: data.code,
        type: data.type,
        valeur: data.valeur,
        date_debut: data.dateDebut,
        date_fin: data.dateFin,
        usage_max: data.usageMax,
        usage_actuel: data.usageActuel,
        actif: data.actif,
        type_reservation: data.typeReservation,
        montant_minimum: data.montantMinimum
      })
    })
  }

  async deleteCodePromo(id: string) {
    return this.request(`/codes-promo/delete.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  }

  // ============= PARRAINAGES =============
  async getParrainages(userId?: string) {
    const query = userId ? `?user_id=${userId}` : ''
    return this.request(`/parrainages/index.php${query}`)
  }

  async verifyCodeParrainage(code: string) {
    return this.request('/parrainages/verify.php', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  // ============= STATISTIQUES =============
  async getAdminStats() {
    return this.request('/admin/stats.php')
  }

  async getRevenue(period: string = 'month') {
    return this.request(`/admin/revenue.php?period=${period}`)
  }

  // ============= NOTIFICATIONS =============
  async getNotifications() {
    return this.request('/notifications/index.php')
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/read.php?id=${id}`, {
      method: 'PUT'
    })
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all.php', {
      method: 'PUT'
    })
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/delete.php?id=${id}`, {
      method: 'DELETE'
    })
  }
}

export const apiClient = new ApiClient()
export default apiClient
