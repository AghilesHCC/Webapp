import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../lib/api-client'
import toast from 'react-hot-toast'

interface UserProfile {
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
  user: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  isAdmin: boolean

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
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

function transformUserData(userData: any): UserProfile {
  return {
    id: userData.id,
    email: userData.email,
    nom: userData.nom,
    prenom: userData.prenom,
    telephone: userData.telephone,
    role: userData.role,
    statut: userData.statut,
    avatar: userData.avatar,
    profession: userData.profession,
    entreprise: userData.entreprise,
    adresse: userData.adresse,
    bio: userData.bio,
    wilaya: userData.wilaya,
    commune: userData.commune,
    typeEntreprise: userData.type_entreprise,
    nif: userData.nif,
    nis: userData.nis,
    registreCommerce: userData.registre_commerce,
    articleImposition: userData.article_imposition,
    numeroAutoEntrepreneur: userData.numero_auto_entrepreneur,
    raisonSociale: userData.raison_sociale,
    dateCreationEntreprise: userData.date_creation_entreprise,
    capital: userData.capital?.toString(),
    siegeSocial: userData.siege_social,
    activitePrincipale: userData.activite_principale,
    formeJuridique: userData.forme_juridique,
    derniereConnexion: userData.derniere_connexion,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at
  }
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

          const response = await apiClient.me()

          if (!response.success || !response.data) {
            set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
            return
          }

          const userData = response.data as any
          const userProfile = transformUserData(userData)

          set({
            user: userProfile,
            isAdmin: userData.role === 'admin',
            isInitialized: true,
            isLoading: false
          })
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })

          const response = await apiClient.login(email, password)

          if (!response.success || !response.data) {
            set({ isLoading: false })
            const errorMsg = response.error || 'Email ou mot de passe incorrect'
            toast.error(errorMsg)
            throw new Error(errorMsg)
          }

          const { token, refreshToken, user: userData } = response.data as any

          apiClient.setToken(token, refreshToken)

          const userProfile = transformUserData(userData)

          set({
            user: userProfile,
            isAdmin: userData.role === 'admin',
            isLoading: false
          })

          toast.success('Connexion reussie')
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      loginWithGoogle: async (credential: string) => {
        try {
          set({ isLoading: true })

          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential })
          })

          const data = await response.json()

          if (!data.success || !data.data) {
            set({ isLoading: false })
            const errorMsg = data.error || 'Erreur de connexion avec Google'
            toast.error(errorMsg)
            throw new Error(errorMsg)
          }

          const { token, refreshToken, user: userData, isNewUser } = data.data

          apiClient.setToken(token, refreshToken)

          const userProfile = transformUserData(userData)

          set({
            user: userProfile,
            isAdmin: userData.role === 'admin',
            isLoading: false
          })

          if (isNewUser) {
            toast.success('Compte cree avec succes!')
          } else {
            toast.success('Connexion reussie')
          }
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur de connexion avec Google')
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })

          const response = await apiClient.register({
            email: data.email,
            password: data.password,
            nom: data.nom,
            prenom: data.prenom,
            telephone: data.telephone,
            profession: data.profession,
            entreprise: data.entreprise,
            codeParrainage: data.codeParrainage
          })

          if (!response.success || !response.data) {
            set({ isLoading: false })
            const errorMsg = response.error || 'Erreur lors de l\'inscription'
            toast.error(errorMsg)
            throw new Error(errorMsg)
          }

          const { token, refreshToken, user: userData } = response.data as any

          apiClient.setToken(token, refreshToken)

          const userProfile = transformUserData(userData)

          set({
            user: userProfile,
            isAdmin: false,
            isLoading: false
          })

          if (data.codeParrainage) {
            toast.success('Inscription reussie! Bonus parrainage applique')
          } else {
            toast.success('Inscription reussie!')
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.logout()
          set({ user: null, isAdmin: false, isInitialized: true })
          toast.success('Deconnexion reussie')
        } catch (error: any) {
          set({ user: null, isAdmin: false, isInitialized: true })
          toast.error('Erreur lors de la deconnexion')
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          set({ isLoading: true })

          const currentUser = get().user
          if (!currentUser) {
            throw new Error('Utilisateur non connecte')
          }

          const response = await apiClient.updateUser(currentUser.id, data)

          if (!response.success) {
            throw new Error(response.error || 'Erreur lors de la mise a jour')
          }

          set({
            user: { ...currentUser, ...data },
            isLoading: false
          })

          toast.success('Profil mis a jour')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur lors de la mise a jour')
          throw error
        }
      },

      loadUser: async () => {
        try {
          const token = apiClient.getToken()

          if (!token) return

          const response = await apiClient.me()

          if (response.success && response.data) {
            const userData = response.data as any
            const userProfile = transformUserData(userData)

            set({
              user: userProfile,
              isAdmin: userData.role === 'admin'
            })
          }
        } catch (error) {
          console.error('Error loading user:', error)
        }
      }
    }),
    {
      name: 'coffice-auth',
      partialize: () => ({})
    }
  )
)
