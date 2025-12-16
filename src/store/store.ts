import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../lib/api-client'
import toast from 'react-hot-toast'
import type {
  User, Espace, Reservation,
  Transaction, DemandeDomiciliation, DomiciliationService, CodePromo,
  CreateReservationData, CreateDomiciliationData, AdminStats, Abonnement, AbonnementUtilisateur
} from '../types'

interface Parrainage {
  id: string
  parrain_id: string
  parrain_nom: string
  parrain_prenom: string
  parrain_email: string
  filleul_id: string
  filleul_nom: string
  filleul_prenom: string
  filleul_email: string
  statut: string
  credits_accordes: number
  date_parrainage: string
}

interface NotificationSettings {
  emailNotificationsEnabled: boolean
  reservationReminders: boolean
  paymentNotifications: boolean
  maintenanceAlerts: boolean
}

interface AppState {
  users: User[]
  espaces: Espace[]
  reservations: Reservation[]
  transactions: Transaction[]
  demandesDomiciliation: DemandeDomiciliation[]
  domiciliationServices: DomiciliationService[]
  codesPromo: CodePromo[]
  parrainages: Parrainage[]
  abonnements: Abonnement[]
  abonnementsUtilisateurs: AbonnementUtilisateur[]
  notificationSettings: NotificationSettings
  initialized: boolean
  loading: boolean

  initializeData: () => Promise<void>

  loadCodesPromo: () => Promise<void>
  addCodePromo: (data: Partial<CodePromo>) => Promise<{ success: boolean; error?: string }>
  updateCodePromo: (id: string, data: Partial<CodePromo>) => Promise<{ success: boolean; error?: string }>
  deleteCodePromo: (id: string) => Promise<{ success: boolean; error?: string }>

  loadParrainages: () => Promise<void>

  loadAbonnements: () => Promise<void>
  addAbonnement: (data: Partial<Abonnement>) => Promise<{ success: boolean; error?: string }>
  updateAbonnement: (id: string, data: Partial<Abonnement>) => Promise<{ success: boolean; error?: string }>

  loadEspaces: () => Promise<void>
  addEspace: (data: Partial<Espace>) => Promise<{ success: boolean; error?: string }>
  updateEspace: (id: string, data: Partial<Espace>) => Promise<{ success: boolean; error?: string }>
  deleteEspace: (id: string) => Promise<{ success: boolean; error?: string }>

  loadReservations: () => Promise<void>
  createReservation: (data: CreateReservationData) => Promise<{ success: boolean; error?: string; id?: string }>
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<{ success: boolean; error?: string }>
  calculateReservationAmount: (espaceId: string, dateDebut: Date, dateFin: Date, codePromo?: string) => number

  loadDemandesDomiciliation: () => Promise<void>
  getUserDemandeDomiciliation: (userId: string) => DemandeDomiciliation | null
  createDemandeDomiciliation: (data: CreateDomiciliationData) => Promise<{ success: boolean; error?: string }>

  loadUsers: () => Promise<void>
  addUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  updateUser: (userId: string, data: any) => Promise<void>
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>

  getAdminStats: () => AdminStats
  getNotificationSettings: () => NotificationSettings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotificationsEnabled: true,
  reservationReminders: true,
  paymentNotifications: true,
  maintenanceAlerts: true
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      espaces: [],
      reservations: [],
      transactions: [],
      demandesDomiciliation: [],
      domiciliationServices: [],
      codesPromo: [],
      parrainages: [],
      abonnements: [],
      abonnementsUtilisateurs: [],
      notificationSettings: defaultNotificationSettings,
      initialized: false,
      loading: false,

      initializeData: async () => {
        const state = get()
        if (state.loading) return

        set({ loading: true })

        try {
          await Promise.all([
            get().loadEspaces(),
            get().loadReservations()
          ])

          set({ initialized: true })
        } catch (error) {
          // Erreur silencieuse
        } finally {
          set({ loading: false })
        }
      },

      loadCodesPromo: async () => {
        try {
          const response = await apiClient.getCodesPromo()
          if (response.success && response.data && Array.isArray(response.data)) {
            const codesPromo = response.data.map((c: any) => ({
              id: c.id,
              code: c.code,
              type: c.type,
              valeur: c.valeur,
              typeReduction: c.type_reduction,
              dateDebut: c.date_debut,
              dateFin: c.date_fin,
              utilisationsMax: c.utilisations_max,
              utilisationsActuelles: c.utilisations_actuelles,
              actif: c.actif,
              espaceId: c.espace_id,
              description: c.description,
              createdAt: c.created_at,
              updatedAt: c.updated_at
            }))
            set({ codesPromo })
          }
        } catch (error) {
          // Erreur silencieuse
        }
      },

      addCodePromo: async (data) => {
        try {
          const response = await apiClient.createCodePromo(data)
          if (response.success) {
            await get().loadCodesPromo()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      updateCodePromo: async (id, data) => {
        try {
          const response = await apiClient.updateCodePromo(id, data)
          if (response.success) {
            await get().loadCodesPromo()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      deleteCodePromo: async (id) => {
        try {
          const response = await apiClient.deleteCodePromo(id)
          if (response.success) {
            await get().loadCodesPromo()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      loadParrainages: async () => {
        try {
          const response = await apiClient.getParrainages()
          if (response.success && response.data && Array.isArray(response.data)) {
            set({ parrainages: response.data as Parrainage[] })
          }
        } catch (error) {
          // Erreur silencieuse
        }
      },

      loadEspaces: async () => {
        try {
          const response = await apiClient.getEspaces()
          if (response.success && response.data && Array.isArray(response.data)) {
            const espaces = response.data.map((e: any) => ({
              id: e.id,
              nom: e.nom,
              type: e.type,
              capacite: e.capacite,
              prixHeure: e.prix_heure,
              prixDemiJournee: e.prix_demi_journee || 0,
              prixJour: e.prix_jour,
              prixSemaine: e.prix_semaine,
              description: e.description,
              equipements: e.equipements || [],
              disponible: e.disponible,
              etage: e.etage,
              image: e.image_url,
              imageUrl: e.image_url,
              createdAt: e.created_at,
              updatedAt: e.updated_at
            }))
            set({ espaces })
          }
        } catch (error) {
          // Erreur silencieuse
        }
      },

      addEspace: async (data) => {
        try {
          const response = await apiClient.createEspace(data)
          if (response.success) {
            await get().loadEspaces()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      updateEspace: async (id, data) => {
        try {
          const response = await apiClient.updateEspace(id, data)
          if (response.success) {
            await get().loadEspaces()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      deleteEspace: async (id) => {
        try {
          const response = await apiClient.deleteEspace(id)
          if (response.success) {
            await get().loadEspaces()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      loadAbonnements: async () => {
        try {
          const response = await apiClient.getAbonnements()
          if (response.success && response.data && Array.isArray(response.data)) {
            const abonnements = response.data.map((a: any) => ({
              id: a.id,
              nom: a.nom,
              type: a.type,
              prix: a.prix,
              prixAvecDomiciliation: a.prix_avec_domiciliation,
              creditsMensuels: a.credits_mensuels,
              creditMensuel: a.credits_mensuels,
              dureeMois: a.duree_mois,
              dureeJours: (a.duree_mois || 1) * 30,
              description: a.description,
              avantages: a.avantages || [],
              actif: a.actif,
              statut: a.statut,
              couleur: a.couleur || '#3B82F6',
              ordre: a.ordre,
              createdAt: a.created_at,
              updatedAt: a.updated_at
            }))
            set({ abonnements })
          }
        } catch (error) {
          // Erreur silencieuse
        }
      },

      addAbonnement: async (data) => {
        try {
          const response = await apiClient.createAbonnement(data)
          if (response.success) {
            await get().loadAbonnements()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      updateAbonnement: async (id, data) => {
        try {
          const response = await apiClient.updateAbonnement(id, data)
          if (response.success) {
            await get().loadAbonnements()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      loadReservations: async () => {
        try {
          const response = await apiClient.getReservations()
          if (response.success && response.data) {
            const reservationsData = Array.isArray(response.data) ? response.data : response.data.data
            const reservations = (reservationsData || []).map((r: any) => ({
              id: r.id,
              userId: r.user_id,
              espaceId: r.espace_id,
              dateDebut: r.date_debut,
              dateFin: r.date_fin,
              statut: r.statut,
              typeReservation: r.type_reservation,
              montantTotal: r.montant_total,
              reduction: r.reduction,
              montantPaye: r.montant_paye,
              modePaiement: r.mode_paiement,
              notes: r.notes,
              dateCreation: r.created_at,
              createdAt: r.created_at,
              espace: r.espace_nom ? {
                id: r.espace_id,
                nom: r.espace_nom,
                type: r.espace_type
              } : undefined,
              utilisateur: r.user_nom ? {
                id: r.user_id,
                nom: r.user_nom,
                prenom: r.user_prenom,
                email: r.user_email,
                role: 'user' as const
              } : undefined
            }))
            set({ reservations })
          }
        } catch (error) {
          // Erreur silencieuse
        }
      },

      createReservation: async (data: CreateReservationData) => {
        try {
          // Ne jamais envoyer montantTotal - le serveur le calcule de manière sécurisée
          const response = await apiClient.createReservation({
            espaceId: data.espaceId,
            dateDebut: data.dateDebut.toISOString(),
            dateFin: data.dateFin.toISOString(),
            participants: data.participants,
            notes: data.notes,
            codePromo: data.codePromo
          })

          if (response.success) {
            await get().loadReservations()
            return { success: true, id: (response.data as any)?.id }
          }
          return { success: false, error: response.error || 'Erreur lors de la creation' }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      updateReservation: async (id, data) => {
        try {
          const response = await apiClient.updateReservation(id, data)
          if (response.success) {
            await get().loadReservations()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      calculateReservationAmount: (espaceId, dateDebut, dateFin) => {
        const espace = get().espaces.find(e => e.id === espaceId)
        if (!espace) return 0

        const diffMs = dateFin.getTime() - dateDebut.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        const diffDays = diffMs / (1000 * 60 * 60 * 24)

        let amount = 0

        if (diffDays >= 7) {
          const weeks = Math.ceil(diffDays / 7)
          amount = espace.prixSemaine * weeks
        } else if (diffDays >= 1) {
          const days = Math.ceil(diffDays)
          amount = espace.prixJour * days
        } else {
          const hours = Math.ceil(diffHours)
          amount = espace.prixHeure * hours
        }

        return Math.round(amount)
      },

      loadDemandesDomiciliation: async () => {
        try {
          const response = await apiClient.getDomiciliations()
          if (response.success && response.data) {
            const demandesDomiciliation = Array.isArray(response.data)
              ? response.data.map((d: any) => ({
                  id: d.id,
                  userId: d.user_id,
                  utilisateur: d.utilisateur,
                  raisonSociale: d.raison_sociale,
                  formeJuridique: d.forme_juridique,
                  nif: d.nif,
                  nis: d.nis,
                  registreCommerce: d.registre_commerce,
                  articleImposition: d.article_imposition,
                  coordonneesFiscales: d.coordonnees_fiscales,
                  coordonneesAdministratives: d.coordonnees_administratives,
                  representantLegal: typeof d.representant_legal === 'string'
                    ? JSON.parse(d.representant_legal)
                    : d.representant_legal,
                  domaineActivite: d.domaine_activite,
                  adresseSiegeSocial: d.adresse_siege_social,
                  capital: d.capital,
                  dateCreationEntreprise: d.date_creation_entreprise,
                  statut: d.statut,
                  commentaireAdmin: d.commentaire_admin,
                  dateValidation: d.date_validation,
                  dateCreation: d.created_at,
                  updatedAt: d.updated_at
                }))
              : []

            const domiciliationServices = demandesDomiciliation
              .filter((d: DemandeDomiciliation) => d.statut === 'validee')
              .map((d: DemandeDomiciliation) => ({
                id: d.id,
                userId: d.userId,
                demande: d,
                companyName: d.raisonSociale,
                legalForm: d.formeJuridique,
                identification: {
                  typeEntreprise: d.formeJuridique,
                  nif: d.nif,
                  nis: d.nis,
                  registreCommerce: d.registreCommerce,
                  articleImposition: d.articleImposition,
                  raisonSociale: d.raisonSociale,
                  dateCreation: d.dateCreationEntreprise,
                  capital: d.capital,
                  siegeSocial: d.adresseSiegeSocial,
                  activitePrincipale: d.domaineActivite
                },
                startDate: d.dateValidation || d.dateCreation,
                endDate: new Date(new Date(d.dateValidation || d.dateCreation).setFullYear(new Date(d.dateValidation || d.dateCreation).getFullYear() + 1)),
                status: 'active' as const,
                address: 'Mohammadia Mall, 4eme etage, Bureau 1178, Alger',
                services: ['Domiciliation', 'Courrier', 'Support administratif'],
                monthlyFee: 22000,
                setupFee: 0,
                documentsLegaux: [],
                representantLegal: d.representantLegal,
                activityDomain: d.domaineActivite,
                dateSignatureContrat: d.dateValidation,
                numeroContrat: `DOM-${d.id.substring(0, 8).toUpperCase()}`,
                visibleSurSite: true,
                createdAt: d.dateCreation,
                updatedAt: d.updatedAt
              }))

            set({ demandesDomiciliation, domiciliationServices })
          } else {
            set({ demandesDomiciliation: [], domiciliationServices: [] })
          }
        } catch (error) {
          set({ demandesDomiciliation: [], domiciliationServices: [] })
        }
      },

      getUserDemandeDomiciliation: (userId) => {
        return get().demandesDomiciliation.find(d => d.userId === userId) || null
      },

      createDemandeDomiciliation: async (data) => {
        try {
          const response = await apiClient.createDemandeDomiciliation(data)
          if (response.success) {
            await get().loadDemandesDomiciliation()
            return { success: true }
          }
          return { success: false, error: response.error || 'Erreur creation' }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      loadUsers: async () => {
        try {
          const response = await apiClient.getUsers()
          if (response.success && response.data) {
            const usersData = Array.isArray(response.data) ? response.data : response.data.data
            if (Array.isArray(usersData)) {
              const users = usersData.map((u: any) => ({
                ...u,
                dateCreation: u.created_at,
                derniereConnexion: u.derniere_connexion
              }))
              set({ users })
            }
          }
        } catch (error) {
          // Erreur silencieuse
        }
      },

      addUser: async (data) => {
        try {
          const response = await apiClient.register({
            email: data.email || '',
            password: data.password || '',
            nom: data.nom || '',
            prenom: data.prenom || '',
            telephone: data.telephone,
            profession: data.profession,
            entreprise: data.entreprise
          })

          if (response.success) {
            await get().loadUsers()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      updateUser: async (userId, data) => {
        try {
          const response = await apiClient.updateUser(userId, data)
          if (!response.success) {
            throw new Error(response.error || 'Erreur mise a jour')
          }

          const { user, loadUser } = (await import('./authStore')).useAuthStore.getState()

          if (user?.id === userId) {
            await loadUser()
          }

          if (user?.role === 'admin') {
            await get().loadUsers()
          }

          toast.success('Informations mises a jour')
        } catch (error: any) {
          toast.error(error.message || 'Erreur')
          throw error
        }
      },

      deleteUser: async (userId) => {
        try {
          const response = await apiClient.deleteUser(userId)
          if (response.success) {
            await get().loadUsers()
            return { success: true }
          }
          return { success: false, error: response.error }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      getAdminStats: () => {
        const state = get()
        const today = new Date()
        const thisMonth = today.getMonth()
        const thisYear = today.getFullYear()

        const reservationsCeMois = state.reservations.filter(r => {
          const date = new Date(r.dateCreation || r.createdAt)
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear
        })

        const caMois = reservationsCeMois.reduce((sum, r) => sum + (r.montantTotal || 0), 0)

        const espacesOccupes = state.espaces.filter(e => !e.disponible).length
        const tauxOccupation = state.espaces.length > 0
          ? Math.round((espacesOccupes / state.espaces.length) * 100)
          : 0

        return {
          totalRevenue: state.transactions.reduce((sum, t) => sum + (t.montant || 0), 0),
          totalReservations: state.reservations.length,
          totalUsers: state.users.length,
          activeUsers: state.users.filter(u => u.statut === 'actif').length,
          occupancyRate: tauxOccupation,
          tauxOccupation,
          monthlyRevenue: caMois,
          caMois,
          reservationsCeMois: reservationsCeMois.length,
          popularSpaces: state.espaces.slice(0, 5).map(e => ({
            name: e.nom,
            count: state.reservations.filter(r => r.espaceId === e.id).length
          })),
          recentActivity: state.reservations.slice(0, 10).map(r => ({
            type: 'reservation',
            description: `Reservation ${r.espace?.nom || 'Espace'}`,
            date: new Date(r.dateCreation || r.createdAt)
          }))
        }
      },

      getNotificationSettings: () => {
        return get().notificationSettings
      },

      updateNotificationSettings: (settings) => {
        set(state => ({
          notificationSettings: { ...state.notificationSettings, ...settings }
        }))
      }
    }),
    {
      name: 'coffice-app-storage',
      partialize: (state) => ({
        notificationSettings: state.notificationSettings
      })
    }
  )
)
