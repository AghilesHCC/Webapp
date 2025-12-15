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
    console.log('[API Client] Initialized with URL:', API_URL)
    if (this.token) {
      console.log('[API Client] Token found in localStorage')
    }
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
        console.log('[API Client] Token expired, refreshing BEFORE request...')
        try {
          await this.refreshAccessToken()
        } catch (error) {
          console.error('[API Client] Cannot refresh expired token:', error)
          this.handleAuthError()
          return {
            success: false,
            error: 'Session expirée. Veuillez vous reconnecter.'
          }
        }
      }
      // VERIFICATION 2: Token expire bientôt
      else if (this.isTokenExpiringSoon() && retryWithRefresh) {
        console.log('[API Client] Token expires soon, refreshing proactively...')
        try {
          await this.refreshAccessToken()
        } catch (error) {
          console.warn('[API Client] Proactive refresh failed, will continue with current token')
        }
      }

      const currentToken = this.getToken()
      if (!currentToken) {
        console.error('[API Client] No token available for authenticated endpoint')
        this.handleAuthError()
        return {
          success: false,
          error: 'Non authentifié. Veuillez vous reconnecter.'
        }
      }

      headers['Authorization'] = `Bearer ${currentToken}`
      console.log('[API Client] Added Authorization header with token:', currentToken.substring(0, 20) + '...')
    }

    const url = `${API_URL}${endpoint}`
    console.log('[API Client] Request:', options.method || 'GET', url)

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      console.log('[API Client] Response status:', response.status)

      let data: any
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('[API Client] Non-JSON response:', text.substring(0, 200))

        // Retry sur erreurs serveur
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          console.log(`[API Client] Server error, retrying... (${retryCount + 1}/${MAX_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return this.request<T>(endpoint, options, retryWithRefresh, retryCount + 1)
        }

        throw new Error('Réponse serveur invalide')
      }

      // Gestion spéciale de l'erreur 401
      if (response.status === 401) {
        console.error('[API Client] 401 Unauthorized received')

        if (retryWithRefresh && !isPublicEndpoint) {
          console.log('[API Client] Attempting token refresh after 401...')
          try {
            await this.refreshAccessToken()
            console.log('[API Client] Token refreshed successfully, retrying request...')
            return this.request<T>(endpoint, options, false, retryCount)
          } catch (refreshError) {
            console.error('[API Client] Refresh failed after 401:', refreshError)
            this.handleAuthError()
            throw new Error(data.error || 'Session expirée. Veuillez vous reconnecter.')
          }
        } else {
          console.error('[API Client] Cannot retry 401 (no refresh or public endpoint)')
          this.handleAuthError()
          throw new Error(data.error || 'Session expirée. Veuillez vous reconnecter.')
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur API')
      }

      return data
    } catch (error: any) {
      console.error('[API Client] Request error:', error)

      // Retry sur erreurs réseau
      if (error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
        console.log(`[API Client] Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`)
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
    console.warn('[API Client] Session expirée - nettoyage complet')
    this.setToken(null, null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('coffice-auth')

      const protectedPaths = ['/app', '/erp', '/dashboard', '/tableau-de-bord', '/admin', '/profil', '/reservations', '/mes-reservations']
      const currentPath = window.location.pathname
      const isProtectedPage = protectedPaths.some(path => currentPath.startsWith(path) || currentPath.includes(path))

      if (isProtectedPage && !currentPath.includes('/connexion')) {
        console.log('[API Client] Redirection vers login - session expirée')
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
      body: JSON.stringify(data)
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
      console.warn('Erreur lors de l\'appel logout API:', error)
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
    return this.request(`/users/update.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
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
      body: JSON.stringify(data)
    })
  }

  async updateEspace(id: string, data: any) {
    return this.request('/espaces/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
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
    // Conversion camelCase → snake_case pour l'API PHP
    const apiData = {
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
    }

    return this.request('/reservations/create.php', {
      method: 'POST',
      body: JSON.stringify(apiData)
    })
  }

  async updateReservation(id: string, data: any) {
    return this.request('/reservations/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
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
    return this.request('/domiciliations/create.php', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateDemandeDomiciliation(id: string, data: any) {
    return this.request('/domiciliations/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
    })
  }

  // ============= ABONNEMENTS =============
  async getAbonnements() {
    return this.request('/abonnements/index.php')
  }

  async createAbonnement(data: any) {
    return this.request('/abonnements/create.php', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAbonnement(id: string, data: any) {
    return this.request('/abonnements/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
    })
  }

  async deleteAbonnement(id: string) {
    return this.request('/abonnements/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    })
  }

  // ============= CODES PROMO =============
  async validateCodePromo(code: string, userId: string, montant: number, type: string) {
    return this.request('/codes-promo/validate.php', {
      method: 'POST',
      body: JSON.stringify({ code, montant, type })
    }).then(response => {
      if (response.success && response.data) {
        const data = response.data as any
        return {
          valid: true,
          codePromoId: data.code_promo_id || data.code,
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

  async createCodePromo(data: any) {
    return this.request('/codes-promo/create.php', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCodePromo(id: string, data: any) {
    return this.request('/codes-promo/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
    })
  }

  async deleteCodePromo(id: string) {
    return this.request('/codes-promo/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
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
