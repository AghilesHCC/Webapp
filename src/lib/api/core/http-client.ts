import { tokenManager } from './token-manager'
import { API_URL, PUBLIC_ENDPOINTS, MAX_RETRIES } from './constants'
import type { ApiResponse } from './types'

export class HttpClient {
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryWithRefresh: boolean = true,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    }

    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(ep => endpoint.includes(ep))

    if (!isPublicEndpoint) {
      if (tokenManager.isTokenExpired()) {
        try {
          await tokenManager.refreshAccessToken()
        } catch (error) {
          tokenManager.handleAuthError()
          return {
            success: false,
            error: 'Session expirée. Veuillez vous reconnecter.'
          }
        }
      } else if (tokenManager.isTokenExpiringSoon() && retryWithRefresh) {
        try {
          await tokenManager.refreshAccessToken()
        } catch (error) {
          // Continue avec le token actuel
        }
      }

      const currentToken = tokenManager.getToken()
      if (!currentToken) {
        tokenManager.handleAuthError()
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
        const text = await response.text()

        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return this.request<T>(endpoint, options, retryWithRefresh, retryCount + 1)
        }

        throw new Error('Réponse serveur invalide')
      }

      if (response.status === 401) {
        if (retryWithRefresh && !isPublicEndpoint) {
          try {
            await tokenManager.refreshAccessToken()
            return this.request<T>(endpoint, options, false, retryCount)
          } catch (refreshError) {
            tokenManager.handleAuthError()
            throw new Error(data.error || 'Session expirée. Veuillez vous reconnecter.')
          }
        } else {
          tokenManager.handleAuthError()
          throw new Error(data.error || 'Session expirée. Veuillez vous reconnecter.')
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur API')
      }

      return data
    } catch (error: any) {
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
}

export const httpClient = new HttpClient()
