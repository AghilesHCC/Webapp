import { useState } from 'react'
import { Mail, Phone, Building, Calendar, Plus, Edit } from 'lucide-react'
import { useUsers, useUpdateUser, useDeleteUser } from '../../../hooks/queries'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import { DataTable, Column, getStatusBadge } from '../../../components/admin/DataTable'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { formatDate } from '../../../utils/formatters'
import { useAppStore } from '../../../store/store'
import toast from 'react-hot-toast'
import type { User } from '../../../types'

export default function Users() {
  const { data: users = [], isLoading } = useUsers()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Partial<User>>({})
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    profession: '',
    entreprise: '',
    role: 'user' as 'user' | 'admin'
  })

  const { addUser } = useAppStore()

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

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser.id) return

    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        data: editingUser
      })
      setShowEditModal(false)
      setEditingUser({})
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password || !newUser.nom || !newUser.prenom) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const result = await addUser(newUser)
      if (result.success) {
        toast.success('Utilisateur créé avec succès')
        setShowCreateModal(false)
        setNewUser({
          email: '',
          password: '',
          nom: '',
          prenom: '',
          telephone: '',
          profession: '',
          entreprise: '',
          role: 'user'
        })
      } else {
        toast.error(result.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
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
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(user)
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            Éditer
          </Button>
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
        </div>
      ),
    },
  ]

  const stats = {
    total: users.length,
    active: users.filter((u: User) => u.statut === 'actif').length,
    admin: users.filter((u: User) => u.role === 'admin').length,
    recent: users.filter((u: User) => {
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
      action={
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      }
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

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Modifier l'utilisateur"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom"
                value={editingUser.nom || ''}
                onChange={(e) => setEditingUser({ ...editingUser, nom: e.target.value })}
              />
              <Input
                label="Prénom"
                value={editingUser.prenom || ''}
                onChange={(e) => setEditingUser({ ...editingUser, prenom: e.target.value })}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={editingUser.email || ''}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            />

            <Input
              label="Téléphone"
              value={editingUser.telephone || ''}
              onChange={(e) => setEditingUser({ ...editingUser, telephone: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Profession"
                value={editingUser.profession || ''}
                onChange={(e) => setEditingUser({ ...editingUser, profession: e.target.value })}
              />
              <Input
                label="Entreprise"
                value={editingUser.entreprise || ''}
                onChange={(e) => setEditingUser({ ...editingUser, entreprise: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editingUser.bio || ''}
                onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <Input
              label="Adresse"
              value={editingUser.adresse || ''}
              onChange={(e) => setEditingUser({ ...editingUser, adresse: e.target.value })}
            />

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveEdit} className="flex-1">
                Enregistrer
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Créer un utilisateur"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom"
                value={newUser.nom}
                onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                required
              />
              <Input
                label="Prénom"
                value={newUser.prenom}
                onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />

            <Input
              label="Téléphone"
              value={newUser.telephone}
              onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Profession"
                value={newUser.profession}
                onChange={(e) => setNewUser({ ...newUser, profession: e.target.value })}
              />
              <Input
                label="Entreprise"
                value={newUser.entreprise}
                onChange={(e) => setNewUser({ ...newUser, entreprise: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleCreate} className="flex-1">
                Créer
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminPageLayout>
  )
}
