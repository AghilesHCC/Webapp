import { httpClient } from '../core/http-client'
import { tokenManager } from '../core/token-manager'
import type { ApiResponse, RegisterData } from '../core/types'

class AuthService {
  async login(email: string, password: string): Promise<ApiResponse> {
    return httpClient.request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(data: RegisterData): Promise<ApiResponse> {
    return httpClient.request('/auth/register.php', {
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

  async me(): Promise<ApiResponse> {
    return httpClient.request('/auth/me.php')
  }

  async logout(): Promise<ApiResponse> {
    try {
      await httpClient.request('/auth/logout.php', {
        method: 'POST'
      })
    } catch (error) {
      // Continue même si l'appel échoue
    } finally {
      tokenManager.clearTokens()
    }
    return { success: true, message: 'Déconnexion réussie' }
  }
}

export const authService = new AuthService()
