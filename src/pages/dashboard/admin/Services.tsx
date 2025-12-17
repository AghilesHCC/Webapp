import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Building2, Search,
  Download, CheckCircle, XCircle, Eye
} from 'lucide-react'
import { apiClient } from '../../../lib/api-client'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface ServiceItem {
  id: string
  user_nom?: string
  user_prenom?: string
  user_email?: string
  entreprise?: string
  type_abonnement?: string
  statut: string
  date_debut: string
  date_fin?: string
  montant: number
  adresse_fiscale?: string
  notes?: string
}

const Services = () => {
  const [activeTab, setActiveTab] = useState<'abonnements' | 'domiciliations'>('abonnements')
  const [abonnements, setAbonnements] = useState<ServiceItem[]>([])
  const [domiciliations, setDomiciliations] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'abonnements') {
        const response = await apiClient.getAbonnements()
        setAbonnements((response.data || []) as ServiceItem[])
      } else {
        const response = await apiClient.getDomiciliations()
        setDomiciliations((response.data || []) as ServiceItem[])
      }
    } catch {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      if (activeTab === 'abonnements') {
        await apiClient.updateAbonnement(id, { statut: newStatus })
        toast.success('Statut mis à jour')
      } else {
        await apiClient.updateDemandeDomiciliation(id, { statut: newStatus })
        toast.success('Statut mis à jour')
      }
      loadData()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, 'success' | 'danger' | 'warning' | 'secondary' | 'default'> = {
      actif: 'success',
      expire: 'danger',
      suspendu: 'warning',
      annule: 'secondary',
      en_attente: 'warning'
    }
    return <Badge variant={variants[statut] || 'secondary'}>{statut}</Badge>
  }

  const filteredData = () => {
    const data = activeTab === 'abonnements' ? abonnements : domiciliations
    return data.filter(item => {
      const matchSearch =
        item.user_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entreprise?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchFilter = filterStatus === 'all' || item.statut === filterStatus

      return matchSearch && matchFilter
    })
  }

  const exportData = () => {
    const data = filteredData()
    const csv = [
      ['ID', 'Utilisateur', 'Email', activeTab === 'abonnements' ? 'Type' : 'Entreprise', 'Statut', 'Date début', 'Date fin', 'Montant'],
      ...data.map(item => [
        item.id,
        `${item.user_prenom} ${item.user_nom}`,
        item.user_email,
        activeTab === 'abonnements' ? item.type_abonnement : item.entreprise,
        item.statut,
        format(new Date(item.date_debut), 'dd/MM/yyyy'),
        item.date_fin ? format(new Date(item.date_fin), 'dd/MM/yyyy') : '-',
        `${item.montant} DA`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export réussi')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary">
          Abonnements & Domiciliation
        </h1>
        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('abonnements')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'abonnements'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Abonnements
        </button>
        <button
          onClick={() => setActiveTab('domiciliations')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'domiciliations'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Domiciliations
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="expire">Expiré</option>
          <option value="suspendu">Suspendu</option>
          <option value="annule">Annulé</option>
          <option value="en_attente">En attente</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'abonnements' ? 'Type' : 'Entreprise'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData().map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.user_prenom} {item.user_nom}
                      </div>
                      <div className="text-sm text-gray-500">{item.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {activeTab === 'abonnements' ? item.type_abonnement : item.entreprise}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{format(new Date(item.date_debut), 'dd/MM/yyyy')}</div>
                    <div className="text-xs">
                      {item.date_fin ? format(new Date(item.date_fin), 'dd/MM/yyyy') : 'Indéterminée'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.montant} DA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(item)
                        setShowDetailModal(true)
                      }}
                      className="text-accent hover:text-accent-dark mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {item.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'actif')}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Activer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'annule')}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Détails ${activeTab === 'abonnements' ? "de l'abonnement" : 'de la domiciliation'}`}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Utilisateur</h3>
              <p className="text-gray-900">{selectedItem.user_prenom} {selectedItem.user_nom}</p>
              <p className="text-sm text-gray-500">{selectedItem.user_email}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Statut</h3>
              {getStatusBadge(selectedItem.statut)}
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Période</h3>
              <p className="text-gray-900">
                Du {format(new Date(selectedItem.date_debut), 'dd/MM/yyyy')}
                {selectedItem.date_fin && ` au ${format(new Date(selectedItem.date_fin), 'dd/MM/yyyy')}`}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Montant</h3>
              <p className="text-2xl font-bold text-accent">{selectedItem.montant} DA</p>
            </div>
            {activeTab === 'domiciliations' && (
              <>
                <div>
                  <h3 className="font-medium text-gray-700">Entreprise</h3>
                  <p className="text-gray-900">{selectedItem.entreprise}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Adresse fiscale</h3>
                  <p className="text-gray-900">{selectedItem.adresse_fiscale}</p>
                </div>
              </>
            )}
            {selectedItem.notes && (
              <div>
                <h3 className="font-medium text-gray-700">Notes</h3>
                <p className="text-gray-600">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Services
