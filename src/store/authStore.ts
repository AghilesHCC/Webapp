import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../lib/api-client'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  nom: string
  prenom: string
  telephone?: string
  role: 'admin' | 'user'
  statut?: 'actif' | 'inactif' | 'suspendu'
  avatar?: string
  profession?: string
  entreprise?: string
  adresse?: string
  bio?: string
  wilaya?: string
  commune?: string
  typeEntreprise?: string
  nif?: string
  nis?: string
  registreCommerce?: string
  articleImposition?: string
  numeroAutoEntrepreneur?: string
  raisonSociale?: string
  dateCreationEntreprise?: string
  capital?: string
  siegeSocial?: string
  activitePrincipale?: string
  formeJuridique?: string
  derniereConnexion?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  isAdmin: boolean

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  loadUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  nom: string
  prenom: string
  telephone?: string
  profession?: string
  entreprise?: string
  codeParrainage?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      isAdmin: false,

      initialize: async () => {
        try {
          set({ isLoading: true })
          const token = apiClient.getToken()

          if (!token) {
            set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
            return
          }

          // Vérifier le token avec l'API (sans redirection automatique)
          const response = await apiClient.me()

          if (!response.success || !response.data) {
            // Token invalide ou expiré - nettoyer SILENCIEUSEMENT
            apiClient.setToken(null)
            set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
            return
          }

          set({
            user: response.data as User,
            isAdmin: (response.data as User).role === 'admin',
            isInitialized: true,
            isLoading: false
          })
        } catch (error) {
          apiClient.setToken(null)
          set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })

          const response = await apiClient.login(email, password)

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Erreur de connexion')
          }

          // Sauvegarder les tokens
          const responseData = response.data as any
          apiClient.setToken(responseData.token, responseData.refreshToken)

          set({
            user: responseData.user as User,
            isAdmin: (responseData.user as User).role === 'admin',
            isLoading: false
          })

          toast.success('Connexion réussie')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur de connexion')
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })

          const response = await apiClient.register(data)

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Erreur lors de l\'inscription')
          }

          // Sauvegarder les tokens
          const responseData = response.data as any
          apiClient.setToken(responseData.token, responseData.refreshToken)

          set({
            user: responseData.user as User,
            isAdmin: false,
            isLoading: false
          })

          // Message spécial si code parrainage utilisé
          if (data.codeParrainage) {
            toast.success('Inscription réussie! Bonus parrainage appliqué 🎉')
          } else {
            toast.success('Inscription réussie!')
          }
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur lors de l\'inscription')
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.logout()

          if (typeof window !== 'undefined') {
            localStorage.removeItem('coffice-auth')
          }

          set({ user: null, isAdmin: false, isInitialized: true })
          toast.success('Déconnexion réussie')
        } catch (error) {
          apiClient.setToken(null, null)

          if (typeof window !== 'undefined') {
            localStorage.removeItem('coffice-auth')
          }

          set({ user: null, isAdmin: false, isInitialized: true })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true })

          const currentUser = get().user
          if (!currentUser) {
            throw new Error('Utilisateur non connecté')
          }

          const response = await apiClient.updateUser(currentUser.id, data)

          if (!response.success) {
            throw new Error(response.error || 'Erreur lors de la mise à jour')
          }

          set({
            user: { ...currentUser, ...data },
            isLoading: false
          })

          toast.success('Profil mis à jour')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur lors de la mise à jour')
          throw error
        }
      },

      loadUser: async () => {
        try {
          const response = await apiClient.me()

          if (response.success && response.data) {
            set({ user: response.data as User })
          }
        } catch (error) {
          // Erreur silencieuse
        }
      }
    }),
    {
      name: 'coffice-auth',
      partialize: () => ({})
    }
  )
)
