import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  TrendingUp
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { useAppStore } from '../../../store/store'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import toast from 'react-hot-toast'
import type { DemandeDomiciliation } from '../../../types'

const AdminDomiciliations = () => {
  const { demandesDomiciliation, loadDemandesDomiciliation } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('tous')
  const [selectedDemande, setSelectedDemande] = useState<DemandeDomiciliation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'valider' | 'rejeter' | 'activer'>('valider')
  const [commentaire, setCommentaire] = useState('')
  const [montantMensuel, setMontantMensuel] = useState(0)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDemandesDomiciliation()
  }, [])

  const filteredDemandes = demandesDomiciliation.filter(demande => {
    const matchesSearch =
      demande.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.representantLegal?.nom?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'tous' || demande.statut === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: demandesDomiciliation.length,
    enAttente: demandesDomiciliation.filter(d => d.statut === 'en_attente').length,
    validees: demandesDomiciliation.filter(d => d.statut === 'validee').length,
    rejetees: demandesDomiciliation.filter(d => d.statut === 'rejetee').length
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />En attente</Badge>
      case 'validee':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Validée</Badge>
      case 'rejetee':
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" />Rejetée</Badge>
      default:
        return <Badge><AlertCircle className="w-3 h-3 mr-1" />Inconnu</Badge>
    }
  }

  const handleAction = (demande: DemandeDomiciliation, action: 'valider' | 'rejeter' | 'activer') => {
    setSelectedDemande(demande)
    setActionType(action)
    setCommentaire('')

    if (action === 'activer') {
      setMontantMensuel(15000) // Montant par défaut
      const debut = new Date()
      const fin = new Date()
      fin.setFullYear(fin.getFullYear() + 1)
      setDateDebut(debut.toISOString().split('T')[0])
      setDateFin(fin.toISOString().split('T')[0])
    }

    setShowActionModal(true)
  }

  const handleViewDetails = (demande: DemandeDomiciliation) => {
    setSelectedDemande(demande)
    setShowDetailModal(true)
  }

  const submitAction = async () => {
    if (!selectedDemande) return

    setLoading(true)
    try {
      // TODO: Implémenter les appels API pour valider/rejeter/activer
      toast.success(`Demande ${actionType === 'valider' ? 'validée' : actionType === 'rejeter' ? 'rejetée' : 'activée'} avec succès`)
      setShowActionModal(false)
      await loadDemandesDomiciliation()
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Raison Sociale', 'NIF', 'Forme Juridique', 'Statut', 'Date Création', 'Représentant'],
      ...filteredDemandes.map(d => [
        d.raisonSociale,
        d.nif || '',
        d.formeJuridique,
        d.statut,
        formatDate(d.dateCreation),
        `${d.representantLegal?.prenom || ''} ${d.representantLegal?.nom || ''}`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `domiciliations_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Domiciliations</h1>
          <p className="text-gray-600 mt-1">Administration des demandes de domiciliation</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Building className="w-10 h-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">En Attente</p>
              <p className="text-3xl font-bold text-amber-900">{stats.enAttente}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Validées</p>
              <p className="text-3xl font-bold text-green-900">{stats.validees}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Rejetées</p>
              <p className="text-3xl font-bold text-red-900">{stats.rejetees}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher par raison sociale, NIF..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="validee">Validées</option>
              <option value="rejetee">Rejetées</option>
            </select>
          </div>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Liste des demandes */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identifiants
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Représentant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{demande.raisonSociale}</p>
                        <p className="text-sm text-gray-500">{demande.formeJuridique}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">NIF: {demande.nif || 'N/A'}</p>
                        <p className="text-gray-500">NIS: {demande.nis || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {demande.representantLegal?.prenom} {demande.representantLegal?.nom}
                        </p>
                        <p className="text-gray-500">{demande.representantLegal?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(demande.statut)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(demande.dateCreation)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(demande)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {demande.statut === 'en_attente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(demande, 'valider')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(demande, 'rejeter')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {demande.statut === 'validee' && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(demande, 'activer')}
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Activer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la demande"
      >
        {selectedDemande && (
          <div className="space-y-6">
            {/* Informations Entreprise */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-accent" />
                Informations Entreprise
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Raison Sociale</p>
                  <p className="font-medium">{selectedDemande.raisonSociale}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Forme Juridique</p>
                  <p className="font-medium">{selectedDemande.formeJuridique}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIF</p>
                  <p className="font-medium">{selectedDemande.nif || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIS</p>
                  <p className="font-medium">{selectedDemande.nis || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RC</p>
                  <p className="font-medium">{selectedDemande.registreCommerce || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Article Imposition</p>
                  <p className="font-medium">{selectedDemande.articleImposition || 'Non renseigné'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Domaine d'Activité</p>
                  <p className="font-medium">{selectedDemande.domaineActivite || 'Non renseigné'}</p>
                </div>
                {selectedDemande.capital && (
                  <div>
                    <p className="text-sm text-gray-600">Capital</p>
                    <p className="font-medium">{formatCurrency(selectedDemande.capital)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Représentant Légal */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Représentant Légal
              </h3>
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>
                    {selectedDemande.representantLegal?.prenom} {selectedDemande.representantLegal?.nom}
                  </span>
                  {selectedDemande.representantLegal?.fonction && (
                    <span className="text-sm text-gray-500">- {selectedDemande.representantLegal.fonction}</span>
                  )}
                </div>
                {selectedDemande.representantLegal?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedDemande.representantLegal.email}</span>
                  </div>
                )}
                {selectedDemande.representantLegal?.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedDemande.representantLegal.telephone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Statut */}
            <div>
              <h3 className="font-bold text-lg mb-4">Statut</h3>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  {getStatusBadge(selectedDemande.statut)}
                </div>
                <p className="text-sm text-gray-600">
                  Créé le {formatDate(selectedDemande.dateCreation)}
                </p>
              </div>
            </div>

            {selectedDemande.commentaireAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-900 mb-2">Commentaire Admin</p>
                <p className="text-sm text-amber-700">{selectedDemande.commentaireAdmin}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Action */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionType === 'valider' ? 'Valider la demande' :
          actionType === 'rejeter' ? 'Rejeter la demande' :
          'Activer la domiciliation'
        }
      >
        <div className="space-y-4">
          {actionType === 'activer' ? (
            <>
              <Input
                label="Montant Mensuel (DA)"
                type="number"
                value={montantMensuel}
                onChange={(e) => setMontantMensuel(parseFloat(e.target.value))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date Début"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
                <Input
                  label="Date Fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire {actionType === 'rejeter' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder={
                  actionType === 'valider'
                    ? 'Commentaire optionnel...'
                    : 'Veuillez préciser la raison du rejet...'
                }
                required={actionType === 'rejeter'}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowActionModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={submitAction}
              disabled={loading || (actionType === 'rejeter' && !commentaire)}
              className="flex-1"
            >
              {loading ? 'Traitement...' :
               actionType === 'valider' ? 'Valider' :
               actionType === 'rejeter' ? 'Rejeter' :
               'Activer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDomiciliations
