import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Tag, Plus, Edit2, Trash2, Search, Calendar, Percent, DollarSign,
  ToggleLeft, ToggleRight, Copy, CheckCircle, Eye
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

interface CodePromo {
  id: string
  code: string
  type: 'pourcentage' | 'montant_fixe'
  valeur: number
  actif: boolean
  date_debut: string
  date_fin: string
  utilisations_actuelles: number
  utilisations_max: number
  montant_min?: number
  types_application?: string
  description?: string
}

const CodesPromo = () => {
  const [codes, setCodes] = useState<CodePromo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCode, setSelectedCode] = useState<CodePromo | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'pourcentage' as 'pourcentage' | 'montant_fixe',
    valeur: '',
    date_debut: '',
    date_fin: '',
    utilisations_max: '',
    montant_min: '',
    types_application: 'tous',
    description: ''
  })

  useEffect(() => {
    loadCodes()
  }, [])

  const loadCodes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCodesPromo()
      setCodes((response.data || []) as any[])
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createCodePromo({
        code: formData.code,
        type: formData.type,
        valeur: parseFloat(formData.valeur),
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        utilisations_max: parseInt(formData.utilisations_max) || null,
        montant_min: formData.montant_min ? parseFloat(formData.montant_min) : 0,
        types_application: [formData.types_application],
        description: formData.description || null
      })
      toast.success('Code promo créé')
      setShowCreateModal(false)
      resetForm()
      loadCodes()
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  const handleToggleActive = async (id: string, actif: boolean) => {
    try {
      await apiClient.updateCodePromo(id, { actif: !actif })
      toast.success(actif ? 'Code désactivé' : 'Code activé')
      loadCodes()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return
    try {
      await apiClient.deleteCodePromo(id)
      toast.success('Code supprimé')
      loadCodes()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copié !')
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'pourcentage',
      valeur: '',
      date_debut: '',
      date_fin: '',
      utilisations_max: '',
      montant_min: '',
      types_application: 'tous',
      description: ''
    })
  }

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setFormData({ ...formData, code })
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
          Codes Promo
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Code
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Rechercher un code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCodes.map((code) => {
          const isExpired = new Date(code.date_fin) < new Date()
          const isFullyUsed = code.utilisations_actuelles >= code.utilisations_max
          const isActive = code.actif && !isExpired && !isFullyUsed

          return (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={!isActive ? 'opacity-60' : ''}>
                <div className="space-y-4">
                  {/* Code */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-accent" />
                      <code className="text-lg font-bold text-primary">{code.code}</code>
                    </div>
                    <button
                      onClick={() => copyCode(code.code)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Description */}
                  {code.description && (
                    <p className="text-sm text-gray-600">{code.description}</p>
                  )}

                  {/* Value */}
                  <div className="text-2xl font-bold text-accent">
                    {code.type === 'pourcentage' ? (
                      <span>-{code.valeur}%</span>
                    ) : (
                      <span>-{code.valeur} DA</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilisations:</span>
                      <span className="font-medium">
                        {code.utilisations_actuelles} / {code.utilisations_max}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valide jusqu'au:</span>
                      <span className="font-medium">
                        {format(new Date(code.date_fin), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    {code.montant_min && code.montant_min > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min:</span>
                        <span className="font-medium">{code.montant_min} DA</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-wrap gap-2">
                    {isActive && <Badge variant="success">Actif</Badge>}
                    {isExpired && <Badge variant="danger">Expiré</Badge>}
                    {isFullyUsed && <Badge variant="warning">Épuisé</Badge>}
                    {!code.actif && <Badge variant="default">Désactivé</Badge>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleToggleActive(code.id, code.actif)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        code.actif
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {code.actif ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span className="text-sm font-medium">Désactiver</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span className="text-sm font-medium">Activer</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun code promo trouvé</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Créer un code promo"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex gap-2">
            <Input
              label="Code promo"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="PROMO2024"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateRandomCode}
              className="mt-6"
            >
              Générer
            </Button>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Promotion de lancement"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de réduction
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pourcentage' | 'montant_fixe' })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="pourcentage">Pourcentage</option>
                <option value="montant_fixe">Montant fixe</option>
              </select>
            </div>

            <Input
              label="Valeur"
              type="number"
              value={formData.valeur}
              onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
              required
              placeholder={formData.type === 'pourcentage' ? '10' : '5000'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date début"
              type="date"
              value={formData.date_debut}
              onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
              required
            />
            <Input
              label="Date fin"
              type="date"
              value={formData.date_fin}
              onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Utilisations max"
              type="number"
              value={formData.utilisations_max}
              onChange={(e) => setFormData({ ...formData, utilisations_max: e.target.value })}
              required
              placeholder="100"
            />
            <Input
              label="Montant min. commande (DA)"
              type="number"
              value={formData.montant_min}
              onChange={(e) => setFormData({ ...formData, montant_min: e.target.value })}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable à
            </label>
            <select
              value={formData.types_application}
              onChange={(e) => setFormData({ ...formData, types_application: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="tous">Tous les services</option>
              <option value="reservation">Réservations uniquement</option>
              <option value="abonnement">Abonnements uniquement</option>
              <option value="domiciliation">Domiciliation uniquement</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Créer le code
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CodesPromo
