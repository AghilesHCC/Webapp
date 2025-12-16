import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  Building,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import { apiClient } from '../../lib/api-client'
import { formatDate, formatCurrency, formatTime } from '../../utils/formatters'

interface AdminStats {
  users: { total: number; active: number; growth: number }
  reservations: { today: number; month: number; growth: number }
  revenue: { month: number; growth: number }
  subscriptions: { active: number }
  domiciliations: { pending: number }
  occupancy: { rate: number; occupied: number; total: number; growth: number }
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { reservations, espaces, demandesDomiciliation } = useAppStore()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.getAdminStats()
        if (response.success && response.data) {
          setStats(response.data as AdminStats)
        }
      } catch (error) {
        // Erreur silencieuse
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const recentReservations = useMemo(() => {
    return reservations
      .sort((a, b) => new Date(b.dateCreation || b.createdAt).getTime() - new Date(a.dateCreation || a.createdAt).getTime())
      .slice(0, 5)
  }, [reservations])

  const pendingReservations = useMemo(() => {
    return reservations.filter(r => r.statut === 'en_attente').length
  }, [reservations])

  const pendingDomiciliations = useMemo(() => {
    return demandesDomiciliation.filter(d => d.statut === 'en_attente').length
  }, [demandesDomiciliation])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          Administration Coffice
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre espace de coworking
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              {stats && stats.users.growth !== 0 && (
                <div className={`flex items-center text-sm ${stats.users.growth > 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {stats.users.growth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(stats.users.growth)}%
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm mb-1">Utilisateurs</p>
            <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
            <p className="text-white/60 text-xs mt-2">{stats?.users.active || 0} actifs</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {stats && stats.revenue.growth !== 0 && (
                <div className={`flex items-center text-sm ${stats.revenue.growth > 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {stats.revenue.growth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(stats.revenue.growth)}%
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm mb-1">Revenus du mois</p>
            <p className="text-3xl font-bold">{formatCurrency(stats?.revenue.month || 0)}</p>
            <p className="text-white/60 text-xs mt-2">vs mois precedent</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-white/80">
                +{stats?.reservations.growth || 0} aujourd'hui
              </span>
            </div>
            <p className="text-white/80 text-sm mb-1">Reservations du mois</p>
            <p className="text-3xl font-bold">{stats?.reservations.month || 0}</p>
            <p className="text-white/60 text-xs mt-2">{stats?.reservations.today || 0} aujourd'hui</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              {stats && stats.occupancy.growth !== 0 && (
                <div className={`flex items-center text-sm ${stats.occupancy.growth > 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {stats.occupancy.growth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(stats.occupancy.growth)}%
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm mb-1">Taux d'occupation</p>
            <p className="text-3xl font-bold">{stats?.occupancy.rate || 0}%</p>
            <p className="text-white/60 text-xs mt-2">{stats?.occupancy.occupied || 0}/{stats?.occupancy.total || 0} espaces</p>
          </Card>
        </motion.div>
      </div>

      {(pendingReservations > 0 || pendingDomiciliations > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6 border-l-4 border-amber-500 bg-amber-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-2">Actions requises</h3>
                <div className="space-y-2">
                  {pendingReservations > 0 && (
                    <Link to="/app/admin/reservations" className="flex items-center justify-between text-sm text-amber-800 hover:text-amber-900">
                      <span>{pendingReservations} reservation(s) en attente de validation</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                  {pendingDomiciliations > 0 && (
                    <Link to="/app/admin/domiciliations" className="flex items-center justify-between text-sm text-amber-800 hover:text-amber-900">
                      <span>{pendingDomiciliations} demande(s) de domiciliation en attente</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Dernieres reservations
            </h3>
            <Link to="/app/admin/reservations" className="text-sm text-accent hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentReservations.length > 0 ? (
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">
                        {reservation.utilisateur?.prenom} {reservation.utilisateur?.nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reservation.espace?.nom} - {formatDate(reservation.dateDebut)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    reservation.statut === 'confirmee' ? 'success' :
                    reservation.statut === 'en_attente' ? 'warning' : 'danger'
                  }>
                    {reservation.statut === 'confirmee' ? 'Confirmee' :
                     reservation.statut === 'en_attente' ? 'En attente' : 'Annulee'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune reservation recente</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Acces rapide
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/app/admin/users">
              <div className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-medium text-blue-900">Utilisateurs</p>
                <p className="text-sm text-blue-600">{stats?.users.total || 0} inscrits</p>
              </div>
            </Link>

            <Link to="/app/admin/spaces">
              <div className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <Building className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-medium text-green-900">Espaces</p>
                <p className="text-sm text-green-600">{espaces.length} espaces</p>
              </div>
            </Link>

            <Link to="/app/admin/reservations">
              <div className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                <Calendar className="w-8 h-8 text-amber-600 mb-2" />
                <p className="font-medium text-amber-900">Reservations</p>
                <p className="text-sm text-amber-600">{pendingReservations} en attente</p>
              </div>
            </Link>

            <Link to="/app/admin/reports">
              <div className="p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors">
                <TrendingUp className="w-8 h-8 text-teal-600 mb-2" />
                <p className="font-medium text-teal-900">Rapports</p>
                <p className="text-sm text-teal-600">Statistiques</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

const UserDashboard = () => {
  const { user } = useAuthStore()
  const { reservations, espaces, initializeData } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      await initializeData()
      if (mounted) {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  const userReservations = reservations.filter(r => r.userId === user.id)
  const upcomingReservations = userReservations.filter(r =>
    new Date(r.dateDebut) > new Date() && r.statut !== 'annulee'
  )
  const completedReservations = userReservations.filter(r =>
    new Date(r.dateFin) < new Date() && r.statut === 'confirmee'
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
          Bonjour {user.prenom} !
        </h1>
        <p className="text-gray-600 text-lg">
          Voici un apercu de votre activite chez Coffice
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-accent to-accent/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">Total Reservations</p>
          <p className="text-3xl font-bold text-white">{userReservations.length}</p>
          <p className="text-white/60 text-xs mt-2">Toutes periodes confondues</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-teal to-teal/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">A Venir</p>
          <p className="text-3xl font-bold text-white">{upcomingReservations.length}</p>
          <p className="text-white/60 text-xs mt-2">Reservations planifiees</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-warm to-warm/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <CheckCircle className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">Statut Compte</p>
          <p className="text-3xl font-bold text-white">Actif</p>
          <p className="text-white/60 text-xs mt-2">Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">Sessions Completees</p>
          <p className="text-3xl font-bold text-white">{completedReservations.length}</p>
          <p className="text-white/60 text-xs mt-2">Reservations terminees</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/app/reservations">
          <Card hover className="p-6 border-2 border-transparent hover:border-accent group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Nouvelle Reservation
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Reserver un espace maintenant
            </p>
            <div className="flex items-center text-accent text-sm font-semibold">
              Commencer <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>

        <Link to="/app/domiciliation">
          <Card hover className="p-6 border-2 border-transparent hover:border-teal group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-teal to-teal/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Building className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Domiciliation
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Services de domiciliation
            </p>
            <div className="flex items-center text-teal text-sm font-semibold">
              Decouvrir <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>

        <Link to="/app/profil">
          <Card hover className="p-6 border-2 border-transparent hover:border-warm group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-warm to-warm/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Mon Profil
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Gerer mes informations
            </p>
            <div className="flex items-center text-warm text-sm font-semibold">
              Modifier <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>

        <Link to="/app/mon-entreprise">
          <Card hover className="p-6 border-2 border-transparent hover:border-primary group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Mon Entreprise
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Infos entreprise et documents
            </p>
            <div className="flex items-center text-primary text-sm font-semibold">
              Voir <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-display font-bold text-primary mb-4">
          Mes Reservations Recentes
        </h3>

        {upcomingReservations.length > 0 ? (
          <div className="space-y-4">
            {upcomingReservations.slice(0, 3).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-primary">{reservation.espace?.nom || 'Espace'}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(reservation.dateDebut)} a {formatTime(reservation.dateDebut)}
                    </p>
                  </div>
                </div>
                <Badge variant={reservation.statut === 'confirmee' ? 'success' : 'warning'}>
                  {reservation.statut === 'confirmee' ? 'Confirmee' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune reservation a venir</p>
            <Link to="/app/reservations">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Creer une reservation
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

const DashboardHome = () => {
  const { user } = useAuthStore()
  const { initializeData, loadUsers, loadDemandesDomiciliation } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        await initializeData()
        if (user?.role === 'admin') {
          await Promise.all([
            loadUsers(),
            loadDemandesDomiciliation()
          ])
        }
      } catch (error) {
        // Erreur silencieuse
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [user?.role])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Erreur d'authentification</h2>
        <p className="text-gray-600">Veuillez vous reconnecter</p>
      </div>
    )
  }

  if (user.role === 'admin') {
    return <AdminDashboard />
  }

  return <UserDashboard />
}

export default DashboardHome
