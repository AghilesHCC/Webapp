import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Building, DollarSign, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { useReservations, useDomiciliations, useAdminStats } from '../../hooks/queries'
import { formatDate } from '../../utils/formatters'

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: reservations = [] } = useReservations()
  const { data: domiciliations = [] } = useDomiciliations()

  const recentReservations = useMemo(() => {
    return reservations
      .sort((a, b) => {
        const aDate = new Date(a.dateCreation || a.createdAt || 0)
        const bDate = new Date(b.dateCreation || b.createdAt || 0)
        return bDate.getTime() - aDate.getTime()
      })
      .slice(0, 5)
  }, [reservations])

  const pendingReservations = useMemo(() => {
    return reservations.filter(r => r.statut === 'en_attente').length
  }, [reservations])

  const pendingDomiciliations = useMemo(() => {
    return domiciliations.filter(d => d.statut === 'en_attente').length
  }, [domiciliations])

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
              <TrendingUp className="w-5 h-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Utilisateurs</p>
              <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-white/70 text-sm">{stats?.activeUsers || 0} actifs</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Réservations</p>
              <p className="text-3xl font-bold">{stats?.totalReservations || 0}</p>
              <p className="text-white/70 text-sm">{pendingReservations} en attente</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Revenu du mois</p>
              <p className="text-3xl font-bold">
                {((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K DA
              </p>
              <p className="text-white/70 text-sm">CA total: {((stats?.totalRevenue || 0) / 1000).toFixed(0)}K DA</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Taux d'occupation</p>
              <p className="text-3xl font-bold">{Math.round(stats?.occupancyRate || 0)}%</p>
              <p className="text-white/70 text-sm">{pendingDomiciliations} domiciliations en attente</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Réservations récentes</h3>
              <Link to="/app/admin/reservations">
                <Button variant="outline" size="sm">Voir tout</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentReservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune réservation récente</p>
              ) : (
                recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.utilisateur?.nom} {reservation.utilisateur?.prenom}
                        </p>
                        <p className="text-sm text-gray-600">
                          {typeof reservation.espace === 'object' && 'nom' in reservation.espace
                            ? reservation.espace.nom
                            : '-'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(new Date(reservation.dateDebut))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          reservation.statut === 'confirmee'
                            ? 'success'
                            : reservation.statut === 'en_attente'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {reservation.statut === 'confirmee' && 'Confirmée'}
                        {reservation.statut === 'en_attente' && 'En attente'}
                        {reservation.statut === 'annulee' && 'Annulée'}
                        {reservation.statut === 'terminee' && 'Terminée'}
                      </Badge>
                      <span className="font-semibold text-gray-900">
                        {reservation.montantTotal.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
            <div className="space-y-3">
              <Link to="/app/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-5 h-5 mr-3" />
                  Gérer les utilisateurs
                </Button>
              </Link>
              <Link to="/app/admin/espaces" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="w-5 h-5 mr-3" />
                  Gérer les espaces
                </Button>
              </Link>
              <Link to="/app/admin/reservations" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-5 h-5 mr-3" />
                  Gérer les réservations
                </Button>
              </Link>
              <Link to="/app/admin/domiciliations" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="w-5 h-5 mr-3" />
                  Demandes de domiciliation
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
