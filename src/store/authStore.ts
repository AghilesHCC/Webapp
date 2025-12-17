import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
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
  loginWithGoogle: () => Promise<void>
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

          const { data: { session }, error } = await supabase.auth.getSession()

          if (error || !session) {
            set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
            return
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profileError || !profile) {
            set({ user: null, isAdmin: false, isInitialized: true, isLoading: false })
            return
          }

          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            nom: profile.nom,
            prenom: profile.prenom,
            telephone: profile.telephone,
            role: profile.role,
            statut: profile.statut,
            avatar: profile.avatar,
            profession: profile.profession,
            entreprise: profile.entreprise,
            adresse: profile.adresse,
            bio: profile.bio,
            wilaya: profile.wilaya,
            commune: profile.commune,
            typeEntreprise: profile.type_entreprise,
            nif: profile.nif,
            nis: profile.nis,
            registreCommerce: profile.registre_commerce,
            articleImposition: profile.article_imposition,
            numeroAutoEntrepreneur: profile.numero_auto_entrepreneur,
            raisonSociale: profile.raison_sociale,
            dateCreationEntreprise: profile.date_creation_entreprise,
            capital: profile.capital?.toString(),
            siegeSocial: profile.siege_social,
            activitePrincipale: profile.activite_principale,
            formeJuridique: profile.forme_juridique,
            derniereConnexion: profile.derniere_connexion,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          }

          set({
            user: userProfile,
            isAdmin: profile.role === 'admin',
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

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            set({ isLoading: false })
            if (error.message.includes('Invalid login credentials')) {
              toast.error('Email ou mot de passe incorrect')
            } else if (error.message.includes('Email not confirmed')) {
              toast.error('Veuillez confirmer votre email')
            } else {
              toast.error(error.message)
            }
            throw error
          }

          if (!data.user) {
            set({ isLoading: false })
            throw new Error('Erreur de connexion')
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()

          if (profileError || !profile) {
            throw new Error('Impossible de charger le profil')
          }

          await supabase
            .from('profiles')
            .update({ derniere_connexion: new Date().toISOString() })
            .eq('id', data.user.id)

          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            nom: profile.nom,
            prenom: profile.prenom,
            telephone: profile.telephone,
            role: profile.role,
            statut: profile.statut,
            avatar: profile.avatar,
            profession: profile.profession,
            entreprise: profile.entreprise,
            adresse: profile.adresse,
            bio: profile.bio,
            wilaya: profile.wilaya,
            commune: profile.commune,
            typeEntreprise: profile.type_entreprise,
            nif: profile.nif,
            nis: profile.nis,
            registreCommerce: profile.registre_commerce,
            articleImposition: profile.article_imposition,
            numeroAutoEntrepreneur: profile.numero_auto_entrepreneur,
            raisonSociale: profile.raison_sociale,
            dateCreationEntreprise: profile.date_creation_entreprise,
            capital: profile.capital?.toString(),
            siegeSocial: profile.siege_social,
            activitePrincipale: profile.activite_principale,
            formeJuridique: profile.forme_juridique
          }

          set({
            user: userProfile,
            isAdmin: profile.role === 'admin',
            isLoading: false
          })

          toast.success('Connexion réussie')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur de connexion')
          throw error
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true })

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          })

          if (error) {
            throw new Error(error.message)
          }

          set({ isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.message || 'Erreur de connexion avec Google')
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                nom: data.nom,
                prenom: data.prenom,
                telephone: data.telephone,
                profession: data.profession,
                entreprise: data.entreprise,
                code_parrainage: data.codeParrainage
              }
            }
          })

          if (authError) {
            throw new Error(authError.message)
          }

          if (!authData.user) {
            throw new Error('Erreur lors de l\'inscription')
          }

          await new Promise(resolve => setTimeout(resolve, 1000))

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle()

          if (profileError || !profile) {
            throw new Error('Impossible de charger le profil')
          }

          if (data.codeParrainage) {
            const { data: parrainageData } = await supabase
              .from('parrainages')
              .select('id, parrain_id, parraines, recompenses_totales')
              .eq('code_parrain', data.codeParrainage)
              .maybeSingle()

            if (parrainageData && parrainageData.parrain_id !== authData.user.id) {
              await supabase
                .from('parrainages')
                .update({
                  parraines: (parrainageData.parraines || 0) + 1,
                  recompenses_totales: (parrainageData.recompenses_totales || 0) + 3000
                })
                .eq('id', parrainageData.id)

              await supabase
                .from('notifications')
                .insert({
                  user_id: parrainageData.parrain_id,
                  type: 'parrainage',
                  titre: 'Nouveau filleul!',
                  message: 'Vous avez gagné 3000 DA grâce à votre code de parrainage',
                  lue: false
                })
            }
          }

          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            nom: profile.nom,
            prenom: profile.prenom,
            telephone: profile.telephone,
            profession: profile.profession,
            entreprise: profile.entreprise,
            role: profile.role,
            statut: profile.statut
          }

          set({
            user: userProfile,
            isAdmin: false,
            isLoading: false
          })

          if (data.codeParrainage) {
            toast.success('Inscription réussie! Bonus parrainage appliqué')
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
          await supabase.auth.signOut()
          set({ user: null, isAdmin: false, isInitialized: true })
          toast.success('Déconnexion réussie')
        } catch (error: any) {
          set({ user: null, isAdmin: false, isInitialized: true })
          toast.error('Erreur lors de la déconnexion')
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          set({ isLoading: true })

          const currentUser = get().user
          if (!currentUser) {
            throw new Error('Utilisateur non connecté')
          }

          const updateData: any = {}
          if (data.nom) updateData.nom = data.nom
          if (data.prenom) updateData.prenom = data.prenom
          if (data.telephone !== undefined) updateData.telephone = data.telephone
          if (data.profession !== undefined) updateData.profession = data.profession
          if (data.entreprise !== undefined) updateData.entreprise = data.entreprise
          if (data.adresse !== undefined) updateData.adresse = data.adresse
          if (data.bio !== undefined) updateData.bio = data.bio
          if (data.wilaya !== undefined) updateData.wilaya = data.wilaya
          if (data.commune !== undefined) updateData.commune = data.commune
          if (data.avatar !== undefined) updateData.avatar = data.avatar
          if (data.typeEntreprise !== undefined) updateData.type_entreprise = data.typeEntreprise
          if (data.nif !== undefined) updateData.nif = data.nif
          if (data.nis !== undefined) updateData.nis = data.nis
          if (data.registreCommerce !== undefined) updateData.registre_commerce = data.registreCommerce
          if (data.articleImposition !== undefined) updateData.article_imposition = data.articleImposition
          if (data.numeroAutoEntrepreneur !== undefined) updateData.numero_auto_entrepreneur = data.numeroAutoEntrepreneur
          if (data.raisonSociale !== undefined) updateData.raison_sociale = data.raisonSociale
          if (data.dateCreationEntreprise !== undefined) updateData.date_creation_entreprise = data.dateCreationEntreprise
          if (data.capital !== undefined) updateData.capital = data.capital
          if (data.siegeSocial !== undefined) updateData.siege_social = data.siegeSocial
          if (data.activitePrincipale !== undefined) updateData.activite_principale = data.activitePrincipale
          if (data.formeJuridique !== undefined) updateData.forme_juridique = data.formeJuridique

          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', currentUser.id)

          if (error) {
            throw new Error(error.message)
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
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) return

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              email: profile.email,
              nom: profile.nom,
              prenom: profile.prenom,
              telephone: profile.telephone,
              role: profile.role,
              statut: profile.statut,
              avatar: profile.avatar,
              profession: profile.profession,
              entreprise: profile.entreprise,
              adresse: profile.adresse,
              bio: profile.bio,
              wilaya: profile.wilaya,
              commune: profile.commune,
              typeEntreprise: profile.type_entreprise,
              nif: profile.nif,
              nis: profile.nis,
              registreCommerce: profile.registre_commerce,
              articleImposition: profile.article_imposition,
              numeroAutoEntrepreneur: profile.numero_auto_entrepreneur,
              raisonSociale: profile.raison_sociale,
              dateCreationEntreprise: profile.date_creation_entreprise,
              capital: profile.capital?.toString(),
              siegeSocial: profile.siege_social,
              activitePrincipale: profile.activite_principale,
              formeJuridique: profile.forme_juridique
            }

            set({ user: userProfile })
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
