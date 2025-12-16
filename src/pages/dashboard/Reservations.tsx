import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ReservationForm from '../../components/dashboard/ReservationForm'
import { formatDate } from '../../utils/formatters'
import { getEspaceTypeLabel, getReservationStatutColor } from '../../constants'

const Reservations = () => {
  const { user } = useAuthStore()
  const { reservations, espaces } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedEspace, setSelectedEspace] = useState<any>(null)

  // Vérifier si user existe avant de filtrer
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  // Filtrer les réservations par userId plutôt que par utilisateur.id
  const userReservations = reservations.filter(r => r.userId === user.id)


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Réservations</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Button>
      </div>

      {userReservations.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
            <p className="text-gray-600 mb-4">Commencez par réserver un espace</p>
            <Button onClick={() => setShowForm(true)}>Faire une réservation</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userReservations.map((reservation) => (
            <Card key={reservation.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{reservation.espace?.nom || 'Espace inconnu'}</h3>
                  <Badge variant={getReservationStatutColor(reservation.statut)}>
                    {reservation.statut}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Du {formatDate(reservation.dateDebut)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Au {formatDate(reservation.dateFin)}</span>
                  </div>
                  {reservation.espace && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{getEspaceTypeLabel(reservation.espace.type)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Montant total</span>
                    <span className="font-bold text-accent">{reservation.montantTotal} DA</span>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Notes:</p>
                    <p>{reservation.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReservationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setSelectedEspace(null)
        }}
        selectedEspace={selectedEspace}
      />
    </div>
  )
}

export default Reservations
