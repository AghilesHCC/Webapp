import { useState } from 'react'
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useEspaces, useCreateEspace, useUpdateEspace, useDeleteEspace } from '../../../hooks/queries'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import { DataTable, Column } from '../../../components/admin/DataTable'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'
import {
  ESPACE_TYPE_OPTIONS,
  DEFAULT_ESPACE_TYPE,
  getEspaceTypeLabel,
  type EspaceType
} from '../../../constants'
import type { Espace } from '../../../types'

const equipementsList = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'ecran', label: 'Écran' },
  { id: 'cafe', label: 'Café' },
  { id: 'imprimante', label: 'Imprimante' },
  { id: 'visio', label: 'Visioconférence' }
]

export default function Spaces() {
  const { data: espaces = [], isLoading } = useEspaces()
  const createEspaceMutation = useCreateEspace()
  const updateEspaceMutation = useUpdateEspace()
  const deleteEspaceMutation = useDeleteEspace()

  const [showModal, setShowModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Espace | null>(null)

  const [formData, setFormData] = useState({
    nom: '',
    type: DEFAULT_ESPACE_TYPE as EspaceType,
    capacite: 1,
    prixHeure: 0,
    prixDemiJournee: 0,
    prixJour: 0,
    prixSemaine: 0,
    description: '',
    equipements: [] as string[],
    disponible: true
  })

  const resetForm = () => {
    setFormData({
      nom: '',
      type: DEFAULT_ESPACE_TYPE as EspaceType,
      capacite: 1,
      prixHeure: 0,
      prixDemiJournee: 0,
      prixJour: 0,
      prixSemaine: 0,
      description: '',
      equipements: [],
      disponible: true
    })
    setEditingSpace(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingSpace) {
        await updateEspaceMutation.mutateAsync({
          id: editingSpace.id,
          data: formData
        })
      } else {
        await createEspaceMutation.mutateAsync(formData)
      }
      setShowModal(false)
      resetForm()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleEdit = (espace: Espace) => {
    setEditingSpace(espace)
    setFormData({
      nom: espace.nom,
      type: espace.type,
      capacite: espace.capacite,
      prixHeure: espace.prixHeure,
      prixDemiJournee: espace.prixDemiJournee,
      prixJour: espace.prixJour,
      prixSemaine: espace.prixSemaine,
      description: espace.description,
      equipements: espace.equipements,
      disponible: espace.disponible
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet espace ?')) {
      await deleteEspaceMutation.mutateAsync(id)
    }
  }

  const handleToggleEquipement = (equipementId: string) => {
    setFormData(prev => ({
      ...prev,
      equipements: prev.equipements.includes(equipementId)
        ? prev.equipements.filter(e => e !== equipementId)
        : [...prev.equipements, equipementId]
    }))
  }

  const columns: Column<Espace>[] = [
    {
      key: 'nom',
      header: 'Espace',
      sortable: true,
      render: (espace) => (
        <div>
          <div className="font-medium text-gray-900">{espace.nom}</div>
          <div className="text-sm text-gray-500">
            {getEspaceTypeLabel(espace.type)}
          </div>
        </div>
      ),
    },
    {
      key: 'capacite',
      header: 'Capacité',
      sortable: true,
      render: (espace) => (
        <span className="text-sm text-gray-900">
          {espace.capacite} {espace.capacite > 1 ? 'personnes' : 'personne'}
        </span>
      ),
    },
    {
      key: 'prixHeure',
      header: 'Prix/heure',
      sortable: true,
      render: (espace) => (
        <span className="text-sm font-medium text-gray-900">
          {espace.prixHeure.toLocaleString()} DA
        </span>
      ),
    },
    {
      key: 'prixJour',
      header: 'Prix/jour',
      sortable: true,
      render: (espace) => (
        <span className="text-sm font-medium text-gray-900">
          {espace.prixJour.toLocaleString()} DA
        </span>
      ),
    },
    {
      key: 'disponible',
      header: 'Statut',
      sortable: true,
      render: (espace) => (
        <Badge variant={espace.disponible ? 'success' : 'error'}>
          {espace.disponible ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Disponible
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-1" />
              Indisponible
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'equipements',
      header: 'Équipements',
      render: (espace) => (
        <span className="text-sm text-gray-600">
          {espace.equipements.length} équipement{espace.equipements.length > 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (espace) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(espace)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(espace.id)
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const stats = {
    total: espaces.length,
    disponibles: espaces.filter(e => e.disponible).length,
    salleReunion: espaces.filter(e => e.type === 'salle_reunion').length,
    booth: espaces.filter(e => e.type === 'booth').length,
  }

  return (
    <AdminPageLayout
      title="Gestion des Espaces"
      description="Gérez les espaces de coworking et salles de réunion"
      isLoading={isLoading}
      action={{
        label: 'Nouvel Espace',
        onClick: () => {
          resetForm()
          setShowModal(true)
        },
        icon: <Plus className="w-5 h-5 mr-2" />,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Espaces</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Disponibles</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.disponibles}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Salles de Réunion</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.salleReunion}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Booths</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.booth}</p>
        </Card>
      </div>

      <DataTable
        data={espaces}
        columns={columns}
        searchPlaceholder="Rechercher par nom..."
        searchFields={['nom', 'description']}
        filters={[
          {
            key: 'type',
            label: 'Tous les types',
            options: ESPACE_TYPE_OPTIONS.map(opt => ({
              value: opt.value,
              label: opt.label
            })),
          },
          {
            key: 'disponible',
            label: 'Tous les statuts',
            options: [
              { value: 'true', label: 'Disponible' },
              { value: 'false', label: 'Indisponible' },
            ],
          },
        ]}
        emptyMessage="Aucun espace trouvé"
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingSpace ? 'Modifier l\'espace' : 'Nouvel espace'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de l'espace"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'espace
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EspaceType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              {ESPACE_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Capacité"
            type="number"
            value={formData.capacite}
            onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
            min={1}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix/heure (DA)"
              type="number"
              value={formData.prixHeure}
              onChange={(e) => setFormData({ ...formData, prixHeure: parseFloat(e.target.value) })}
              min={0}
              required
            />

            <Input
              label="Prix/demi-journée (DA)"
              type="number"
              value={formData.prixDemiJournee}
              onChange={(e) => setFormData({ ...formData, prixDemiJournee: parseFloat(e.target.value) })}
              min={0}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix/jour (DA)"
              type="number"
              value={formData.prixJour}
              onChange={(e) => setFormData({ ...formData, prixJour: parseFloat(e.target.value) })}
              min={0}
              required
            />

            <Input
              label="Prix/semaine (DA)"
              type="number"
              value={formData.prixSemaine}
              onChange={(e) => setFormData({ ...formData, prixSemaine: parseFloat(e.target.value) })}
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipements
            </label>
            <div className="grid grid-cols-2 gap-2">
              {equipementsList.map(eq => (
                <label key={eq.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.equipements.includes(eq.id)}
                    onChange={() => handleToggleEquipement(eq.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{eq.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
              Espace disponible
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createEspaceMutation.isPending || updateEspaceMutation.isPending}
            >
              {editingSpace ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminPageLayout>
  )
}
