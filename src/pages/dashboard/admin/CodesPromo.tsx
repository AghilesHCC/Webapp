import { useState } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { useCodesPromo, useCreateCodePromo, useUpdateCodePromo, useDeleteCodePromo } from '../../../hooks/queries'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import { DataTable, Column } from '../../../components/admin/DataTable'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'
import { formatDate } from '../../../utils/formatters'
import type { CodePromo } from '../../../types'

export default function CodesPromo() {
  const { data: codesPromo = [], isLoading } = useCodesPromo()
  const createCodeMutation = useCreateCodePromo()
  const updateCodeMutation = useUpdateCodePromo()
  const deleteCodeMutation = useDeleteCodePromo()

  const [showModal, setShowModal] = useState(false)
  const [editingCode, setEditingCode] = useState<CodePromo | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    type: 'pourcentage' as 'pourcentage' | 'montant_fixe',
    valeur: 0,
    dateDebut: '',
    dateFin: '',
    usageMax: 100,
    actif: true,
    montantMinimum: 0,
  })

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'pourcentage',
      valeur: 0,
      dateDebut: '',
      dateFin: '',
      usageMax: 100,
      actif: true,
      montantMinimum: 0,
    })
    setEditingCode(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        valeur: formData.valeur,
        dateDebut: new Date(formData.dateDebut),
        dateFin: new Date(formData.dateFin),
        utilisationsMax: formData.usageMax,
        utilisationsActuelles: 0,
        actif: formData.actif,
        montantMin: formData.montantMinimum,
      }

      if (editingCode) {
        await updateCodeMutation.mutateAsync({ id: editingCode.id, data })
      } else {
        await createCodeMutation.mutateAsync(data)
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleEdit = (code: CodePromo) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      type: code.type,
      valeur: code.valeur,
      dateDebut: new Date(code.dateDebut).toISOString().split('T')[0],
      dateFin: new Date(code.dateFin).toISOString().split('T')[0],
      usageMax: code.utilisationsMax,
      actif: code.actif,
      montantMinimum: code.montantMin || 0,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      await deleteCodeMutation.mutateAsync(id)
    }
  }

  const columns: Column<CodePromo>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (code) => (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="font-mono font-semibold text-gray-900">{code.code}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (code) => (
        <Badge variant="default">
          {code.type === 'pourcentage' ? 'Pourcentage' : 'Montant fixe'}
        </Badge>
      ),
    },
    {
      key: 'valeur',
      header: 'Valeur',
      sortable: true,
      render: (code) => (
        <span className="text-sm font-medium text-gray-900">
          {code.type === 'pourcentage' ? `${code.valeur}%` : `${code.valeur} DA`}
        </span>
      ),
    },
    {
      key: 'utilisationsActuelles',
      header: 'Utilisation',
      sortable: true,
      render: (code) => (
        <span className="text-sm text-gray-600">
          {code.utilisationsActuelles} / {code.utilisationsMax}
        </span>
      ),
    },
    {
      key: 'dateFin',
      header: 'Expire le',
      sortable: true,
      render: (code) => (
        <span className="text-sm text-gray-500">
          {formatDate(code.dateFin)}
        </span>
      ),
    },
    {
      key: 'actif',
      header: 'Statut',
      sortable: true,
      render: (code) => (
        <Badge variant={code.actif ? 'success' : 'error'}>
          {code.actif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (code) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(code)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(code.id)
            }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const stats = {
    total: codesPromo.length,
    actifs: codesPromo.filter((c: CodePromo) => c.actif).length,
    expires: codesPromo.filter((c: CodePromo) => new Date(c.dateFin) < new Date()).length,
    utilises: codesPromo.reduce((sum: number, c: CodePromo) => sum + c.utilisationsActuelles, 0),
  }

  return (
    <AdminPageLayout
      title="Gestion des Codes Promo"
      description="Créez et gérez les codes promotionnels"
      isLoading={isLoading}
      action={{
        label: 'Nouveau Code',
        onClick: () => {
          resetForm()
          setShowModal(true)
        },
        icon: <Plus className="w-5 h-5 mr-2" />,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Codes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Codes Actifs</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.actifs}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Codes Expirés</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.expires}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Utilisations</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.utilises}</p>
        </Card>
      </div>

      <DataTable
        data={codesPromo}
        columns={columns}
        searchPlaceholder="Rechercher par code..."
        searchFields={['code']}
        filters={[
          {
            key: 'actif',
            label: 'Tous les statuts',
            options: [
              { value: 'true', label: 'Actif' },
              { value: 'false', label: 'Inactif' },
            ],
          },
          {
            key: 'type',
            label: 'Tous les types',
            options: [
              { value: 'pourcentage', label: 'Pourcentage' },
              { value: 'montant_fixe', label: 'Montant fixe' },
            ],
          },
        ]}
        emptyMessage="Aucun code promo trouvé"
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingCode ? 'Modifier le code promo' : 'Nouveau code promo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="PROMO2024"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de réduction</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pourcentage' | 'montant_fixe' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="pourcentage">Pourcentage</option>
              <option value="montant_fixe">Montant fixe</option>
            </select>
          </div>

          <Input
            label={formData.type === 'pourcentage' ? 'Valeur (%)' : 'Valeur (DA)'}
            type="number"
            value={formData.valeur}
            onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) })}
            min={0}
            max={formData.type === 'pourcentage' ? 100 : undefined}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date début"
              type="date"
              value={formData.dateDebut}
              onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
              required
            />

            <Input
              label="Date fin"
              type="date"
              value={formData.dateFin}
              onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
              required
            />
          </div>

          <Input
            label="Nombre d'utilisations max"
            type="number"
            value={formData.usageMax}
            onChange={(e) => setFormData({ ...formData, usageMax: parseInt(e.target.value) })}
            min={1}
            required
          />

          <Input
            label="Montant minimum (DA)"
            type="number"
            value={formData.montantMinimum}
            onChange={(e) => setFormData({ ...formData, montantMinimum: parseFloat(e.target.value) })}
            min={0}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="actif" className="text-sm font-medium text-gray-700">
              Code actif
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
              disabled={createCodeMutation.isPending || updateCodeMutation.isPending}
            >
              {editingCode ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminPageLayout>
  )
}
