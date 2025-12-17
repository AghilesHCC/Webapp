import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Edit2, Save, X, CheckCircle, AlertCircle, ArrowRight, Sparkles, User, Briefcase, Rocket
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { profileTypes, getProfileTypeFromUser, getTypeEntrepriseValue, type ProfileType } from './company/constants'
import { getDefaultFormData, type CompanyFormData } from './company/types'
import ProfileTypeSelector from './company/ProfileTypeSelector'
import { PersonnePhysiqueForm, AutoEntrepreneurForm, StartupForm, PersonneMoraleForm } from './company/forms'

const iconComponents = { User, Briefcase, Rocket, Building2 }

const MyCompany = () => {
  const { user } = useAuthStore()
  const { updateUser } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedType, setSelectedType] = useState<ProfileType>(() => getProfileTypeFromUser(user?.typeEntreprise))
  const [formData, setFormData] = useState<CompanyFormData>(() => getDefaultFormData(user))

  const hasProfileInfo = user?.typeEntreprise || user?.raisonSociale

  useEffect(() => {
    if (user) {
      setFormData(getDefaultFormData(user))
      setSelectedType(getProfileTypeFromUser(user.typeEntreprise))
    }
  }, [user])

  const handleFormChange = (data: Partial<CompanyFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedType) return

    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {
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
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData(getDefaultFormData(user))
      setSelectedType(getProfileTypeFromUser(user.typeEntreprise))
    }
  }

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

  const renderProfileHeader = () => {
    if (!selectedType) return null
    const info = getProfileTypeInfo(selectedType)
    if (!info) return null
    const IconComponent = iconComponents[info.iconName]

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${info.bgColor.split(' ')[0]}`}>
              <div className={info.color}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{info.title}</h2>
              <p className="text-sm text-gray-500">{info.description}</p>
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
    )
  }

  const renderForm = () => {
    if (!selectedType) return null

    const props = {
      formData,
      onChange: handleFormChange,
      disabled: !isEditing
    }

    switch (selectedType) {
      case 'personne_physique':
        return <PersonnePhysiqueForm {...props} userName={`${user.prenom} ${user.nom}`} userEmail={user.email} />
      case 'auto_entrepreneur':
        return <AutoEntrepreneurForm {...props} />
      case 'startup':
        return <StartupForm {...props} />
      case 'personne_morale':
        return <PersonneMoraleForm {...props} />
      default:
        return null
    }
  }

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
              <ProfileTypeSelector onSelect={setSelectedType} />
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
            {renderProfileHeader()}
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderForm()}
              {!canRequestDomiciliation() && !isEditing && (
                <Card className="p-6 bg-amber-50 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Profil incomplet</h4>
                      <p className="text-sm text-amber-700">
                        Completez les champs requis pour pouvoir faire une demande de domiciliation.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Completer mon profil
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyCompany
