import { API_URL, TOKEN_EXPIRY_THRESHOLD, PROTECTED_PATHS } from './constants'

export class TokenManager {
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.loadTokens()
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      this.refreshToken = localStorage.getItem('refresh_token')
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

  isTokenExpired(): boolean {
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

  isTokenExpiringSoon(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const parts = token.split('.')
      if (parts.length !== 3) return false

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      const exp = payload.exp * 1000
      const now = Date.now()
      const timeLeft = exp - now

      return timeLeft < TOKEN_EXPIRY_THRESHOLD
    } catch {
      return false
    }
  }

  async refreshAccessToken(): Promise<string> {
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

  handleAuthError() {
    this.setToken(null, null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('coffice-auth')

      const currentPath = window.location.pathname
      const isProtectedPage = PROTECTED_PATHS.some(
        path => currentPath.startsWith(path) || currentPath.includes(path)
      )

      if (isProtectedPage && !currentPath.includes('/connexion')) {
        window.location.href = '/connexion?session_expired=1'
      }
    }
  }

  clearTokens() {
    this.setToken(null, null)
  }
}

export const tokenManager = new TokenManager()
