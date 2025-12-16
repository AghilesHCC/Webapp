import { useState } from 'react'
import { Mail, Phone, Building, Calendar } from 'lucide-react'
import { useUsers, useUpdateUser, useDeleteUser } from '../../../hooks/queries'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import { DataTable, Column, getStatusBadge } from '../../../components/admin/DataTable'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { formatDate } from '../../../utils/formatters'
import type { User } from '../../../types'

export default function Users() {
  const { data: users = [], isLoading } = useUsers()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await updateUserMutation.mutateAsync({
      id: userId,
      data: { statut: newStatus as User['statut'] },
    })
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserMutation.mutateAsync({
      id: userId,
      data: { role: newRole as User['role'] },
    })
  }

  const handleDelete = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await deleteUserMutation.mutateAsync(userId)
    }
  }

  const handleRowClick = (user: User) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const columns: Column<User>[] = [
    {
      key: 'nom',
      header: 'Utilisateur',
      sortable: true,
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.nom} {user.prenom}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      sortable: true,
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => {
            e.stopPropagation()
            handleRoleChange(user.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </select>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (user) => (
        <select
          value={user.statut || 'actif'}
          onChange={(e) => {
            e.stopPropagation()
            handleStatusChange(user.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
        </select>
      ),
    },
    {
      key: 'entreprise',
      header: 'Entreprise',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-900">
          {user.entreprise || '-'}
        </span>
      ),
    },
    {
      key: 'dateCreation',
      header: 'Inscription',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500">
          {formatDate(user.dateCreation || new Date())}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(user.id)
          }}
          className="text-red-600 hover:text-red-700"
        >
          Supprimer
        </Button>
      ),
    },
  ]

  const stats = {
    total: users.length,
    active: users.filter(u => u.statut === 'actif').length,
    admin: users.filter(u => u.role === 'admin').length,
    recent: users.filter(u => {
      const date = new Date(u.dateCreation || new Date())
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      return diff < 30 * 24 * 60 * 60 * 1000
    }).length,
  }

  return (
    <AdminPageLayout
      title="Gestion des Utilisateurs"
      description="Gérez les utilisateurs et leurs permissions"
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.admin}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nouveaux (30j)</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.recent}</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Rechercher par nom, email, entreprise..."
        searchFields={['nom', 'prenom', 'email', 'entreprise']}
        filters={[
          {
            key: 'role',
            label: 'Tous les rôles',
            options: [
              { value: 'user', label: 'Utilisateur' },
              { value: 'admin', label: 'Administrateur' },
            ],
          },
          {
            key: 'statut',
            label: 'Tous les statuts',
            options: [
              { value: 'actif', label: 'Actif' },
              { value: 'inactif', label: 'Inactif' },
              { value: 'suspendu', label: 'Suspendu' },
            ],
          },
        ]}
        onRowClick={handleRowClick}
        emptyMessage="Aucun utilisateur trouvé"
      />

      {selectedUser && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails de l'utilisateur"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedUser.nom} {selectedUser.prenom}
              </h3>
              <Badge variant={selectedUser.role === 'admin' ? 'default' : 'success'}>
                {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{selectedUser.email}</span>
              </div>

              {selectedUser.telephone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{selectedUser.telephone}</span>
                </div>
              )}

              {selectedUser.entreprise && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Building className="w-5 h-5" />
                  <span>{selectedUser.entreprise}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>
                  Inscrit le {formatDate(selectedUser.dateCreation || new Date())}
                </span>
              </div>
            </div>

            {selectedUser.bio && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-600">{selectedUser.bio}</p>
              </div>
            )}

            {selectedUser.adresse && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Adresse</h4>
                <p className="text-gray-600">{selectedUser.adresse}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminPageLayout>
  )
}
