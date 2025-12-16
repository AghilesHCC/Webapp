import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  User,
  Briefcase,
  Rocket,
  FileText,
  MapPin,
  Calendar,
  Hash,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import { wilayas } from '../../data/wilayas'
import { Link } from 'react-router-dom'

type ProfileType = 'personne_physique' | 'auto_entrepreneur' | 'startup' | 'personne_morale' | null

interface ProfileTypeOption {
  id: ProfileType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const profileTypes: ProfileTypeOption[] = [
  {
    id: 'personne_physique',
    title: 'Personne Physique',
    description: 'Particulier souhaitant une adresse professionnelle',
    icon: <User className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  {
    id: 'auto_entrepreneur',
    title: 'Auto-Entrepreneur',
    description: 'Travailleur independant avec statut auto-entrepreneur',
    icon: <Briefcase className="w-8 h-8" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100 border-teal-200'
  },
  {
    id: 'startup',
    title: 'Startup / Projet',
    description: 'Projet innovant ou entreprise en creation',
    icon: <Rocket className="w-8 h-8" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  },
  {
    id: 'personne_morale',
    title: 'Personne Morale',
    description: 'Societe constituee (SARL, EURL, SPA, SNC...)',
    icon: <Building2 className="w-8 h-8" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
  }
]

const formeJuridiqueOptions = [
  { value: 'SARL', label: 'SARL - Societe a Responsabilite Limitee' },
  { value: 'EURL', label: 'EURL - Entreprise Unipersonnelle a Responsabilite Limitee' },
  { value: 'SPA', label: 'SPA - Societe Par Actions' },
  { value: 'SNC', label: 'SNC - Societe en Nom Collectif' },
  { value: 'SCS', label: 'SCS - Societe en Commandite Simple' }
]

const MyCompany = () => {
  const { user } = useAuthStore()
  const { updateUser } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const getInitialProfileType = (): ProfileType => {
    if (!user?.typeEntreprise) return null
    if (user.typeEntreprise === 'AUTO' || user.typeEntreprise === 'auto_entrepreneur') return 'auto_entrepreneur'
    if (user.typeEntreprise === 'STARTUP' || user.typeEntreprise === 'startup') return 'startup'
    if (user.typeEntreprise === 'PHYSIQUE' || user.typeEntreprise === 'personne_physique') return 'personne_physique'
    if (['SARL', 'EURL', 'SPA', 'SNC', 'SCS', 'personne_morale'].includes(user.typeEntreprise)) return 'personne_morale'
    return null
  }

  const [selectedType, setSelectedType] = useState<ProfileType>(getInitialProfileType())

  const [formData, setFormData] = useState({
    raisonSociale: user?.raisonSociale || '',
    formeJuridique: user?.formeJuridique || '',
    nif: user?.nif || '',
    nis: user?.nis || '',
    registreCommerce: user?.registreCommerce || '',
    articleImposition: user?.articleImposition || '',
    numeroAutoEntrepreneur: user?.numeroAutoEntrepreneur || '',
    activitePrincipale: user?.activitePrincipale || '',
    siegeSocial: user?.siegeSocial || '',
    capital: user?.capital || '',
    dateCreationEntreprise: user?.dateCreationEntreprise || '',
    wilaya: user?.wilaya || '',
    commune: user?.commune || '',
    projectName: user?.raisonSociale || '',
    projectDescription: user?.activitePrincipale || ''
  })

  const hasProfileInfo = user?.typeEntreprise || user?.raisonSociale

  useEffect(() => {
    if (user) {
      setFormData({
        raisonSociale: user.raisonSociale || '',
        formeJuridique: user.formeJuridique || '',
        nif: user.nif || '',
        nis: user.nis || '',
        registreCommerce: user.registreCommerce || '',
        articleImposition: user.articleImposition || '',
        numeroAutoEntrepreneur: user.numeroAutoEntrepreneur || '',
        activitePrincipale: user.activitePrincipale || '',
        siegeSocial: user.siegeSocial || '',
        capital: user.capital || '',
        dateCreationEntreprise: user.dateCreationEntreprise || '',
        wilaya: user.wilaya || '',
        commune: user.commune || '',
        projectName: user.raisonSociale || '',
        projectDescription: user.activitePrincipale || ''
      })
      setSelectedType(getInitialProfileType())
    }
  }, [user])

  const getTypeEntrepriseValue = (type: ProfileType): string => {
    switch (type) {
      case 'personne_physique': return 'PHYSIQUE'
      case 'auto_entrepreneur': return 'AUTO'
      case 'startup': return 'STARTUP'
      case 'personne_morale': return formData.formeJuridique || 'SARL'
      default: return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedType) return

    setSaving(true)
    try {
      const dataToSave: Record<string, any> = {
        typeEntreprise: getTypeEntrepriseValue(selectedType),
        wilaya: formData.wilaya,
        commune: formData.commune
      }

      if (selectedType === 'personne_physique') {
        dataToSave.siegeSocial = formData.siegeSocial
        dataToSave.activitePrincipale = formData.activitePrincipale
      }

      if (selectedType === 'auto_entrepreneur') {
        dataToSave.raisonSociale = formData.raisonSociale
        dataToSave.numeroAutoEntrepreneur = formData.numeroAutoEntrepreneur
        dataToSave.activitePrincipale = formData.activitePrincipale
        dataToSave.siegeSocial = formData.siegeSocial
        dataToSave.nif = formData.nif
        dataToSave.dateCreationEntreprise = formData.dateCreationEntreprise
      }

      if (selectedType === 'startup') {
        dataToSave.raisonSociale = formData.projectName
        dataToSave.activitePrincipale = formData.projectDescription
        dataToSave.siegeSocial = formData.siegeSocial
        dataToSave.dateCreationEntreprise = formData.dateCreationEntreprise
      }

      if (selectedType === 'personne_morale') {
        dataToSave.raisonSociale = formData.raisonSociale
        dataToSave.formeJuridique = formData.formeJuridique
        dataToSave.nif = formData.nif
        dataToSave.nis = formData.nis
        dataToSave.registreCommerce = formData.registreCommerce
        dataToSave.articleImposition = formData.articleImposition
        dataToSave.activitePrincipale = formData.activitePrincipale
        dataToSave.siegeSocial = formData.siegeSocial
        dataToSave.capital = formData.capital
        dataToSave.dateCreationEntreprise = formData.dateCreationEntreprise
      }

      await updateUser(user.id, dataToSave)
      await useAuthStore.getState().loadUser()
      setIsEditing(false)
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData({
        raisonSociale: user.raisonSociale || '',
        formeJuridique: user.formeJuridique || '',
        nif: user.nif || '',
        nis: user.nis || '',
        registreCommerce: user.registreCommerce || '',
        articleImposition: user.articleImposition || '',
        numeroAutoEntrepreneur: user.numeroAutoEntrepreneur || '',
        activitePrincipale: user.activitePrincipale || '',
        siegeSocial: user.siegeSocial || '',
        capital: user.capital || '',
        dateCreationEntreprise: user.dateCreationEntreprise || '',
        wilaya: user.wilaya || '',
        commune: user.commune || '',
        projectName: user.raisonSociale || '',
        projectDescription: user.activitePrincipale || ''
      })
      setSelectedType(getInitialProfileType())
    }
  }

  const startNewProfile = () => {
    setSelectedType(null)
    setIsEditing(true)
  }

  const selectedWilaya = wilayas.find(w => w.code === formData.wilaya)
  const communes = selectedWilaya?.communes || []

  const getCompletionPercentage = (): number => {
    if (!selectedType) return 0
    let filled = 0
    let total = 0

    if (selectedType === 'personne_physique') {
      total = 3
      if (formData.siegeSocial) filled++
      if (formData.wilaya) filled++
      if (formData.activitePrincipale) filled++
    }

    if (selectedType === 'auto_entrepreneur') {
      total = 5
      if (formData.raisonSociale) filled++
      if (formData.numeroAutoEntrepreneur) filled++
      if (formData.activitePrincipale) filled++
      if (formData.siegeSocial) filled++
      if (formData.wilaya) filled++
    }

    if (selectedType === 'startup') {
      total = 4
      if (formData.projectName) filled++
      if (formData.projectDescription) filled++
      if (formData.siegeSocial) filled++
      if (formData.wilaya) filled++
    }

    if (selectedType === 'personne_morale') {
      total = 8
      if (formData.raisonSociale) filled++
      if (formData.formeJuridique) filled++
      if (formData.nif) filled++
      if (formData.nis) filled++
      if (formData.registreCommerce) filled++
      if (formData.activitePrincipale) filled++
      if (formData.siegeSocial) filled++
      if (formData.wilaya) filled++
    }

    return Math.round((filled / total) * 100)
  }

  const canRequestDomiciliation = (): boolean => {
    if (!selectedType) return false
    if (selectedType === 'personne_physique') return !!formData.siegeSocial && !!formData.wilaya
    if (selectedType === 'auto_entrepreneur') return !!formData.raisonSociale && !!formData.numeroAutoEntrepreneur
    if (selectedType === 'startup') return !!formData.projectName && !!formData.projectDescription
    if (selectedType === 'personne_morale') return !!formData.raisonSociale && !!formData.nif && !!formData.formeJuridique
    return false
  }

  const getProfileTypeInfo = (type: ProfileType) => profileTypes.find(p => p.id === type)

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil Professionnel</h1>
          <p className="text-gray-600 mt-1">Gerez vos informations pour la domiciliation et les services</p>
        </div>
        {hasProfileInfo && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        )}
        {isEditing && selectedType && (
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!hasProfileInfo && !isEditing ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Configurez votre profil professionnel</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Ajoutez vos informations pour acceder aux services de domiciliation et faciliter vos demarches.
              </p>
              <Button size="lg" onClick={() => setIsEditing(true)}>
                <Sparkles className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </Card>
          </motion.div>
        ) : isEditing && !selectedType ? (
          <motion.div
            key="type-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quel est votre profil ?</h2>
              <p className="text-gray-600 mb-6">Selectionnez le type qui correspond a votre situation</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${type.bgColor}`}
                  >
                    <div className={`${type.color} mb-4`}>{type.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                    <div className="flex items-center mt-4 text-sm font-medium text-gray-700">
                      Selectionner <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {selectedType && (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getProfileTypeInfo(selectedType)?.bgColor.split(' ')[0]}`}>
                        <div className={getProfileTypeInfo(selectedType)?.color}>
                          {getProfileTypeInfo(selectedType)?.icon}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {getProfileTypeInfo(selectedType)?.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {getProfileTypeInfo(selectedType)?.description}
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedType(null)}>
                        Changer
                      </Button>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Profil complete</span>
                      <span className="font-medium text-gray-900">{getCompletionPercentage()}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getCompletionPercentage()}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {canRequestDomiciliation() && !isEditing && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 flex-1">
                        Votre profil est pret pour une demande de domiciliation
                      </p>
                      <Link to="/app/domiciliation">
                        <Button size="sm">
                          Demander <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedType === 'personne_physique' && (
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                          <p className="text-sm text-gray-500">Vos coordonnees pour la domiciliation</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{user.prenom} {user.nom}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <Input
                          label="Activite / Profession"
                          icon={<Briefcase className="w-5 h-5" />}
                          value={formData.activitePrincipale}
                          onChange={(e) => setFormData({ ...formData, activitePrincipale: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Ex: Consultant, Freelance, Photographe..."
                        />

                        <Input
                          label="Adresse actuelle"
                          icon={<MapPin className="w-5 h-5" />}
                          value={formData.siegeSocial}
                          onChange={(e) => setFormData({ ...formData, siegeSocial: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Votre adresse actuelle"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                            <select
                              value={formData.wilaya}
                              onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                            >
                              <option value="">Selectionnez une wilaya</option>
                              {wilayas.map((w) => (
                                <option key={w.code} value={w.code}>{w.code} - {w.nom}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                            <select
                              value={formData.commune}
                              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                              disabled={!isEditing || !formData.wilaya}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                            >
                              <option value="">Selectionnez une commune</option>
                              {communes.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {selectedType === 'auto_entrepreneur' && (
                    <>
                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Activite Auto-Entrepreneur</h3>
                            <p className="text-sm text-gray-500">Informations sur votre activite</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Input
                            label="Nom commercial / Denomination"
                            icon={<Building2 className="w-5 h-5" />}
                            value={formData.raisonSociale}
                            onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: Ahmed BENALI - Consultant IT"
                            required={isEditing}
                          />

                          <Input
                            label="Numero Auto-Entrepreneur (Carte AE)"
                            icon={<Hash className="w-5 h-5" />}
                            value={formData.numeroAutoEntrepreneur}
                            onChange={(e) => setFormData({ ...formData, numeroAutoEntrepreneur: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: AE-16-XXXXXX"
                            required={isEditing}
                          />

                          <Input
                            label="Activite principale"
                            icon={<Briefcase className="w-5 h-5" />}
                            value={formData.activitePrincipale}
                            onChange={(e) => setFormData({ ...formData, activitePrincipale: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: Services informatiques, Formation..."
                          />

                          <Input
                            label="Date de debut d'activite"
                            type="date"
                            icon={<Calendar className="w-5 h-5" />}
                            value={formData.dateCreationEntreprise}
                            onChange={(e) => setFormData({ ...formData, dateCreationEntreprise: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Hash className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Identifiants fiscaux</h3>
                            <p className="text-sm text-gray-500">Optionnel - si vous les avez</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Input
                            label="NIF (Numero d'Identification Fiscale)"
                            icon={<Hash className="w-5 h-5" />}
                            value={formData.nif}
                            onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Si disponible"
                          />
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Adresse</h3>
                            <p className="text-sm text-gray-500">Votre adresse actuelle</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                              <select
                                value={formData.wilaya}
                                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                              >
                                <option value="">Selectionnez une wilaya</option>
                                {wilayas.map((w) => (
                                  <option key={w.code} value={w.code}>{w.code} - {w.nom}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                              <select
                                value={formData.commune}
                                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                disabled={!isEditing || !formData.wilaya}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                              >
                                <option value="">Selectionnez une commune</option>
                                {communes.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <Input
                            label="Adresse complete"
                            icon={<MapPin className="w-5 h-5" />}
                            value={formData.siegeSocial}
                            onChange={(e) => setFormData({ ...formData, siegeSocial: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Numero, rue, quartier..."
                          />
                        </div>
                      </Card>
                    </>
                  )}

                  {selectedType === 'startup' && (
                    <>
                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Votre Projet</h3>
                            <p className="text-sm text-gray-500">Presentez votre startup ou projet innovant</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Input
                            label="Nom du projet / Startup"
                            icon={<Rocket className="w-5 h-5" />}
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: TechFlow, InnovaLab..."
                            required={isEditing}
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description du projet
                            </label>
                            <textarea
                              value={formData.projectDescription}
                              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Decrivez brievement votre projet, son secteur d'activite et son innovation..."
                              rows={4}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 resize-none"
                            />
                          </div>

                          <Input
                            label="Date de lancement / creation"
                            type="date"
                            icon={<Calendar className="w-5 h-5" />}
                            value={formData.dateCreationEntreprise}
                            onChange={(e) => setFormData({ ...formData, dateCreationEntreprise: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div className="text-sm text-amber-700">
                              <p className="font-medium mb-1">Startup en creation ?</p>
                              <p>Pas encore de documents officiels ? Aucun probleme ! Vous pouvez demarrer avec ces informations de base et completer votre dossier plus tard.</p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Localisation</h3>
                            <p className="text-sm text-gray-500">Ou etes-vous base actuellement ?</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                              <select
                                value={formData.wilaya}
                                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                              >
                                <option value="">Selectionnez une wilaya</option>
                                {wilayas.map((w) => (
                                  <option key={w.code} value={w.code}>{w.code} - {w.nom}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                              <select
                                value={formData.commune}
                                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                disabled={!isEditing || !formData.wilaya}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                              >
                                <option value="">Selectionnez une commune</option>
                                {communes.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <Input
                            label="Adresse"
                            icon={<MapPin className="w-5 h-5" />}
                            value={formData.siegeSocial}
                            onChange={(e) => setFormData({ ...formData, siegeSocial: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Adresse actuelle (optionnel)"
                          />
                        </div>
                      </Card>
                    </>
                  )}

                  {selectedType === 'personne_morale' && (
                    <>
                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Informations de la societe</h3>
                            <p className="text-sm text-gray-500">Donnees officielles de votre entreprise</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Input
                            label="Raison Sociale"
                            icon={<Building2 className="w-5 h-5" />}
                            value={formData.raisonSociale}
                            onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: SARL Innovation Tech"
                            required={isEditing}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Forme Juridique <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={formData.formeJuridique}
                                onChange={(e) => setFormData({ ...formData, formeJuridique: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                                required={isEditing}
                              >
                                <option value="">Selectionnez</option>
                                {formeJuridiqueOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>

                            <Input
                              label="Capital Social (DA)"
                              type="number"
                              value={formData.capital}
                              onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Ex: 1000000"
                            />
                          </div>

                          <Input
                            label="Activite Principale"
                            icon={<Briefcase className="w-5 h-5" />}
                            value={formData.activitePrincipale}
                            onChange={(e) => setFormData({ ...formData, activitePrincipale: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: Services informatiques"
                          />

                          <Input
                            label="Date de Creation"
                            type="date"
                            icon={<Calendar className="w-5 h-5" />}
                            value={formData.dateCreationEntreprise}
                            onChange={(e) => setFormData({ ...formData, dateCreationEntreprise: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Identifiants Officiels</h3>
                            <p className="text-sm text-gray-500">Numeros d'identification fiscaux et legaux</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="NIF (Numero d'Identification Fiscale)"
                              icon={<Hash className="w-5 h-5" />}
                              value={formData.nif}
                              onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                              disabled={!isEditing}
                              placeholder="099012345678901"
                              required={isEditing}
                            />

                            <Input
                              label="NIS (Numero d'Identification Statistique)"
                              icon={<Hash className="w-5 h-5" />}
                              value={formData.nis}
                              onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                              disabled={!isEditing}
                              placeholder="123456789012345"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Registre de Commerce"
                              icon={<FileText className="w-5 h-5" />}
                              value={formData.registreCommerce}
                              onChange={(e) => setFormData({ ...formData, registreCommerce: e.target.value })}
                              disabled={!isEditing}
                              placeholder="16/00-1234567A23"
                            />

                            <Input
                              label="Article d'Imposition"
                              icon={<FileText className="w-5 h-5" />}
                              value={formData.articleImposition}
                              onChange={(e) => setFormData({ ...formData, articleImposition: e.target.value })}
                              disabled={!isEditing}
                              placeholder="16123456789"
                            />
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Siege Social Actuel</h3>
                            <p className="text-sm text-gray-500">Adresse actuelle de votre societe</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                              <select
                                value={formData.wilaya}
                                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                              >
                                <option value="">Selectionnez une wilaya</option>
                                {wilayas.map((w) => (
                                  <option key={w.code} value={w.code}>{w.code} - {w.nom}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                              <select
                                value={formData.commune}
                                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                disabled={!isEditing || !formData.wilaya}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                              >
                                <option value="">Selectionnez une commune</option>
                                {communes.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <Input
                            label="Adresse complete du siege social"
                            icon={<MapPin className="w-5 h-5" />}
                            value={formData.siegeSocial}
                            onChange={(e) => setFormData({ ...formData, siegeSocial: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ex: 12 Rue Didouche Mourad, Alger"
                          />
                        </div>
                      </Card>
                    </>
                  )}

                  {!canRequestDomiciliation() && !isEditing && (
                    <Card className="p-6 bg-amber-50 border-2 border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900 mb-1">Profil incomplet</h4>
                          <p className="text-sm text-amber-700">
                            Completez les champs requis pour pouvoir faire une demande de domiciliation.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Completer mon profil
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyCompany
