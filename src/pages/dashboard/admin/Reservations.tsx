import { useState } from 'react'
import { Calendar, MapPin, User } from 'lucide-react'
import { useReservations, useUpdateReservation, useCancelReservation } from '../../../hooks/queries'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import { DataTable, Column, getStatusBadge } from '../../../components/admin/DataTable'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatDate, formatPrice } from '../../../utils/formatters'
import type { Reservation } from '../../../types'

export default function Reservations() {
  const { data: reservations = [], isLoading } = useReservations()
  const updateReservationMutation = useUpdateReservation()
  const cancelReservationMutation = useCancelReservation()

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateReservationMutation.mutateAsync({
      id,
      data: { statut: newStatus as Reservation['statut'] },
    })
  }

  const handleCancel = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      await cancelReservationMutation.mutateAsync(id)
    }
  }

  const columns: Column<Reservation>[] = [
    {
      key: 'utilisateur',
      header: 'Client',
      sortable: true,
      render: (reservation) => (
        <div>
          <div className="font-medium text-gray-900">
            {reservation.utilisateur?.nom} {reservation.utilisateur?.prenom}
          </div>
          <div className="text-sm text-gray-500">
            {reservation.utilisateur?.email}
          </div>
        </div>
      ),
    },
    {
      key: 'espace',
      header: 'Espace',
      render: (reservation) => {
        const espace = reservation.espace
        return (
          <span className="text-sm text-gray-900">
            {typeof espace === 'object' && 'nom' in espace ? espace.nom : '-'}
          </span>
        )
      },
    },
    {
      key: 'dateDebut',
      header: 'Date/Heure',
      sortable: true,
      render: (reservation) => (
        <div className="text-sm">
          <div className="text-gray-900">{formatDate(new Date(reservation.dateDebut))}</div>
          <div className="text-gray-500">
            {new Date(reservation.dateDebut).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' - '}
            {new Date(reservation.dateFin).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (reservation) => (
        <select
          value={reservation.statut}
          onChange={(e) => {
            e.stopPropagation()
            handleStatusChange(reservation.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="en_attente">En attente</option>
          <option value="confirmee">Confirmée</option>
          <option value="annulee">Annulée</option>
          <option value="terminee">Terminée</option>
        </select>
      ),
    },
    {
      key: 'montantTotal',
      header: 'Montant',
      sortable: true,
      render: (reservation) => (
        <span className="text-sm font-medium text-gray-900">
          {formatPrice(reservation.montantTotal, false)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (reservation) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedReservation(reservation)
              setShowDetailModal(true)
            }}
          >
            Détails
          </Button>
          {reservation.statut !== 'annulee' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCancel(reservation.id)
              }}
              className="text-red-600"
            >
              Annuler
            </Button>
          )}
        </div>
      ),
    },
  ]

  const stats = {
    total: reservations.length,
    enAttente: reservations.filter(r => r.statut === 'en_attente').length,
    confirmees: reservations.filter(r => r.statut === 'confirmee').length,
    totalRevenu: reservations
      .filter(r => r.statut !== 'annulee')
      .reduce((sum, r) => sum + r.montantTotal, 0),
  }

  return (
    <AdminPageLayout
      title="Gestion des Réservations"
      description="Gérez toutes les réservations"
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Réservations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">En Attente</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.enAttente}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Confirmées</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmees}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Revenu Total</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatPrice(stats.totalRevenu, false)}
          </p>
        </Card>
      </div>

      <DataTable
        data={reservations}
        columns={columns}
        searchPlaceholder="Rechercher par client..."
        searchFields={['utilisateur']}
        filters={[
          {
            key: 'statut',
            label: 'Tous les statuts',
            options: [
              { value: 'en_attente', label: 'En attente' },
              { value: 'confirmee', label: 'Confirmée' },
              { value: 'annulee', label: 'Annulée' },
              { value: 'terminee', label: 'Terminée' },
            ],
          },
        ]}
        emptyMessage="Aucune réservation trouvée"
      />

      {selectedReservation && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails de la réservation"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Client</h3>
              <p className="text-gray-900">
                {selectedReservation.utilisateur?.nom} {selectedReservation.utilisateur?.prenom}
              </p>
              <p className="text-sm text-gray-600">{selectedReservation.utilisateur?.email}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Espace</h3>
              <p className="text-gray-900">
                {typeof selectedReservation.espace === 'object' && 'nom' in selectedReservation.espace
                  ? selectedReservation.espace.nom
                  : '-'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Date et Heure</h3>
              <p className="text-gray-900">
                {formatDate(new Date(selectedReservation.dateDebut))}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(selectedReservation.dateDebut).toLocaleTimeString('fr-FR')} -{' '}
                {new Date(selectedReservation.dateFin).toLocaleTimeString('fr-FR')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Montant</h3>
              <p className="text-xl font-bold text-blue-600">
                {formatPrice(selectedReservation.montantTotal, false)}
              </p>
            </div>

            {selectedReservation.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-600">{selectedReservation.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminPageLayout>
  )
}
