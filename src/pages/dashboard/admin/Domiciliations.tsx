import { useState } from 'react'
import { Building, Mail, Phone } from 'lucide-react'
import { useDomiciliations, useUpdateDemandeDomiciliation } from '../../../hooks/queries'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import { DataTable, Column, getStatusBadge } from '../../../components/admin/DataTable'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatDate } from '../../../utils/formatters'
import type { DemandeDomiciliation } from '../../../types'

export default function Domiciliations() {
  const { data: domiciliations = [], isLoading } = useDomiciliations()
  const updateDemandeMutation = useUpdateDemandeDomiciliation()

  const [selectedDemande, setSelectedDemande] = useState<DemandeDomiciliation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleStatusChange = async (id: string, newStatus: string, commentaire?: string) => {
    await updateDemandeMutation.mutateAsync({
      id,
      data: {
        statut: newStatus as DemandeDomiciliation['statut'],
        commentaireAdmin: commentaire,
      },
    })
  }

  const handleValidate = async (demande: DemandeDomiciliation) => {
    const commentaire = prompt('Commentaire de validation (optionnel):')
    if (commentaire !== null) {
      await handleStatusChange(demande.id, 'validee', commentaire || undefined)
    }
  }

  const handleReject = async (demande: DemandeDomiciliation) => {
    const commentaire = prompt('Raison du rejet:')
    if (commentaire) {
      await handleStatusChange(demande.id, 'rejetee', commentaire)
    }
  }

  const columns: Column<DemandeDomiciliation>[] = [
    {
      key: 'raisonSociale',
      header: 'Entreprise',
      sortable: true,
      render: (demande) => (
        <div>
          <div className="font-medium text-gray-900">{demande.raisonSociale}</div>
          <div className="text-sm text-gray-500">{demande.formeJuridique}</div>
        </div>
      ),
    },
    {
      key: 'utilisateur',
      header: 'Contact',
      render: (demande) => (
        <div>
          <div className="text-sm text-gray-900">
            {demande.utilisateur?.nom} {demande.utilisateur?.prenom}
          </div>
          <div className="text-sm text-gray-500">{demande.utilisateur?.email}</div>
        </div>
      ),
    },
    {
      key: 'nif',
      header: 'NIF',
      render: (demande) => (
        <span className="text-sm text-gray-900">{demande.nif || '-'}</span>
      ),
    },
    {
      key: 'dateCreation',
      header: 'Date demande',
      sortable: true,
      render: (demande) => (
        <span className="text-sm text-gray-500">
          {formatDate(demande.dateCreation)}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (demande) => getStatusBadge(demande.statut),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (demande) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDemande(demande)
              setShowDetailModal(true)
            }}
          >
            Détails
          </Button>
          {demande.statut === 'en_attente' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleValidate(demande)
                }}
                className="text-green-600"
              >
                Valider
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReject(demande)
                }}
                className="text-red-600"
              >
                Rejeter
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const stats = {
    total: domiciliations.length,
    enAttente: domiciliations.filter(d => d.statut === 'en_attente').length,
    validees: domiciliations.filter(d => d.statut === 'validee').length,
    rejetees: domiciliations.filter(d => d.statut === 'rejetee').length,
  }

  return (
    <AdminPageLayout
      title="Gestion des Domiciliations"
      description="Gérez les demandes de domiciliation"
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Demandes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">En Attente</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.enAttente}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Validées</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.validees}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Rejetées</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejetees}</p>
        </Card>
      </div>

      <DataTable
        data={domiciliations}
        columns={columns}
        searchPlaceholder="Rechercher par raison sociale..."
        searchFields={['raisonSociale', 'nif', 'nis']}
        filters={[
          {
            key: 'statut',
            label: 'Tous les statuts',
            options: [
              { value: 'en_attente', label: 'En attente' },
              { value: 'validee', label: 'Validée' },
              { value: 'rejetee', label: 'Rejetée' },
            ],
          },
        ]}
        emptyMessage="Aucune demande trouvée"
      />

      {selectedDemande && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails de la demande"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Entreprise</h3>
              <p className="text-gray-900 font-medium">{selectedDemande.raisonSociale}</p>
              <p className="text-sm text-gray-600">{selectedDemande.formeJuridique}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">NIF</p>
                <p className="text-gray-900">{selectedDemande.nif || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">NIS</p>
                <p className="text-gray-900">{selectedDemande.nis || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">RC</p>
                <p className="text-gray-900">{selectedDemande.registreCommerce || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Article d'imposition</p>
                <p className="text-gray-900">{selectedDemande.articleImposition || '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Représentant Légal</h3>
              <p className="text-gray-900">
                {selectedDemande.representantLegal.nom} {selectedDemande.representantLegal.prenom}
              </p>
              <p className="text-sm text-gray-600">{selectedDemande.representantLegal.telephone}</p>
              <p className="text-sm text-gray-600">{selectedDemande.representantLegal.email}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Domaine d'activité</h3>
              <p className="text-gray-900">{selectedDemande.domaineActivite}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Adresse siège social</h3>
              <p className="text-gray-900">{selectedDemande.adresseSiegeSocial}</p>
            </div>

            {selectedDemande.commentaireAdmin && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Commentaire admin</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedDemande.commentaireAdmin}
                </p>
              </div>
            )}

            {selectedDemande.statut === 'en_attente' && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleValidate(selectedDemande)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Valider
                </Button>
                <Button
                  onClick={() => handleReject(selectedDemande)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Rejeter
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminPageLayout>
  )
}
