import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  MapPin
} from 'lucide-react'
import { useAppStore } from '../../../store/store'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import toast from 'react-hot-toast'

const Reservations = () => {
  const { reservations, updateReservation, espaces } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('tous')
  const [espaceFilter, setEspaceFilter] = useState<string>('tous')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleStatusChange = async (id: string, statut: string) => {
    try {
      const result = await updateReservation(id, { statut: statut as any })
      if (result?.success === false) {
        toast.error(result.error || 'Erreur lors de la mise à jour')
        return
      }
      toast.success(`Réservation ${statut === 'confirmee' ? 'confirmée' : 'refusée'}`)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleBulkAction = async (action: 'confirmer' | 'refuser') => {
    if (selectedIds.length === 0) {
      toast.error('Aucune réservation sélectionnée')
      return
    }

    try {
      const statut = action === 'confirmer' ? 'confirmee' : 'annulee'
      const results = await Promise.all(
        selectedIds.map(id => updateReservation(id, { statut: statut as any }))
      )

      const failed = results.filter(r => r?.success === false)
      if (failed.length > 0) {
        toast.error(`${failed.length} réservation(s) n'ont pas pu être mises à jour`)
        return
      }

      toast.success(`${selectedIds.length} réservation(s) ${action === 'confirmer' ? 'confirmées' : 'refusées'}`)
      setSelectedIds([])
    } catch (error) {
      toast.error('Erreur lors de l\'action groupée')
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReservations.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredReservations.map(r => r.id))
    }
  }

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchSearch = searchTerm === '' ||
        res.utilisateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.utilisateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.espace?.nom?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatut = statutFilter === 'tous' || res.statut === statutFilter
      const matchEspace = espaceFilter === 'tous' || res.espace?.id === espaceFilter

      return matchSearch && matchStatut && matchEspace
    }).sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
  }, [reservations, searchTerm, statutFilter, espaceFilter])

  const stats = useMemo(() => {
    const total = reservations.length
    const enAttente = reservations.filter(r => r.statut === 'en_attente').length
    const confirmees = reservations.filter(r => r.statut === 'confirmee').length
    const annulees = reservations.filter(r => r.statut === 'annulee').length
    const revenuTotal = reservations
      .filter(r => r.statut === 'confirmee')
      .reduce((sum, r) => sum + r.montantTotal, 0)

    return { total, enAttente, confirmees, annulees, revenuTotal }
  }, [reservations])

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirmee': return 'success'
      case 'en_attente': return 'warning'
      case 'annulee': return 'danger'
      default: return 'default'
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Espace', 'Début', 'Fin', 'Montant', 'Statut']
    const rows = filteredReservations.map(r => [
      formatDate(r.dateCreation),
      `${r.utilisateur?.prenom || ''} ${r.utilisateur?.nom || ''}`,
      r.espace?.nom || '',
      formatDate(r.dateDebut),
      formatDate(r.dateFin),
      r.montantTotal,
      r.statut
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Export réussi')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
        <Button onClick={exportToCSV} variant="ghost" className="gap-2">
          <Download className="w-4 h-4" />
          Exporter CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{stats.enAttente}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmées</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmees}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-teal-600">{formatCurrency(stats.revenuTotal)}</p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={<Search className="w-5 h-5" />}
                placeholder="Rechercher par nom ou espace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmées</option>
              <option value="annulee">Annulées</option>
            </select>

            <select
              value={espaceFilter}
              onChange={(e) => setEspaceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="tous">Tous les espaces</option>
              {espaces.map(espace => (
                <option key={espace.id} value={espace.id}>{espace.nom}</option>
              ))}
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedIds.length} sélectionnée(s)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleBulkAction('confirmer')}
                >
                  Confirmer la sélection
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleBulkAction('refuser')}
                >
                  Refuser la sélection
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
              <p className="text-gray-500">
                {searchTerm || statutFilter !== 'tous' || espaceFilter !== 'tous'
                  ? 'Aucune réservation ne correspond à vos filtres'
                  : 'Aucune réservation enregistrée'}
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredReservations.length && filteredReservations.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
              <span>{filteredReservations.length} résultat(s)</span>
            </div>

            {filteredReservations.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(res.id)}
                      onChange={() => toggleSelection(res.id)}
                      className="mt-1 rounded border-gray-300"
                    />

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Utilisateur</p>
                        <p className="font-medium text-gray-900">
                          {res.utilisateur?.prenom} {res.utilisateur?.nom}
                        </p>
                        <p className="text-xs text-gray-500">{res.utilisateur?.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Espace</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{res.espace?.nom}</p>
                        </div>
                        <p className="text-xs text-gray-500">{res.participants} participant(s)</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Période</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(res.dateDebut)}
                        </p>
                        <p className="text-xs text-gray-500">
                          → {formatDate(res.dateFin)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Montant</p>
                        <p className="text-lg font-bold text-teal-600">
                          {formatCurrency(res.montantTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusColor(res.statut)}>
                        {res.statut === 'confirmee' ? 'Confirmée' :
                         res.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                      </Badge>

                      {res.statut === 'en_attente' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusChange(res.id, 'confirmee')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleStatusChange(res.id, 'annulee')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {res.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {res.notes}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Reservations
