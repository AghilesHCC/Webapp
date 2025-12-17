import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Plus, Clock, CheckCircle, Gift, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useReservations, useEspaces } from '../../hooks/queries'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export function UserDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: allReservations = [] } = useReservations()
  const { data: espaces = [] } = useEspaces()

  const userReservations = useMemo(() => {
    return allReservations.filter(r => r.userId === user?.id)
  }, [allReservations, user?.id])

  const upcomingReservations = useMemo(() => {
    return userReservations
      .filter(r => {
        const resDate = new Date(r.dateDebut)
        return resDate >= new Date() && r.statut !== 'annulee'
      })
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
      .slice(0, 5)
  }, [userReservations])

  const stats = {
    total: userReservations.length,
    upcoming: upcomingReservations.length,
    confirmed: userReservations.filter(r => r.statut === 'confirmee').length,
    completed: userReservations.filter(r => r.statut === 'terminee').length,
  }

  const copyCodeToClipboard = () => {
    if (user?.parrainage?.codeParrain) {
      navigator.clipboard.writeText(user.parrainage.codeParrain)
      toast.success('Code copié!')
    }
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.prenom} {user?.nom}
        </h1>
        <p className="text-gray-600">
          Gérez vos réservations et explorez nos espaces
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Réservations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À venir</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmées</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Espaces disponibles</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {espaces.filter(e => e.disponible).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Réservations à venir</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/app/reservations')}>
                Voir tout
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucune réservation à venir</p>
                  <Button onClick={() => navigate('/espaces')}>
                    <Plus className="w-5 h-5 mr-2" />
                    Réserver un espace
                  </Button>
                </div>
              ) : (
                upcomingReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/app/reservations')}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {typeof reservation.espace === 'object' && 'nom' in reservation.espace
                          ? reservation.espace.nom
                          : '-'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(reservation.dateDebut))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reservation.dateDebut).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(reservation.dateFin).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          reservation.statut === 'confirmee'
                            ? 'success'
                            : reservation.statut === 'en_attente'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {reservation.statut === 'confirmee' && 'Confirmée'}
                        {reservation.statut === 'en_attente' && 'En attente'}
                        {reservation.statut === 'en_cours' && 'En cours'}
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

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mon Code</h3>
                <p className="text-sm text-gray-600">{user?.parrainage?.parraines || 0} parrainés</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg mb-3">
              <p className="text-2xl font-bold text-center tracking-wider text-gray-900">
                {user?.parrainage?.codeParrain || 'Chargement...'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyCodeToClipboard}
                className="text-xs"
                disabled={!user?.parrainage?.codeParrain}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Copier
              </Button>
              <Button size="sm" onClick={() => navigate('/app/profil')} className="text-xs">
                Voir détails
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={() => navigate('/espaces')}>
                <Plus className="w-5 h-5 mr-3" />
                Nouvelle réservation
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/reservations')}>
                <Calendar className="w-5 h-5 mr-3" />
                Mes réservations
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/profil')}>
                <MapPin className="w-5 h-5 mr-3" />
                Mon profil
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/domiciliation')}>
                <Calendar className="w-5 h-5 mr-3" />
                Domiciliation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
