import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Tag, Plus, Trash2, Search, Copy, ToggleLeft, ToggleRight
} from 'lucide-react'
import { useAppStore } from '../../../store/store'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const CodesPromo = () => {
  const { codesPromo, loadCodesPromo, addCodePromo, updateCodePromo, deleteCodePromo } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
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
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await loadCodesPromo()
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await addCodePromo({
        code: formData.code,
        type: formData.type,
        valeur: parseFloat(formData.valeur),
        dateDebut: formData.date_debut,
        dateFin: formData.date_fin,
        utilisationsMax: parseInt(formData.utilisations_max) || 100,
        description: formData.description || undefined
      })
      if (result.success) {
        toast.success('Code promo cree')
        setShowCreateModal(false)
        resetForm()
      } else {
        toast.error(result.error || 'Erreur lors de la creation')
      }
    } catch (error) {
      toast.error('Erreur lors de la creation')
    }
  }

  const handleToggleActive = async (id: string, actif: boolean) => {
    try {
      const result = await updateCodePromo(id, { actif: !actif })
      if (result.success) {
        toast.success(actif ? 'Code desactive' : 'Code active')
      } else {
        toast.error(result.error || 'Erreur lors de la mise a jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise a jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return
    try {
      const result = await deleteCodePromo(id)
      if (result.success) {
        toast.success('Code supprime')
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copie !')
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

  const filteredCodes = codesPromo.filter(code =>
    code.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary">
          Codes Promo
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Code
        </Button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCodes.map((code) => {
          const dateFin = code.dateFin || code.date_fin
          const dateDebut = code.dateDebut || code.date_debut
          const utilisationsMax = code.utilisationsMax || code.utilisations_max || 0
          const utilisationsActuelles = code.utilisationsActuelles || code.utilisations_actuelles || 0
          const isExpired = dateFin ? new Date(dateFin) < new Date() : false
          const isFullyUsed = utilisationsActuelles >= utilisationsMax
          const isActive = code.actif && !isExpired && !isFullyUsed

          return (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={!isActive ? 'opacity-60' : ''}>
                <div className="space-y-4">
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

                  {code.description && (
                    <p className="text-sm text-gray-600">{code.description}</p>
                  )}

                  <div className="text-2xl font-bold text-accent">
                    {code.type === 'pourcentage' ? (
                      <span>-{code.valeur}%</span>
                    ) : (
                      <span>-{code.valeur} DA</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilisations:</span>
                      <span className="font-medium">
                        {utilisationsActuelles} / {utilisationsMax}
                      </span>
                    </div>
                    {dateFin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valide jusqu'au:</span>
                        <span className="font-medium">
                          {format(new Date(dateFin), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isActive && <Badge variant="success">Actif</Badge>}
                    {isExpired && <Badge variant="danger">Expire</Badge>}
                    {isFullyUsed && <Badge variant="warning">Epuise</Badge>}
                    {!code.actif && <Badge variant="default">Desactive</Badge>}
                  </div>

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
                          <span className="text-sm font-medium">Desactiver</span>
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
          <p className="text-gray-500">Aucun code promo trouve</p>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Creer un code promo"
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
              Generer
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
                Type de reduction
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
              label="Date debut"
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

          <Input
            label="Utilisations max"
            type="number"
            value={formData.utilisations_max}
            onChange={(e) => setFormData({ ...formData, utilisations_max: e.target.value })}
            required
            placeholder="100"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Creer le code
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
