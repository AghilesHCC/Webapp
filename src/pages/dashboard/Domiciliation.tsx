import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  FileText,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Download,
  Eye,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Hash,
  Briefcase,
  Info
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Link } from 'react-router-dom'

const Domiciliation = () => {
  const { user } = useAuthStore()
  const { getUserDemandeDomiciliation, createDemandeDomiciliation, loadDemandesDomiciliation } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (user) {
      loadDemandesDomiciliation()
    }
  }, [user, loadDemandesDomiciliation])

  const demande = user ? getUserDemandeDomiciliation(user.id) : null

  const hasCompanyInfo = (() => {
    if (!user?.typeEntreprise) return false
    const type = user.typeEntreprise
    if (type === 'PHYSIQUE') return !!(user.siegeSocial && user.wilaya)
    if (type === 'AUTO') return !!(user.raisonSociale && user.numeroAutoEntrepreneur)
    if (type === 'STARTUP') return !!(user.raisonSociale && user.activitePrincipale)
    return !!(user.raisonSociale && user.nif && user.formeJuridique)
  })()

  const [formData, setFormData] = useState({
    raisonSociale: '',
    formeJuridique: '',
    nif: '',
    nis: '',
    registreCommerce: '',
    articleImposition: '',
    coordonneesFiscales: '',
    coordonneesAdministratives: '',
    representantLegal: { nom: '', prenom: '', fonction: '', telephone: '', email: '' },
    activitePrincipale: '',
    adresseActuelle: '',
    capital: 0,
    dateCreationEntreprise: ''
  })

  useEffect(() => {
    if (user && hasCompanyInfo) {
      const type = user.typeEntreprise
      const isPhysique = type === 'PHYSIQUE'
      const isStartup = type === 'STARTUP'
      const isAuto = type === 'AUTO'

      setFormData({
        raisonSociale: isPhysique ? `${user.prenom} ${user.nom}` : (user.raisonSociale || ''),
        formeJuridique: isPhysique ? 'Personne Physique' : (isStartup ? 'Startup' : (isAuto ? 'Auto-Entrepreneur' : (user.formeJuridique || ''))),
        nif: user.nif || '',
        nis: user.nis || '',
        registreCommerce: user.registreCommerce || '',
        articleImposition: user.articleImposition || '',
        coordonneesFiscales: '',
        coordonneesAdministratives: '',
        representantLegal: {
          nom: user.nom || '',
          prenom: user.prenom || '',
          fonction: isPhysique ? 'Titulaire' : (isAuto ? 'Auto-Entrepreneur' : (isStartup ? 'Fondateur' : 'Gerant')),
          telephone: user.telephone || '',
          email: user.email || ''
        },
        activitePrincipale: user.activitePrincipale || '',
        adresseActuelle: user.adresse || user.siegeSocial || '',
        capital: parseFloat(user.capital || '0'),
        dateCreationEntreprise: user.dateCreationEntreprise || ''
      })
    }
  }, [user, hasCompanyInfo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const result = await createDemandeDomiciliation({ userId: user.id, ...formData })
      if (result.success) {
        toast.success('Demande de domiciliation envoyée avec succès!')
        setShowModal(false)
        setCurrentStep(1)
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi de la demande')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          label: 'En attente de validation',
          description: 'Votre demande est en cours d\'examen par notre équipe.'
        }
      case 'validee':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Demande validée',
          description: 'Votre demande a été approuvée. Vous recevrez prochainement votre attestation.'
        }
      case 'rejetee':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Demande rejetée',
          description: 'Votre demande n\'a pas été acceptée. Veuillez consulter le commentaire ci-dessous.'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'Statut inconnu',
          description: ''
        }
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isPersonneMorale = !!(user?.typeEntreprise && !['PHYSIQUE', 'AUTO', 'STARTUP'].includes(user.typeEntreprise))
  const canProceedStep1 = formData.raisonSociale && formData.formeJuridique && (isPersonneMorale ? formData.nif : true)
  const canProceedStep2 = formData.representantLegal.nom && formData.representantLegal.prenom && formData.representantLegal.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Domiciliation d'Entreprise</h1>
        <p className="text-gray-600 mt-1">Domiciliez votre entreprise au Mohammadia Mall</p>
      </div>

      {demande ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Statut de la demande */}
          <Card className={`p-6 border-2 ${getStatusInfo(demande.statut).border}`}>
            <div className="flex items-start gap-4">
              {React.createElement(getStatusInfo(demande.statut).icon, {
                className: `w-12 h-12 ${getStatusInfo(demande.statut).color}`
              })}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {getStatusInfo(demande.statut).label}
                </h3>
                <p className="text-gray-600 mb-4">
                  {getStatusInfo(demande.statut).description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Demande créée le {format(new Date(demande.dateCreation), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
              <Badge variant={
                demande.statut === 'validee' ? 'success' :
                demande.statut === 'rejetee' ? 'danger' : 'warning'
              }>
                {demande.statut === 'en_attente' ? 'En attente' :
                 demande.statut === 'validee' ? 'Validée' : 'Rejetée'}
              </Badge>
            </div>
          </Card>

          {/* Détails de l'entreprise */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Informations de l'Entreprise</h2>
                <p className="text-sm text-gray-500">Détails de votre demande</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Raison Sociale</p>
                <p className="font-medium text-gray-900">{demande.raisonSociale}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Forme Juridique</p>
                <p className="font-medium text-gray-900">{demande.formeJuridique}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">NIF</p>
                <p className="font-medium text-gray-900">{demande.nif || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">NIS</p>
                <p className="font-medium text-gray-900">{demande.nis || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Registre de Commerce</p>
                <p className="font-medium text-gray-900">{demande.registreCommerce || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Domaine d'Activité</p>
                <p className="font-medium text-gray-900">{demande.activitePrincipale || 'Non renseigné'}</p>
              </div>
            </div>
          </Card>

          {/* Représentant légal */}
          {demande.representantLegal && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Représentant Légal</h2>
                  <p className="text-sm text-gray-500">Informations du représentant</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {demande.representantLegal.prenom} {demande.representantLegal.nom}
                  </span>
                  {demande.representantLegal.fonction && (
                    <span className="text-sm text-gray-500">- {demande.representantLegal.fonction}</span>
                  )}
                </div>
                {demande.representantLegal.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{demande.representantLegal.telephone}</span>
                  </div>
                )}
                {demande.representantLegal.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{demande.representantLegal.email}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Commentaire admin si rejetée */}
          {demande.statut === 'rejetee' && demande.commentaireAdmin && (
            <Card className="p-6 bg-red-50 border-2 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-2">Raison du rejet</h3>
                  <p className="text-sm text-red-700">{demande.commentaireAdmin}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Nouvelle demande si rejetée */}
          {demande.statut === 'rejetee' && (
            <Card className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Soumettre une nouvelle demande</h3>
              <p className="text-gray-600 mb-4">
                Vous pouvez corriger les informations et soumettre une nouvelle demande.
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle demande
              </Button>
            </Card>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!hasCompanyInfo ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Complétez d'abord vos informations d'entreprise
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Avant de faire une demande de domiciliation, vous devez renseigner les informations de votre entreprise dans la section "Mon Entreprise".
              </p>
              <Link to="/app/mon-entreprise">
                <Button size="lg">
                  <Building className="w-5 h-5 mr-2" />
                  Completer mes informations
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune demande de domiciliation</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Domiciliez votre entreprise au cœur d'Alger dans un espace professionnel et moderne.
              </p>
              <Button size="lg" onClick={() => setShowModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Faire une demande de domiciliation
              </Button>

              {/* Avantages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Adresse prestigieuse</h4>
                  <p className="text-sm text-gray-600">
                    Mohammadia Mall, 4ème étage, Bureau 1178, Alger
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Services inclus</h4>
                  <p className="text-sm text-gray-600">
                    Réception courrier, salle de réunion, assistance administrative
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Validation rapide</h4>
                  <p className="text-sm text-gray-600">
                    Traitement de votre demande sous 48h ouvrées
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Modal formulaire avec étapes */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setCurrentStep(1)
        }}
        title="Demande de Domiciliation"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= step
                      ? 'bg-accent text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-accent' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Étape 1: Informations entreprise */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-lg mb-4">Informations de l'Entreprise</h3>

              <Input
                label="Raison Sociale"
                icon={<Building className="w-5 h-5" />}
                value={formData.raisonSociale}
                onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                required
                placeholder="Ex: SARL Innovation Tech"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forme Juridique <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.formeJuridique}
                    onChange={(e) => setFormData({ ...formData, formeJuridique: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                    required
                    disabled={!!user?.typeEntreprise}
                  >
                    <option value="">Selectionnez</option>
                    <option value="Personne Physique">Personne Physique</option>
                    <option value="Auto-Entrepreneur">Auto-Entrepreneur</option>
                    <option value="Startup">Startup / Projet</option>
                    <option value="SARL">SARL</option>
                    <option value="EURL">EURL</option>
                    <option value="SPA">SPA</option>
                    <option value="SNC">SNC</option>
                  </select>
                </div>

                <Input
                  label="Domaine d'Activite"
                  icon={<Briefcase className="w-5 h-5" />}
                  value={formData.activitePrincipale}
                  onChange={(e) => setFormData({ ...formData, activitePrincipale: e.target.value })}
                  placeholder="Ex: Services informatiques"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={isPersonneMorale ? "NIF (requis)" : "NIF (optionnel)"}
                  icon={<Hash className="w-5 h-5" />}
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  required={isPersonneMorale}
                  placeholder={isPersonneMorale ? "099012345678901" : "Si disponible"}
                />

                <Input
                  label="NIS"
                  icon={<Hash className="w-5 h-5" />}
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="123456789012345"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Registre de Commerce"
                  icon={<FileText className="w-5 h-5" />}
                  value={formData.registreCommerce}
                  onChange={(e) => setFormData({ ...formData, registreCommerce: e.target.value })}
                  placeholder="16/00-1234567A23"
                />

                <Input
                  label="Article d'Imposition"
                  icon={<FileText className="w-5 h-5" />}
                  value={formData.articleImposition}
                  onChange={(e) => setFormData({ ...formData, articleImposition: e.target.value })}
                  placeholder="16123456789"
                />
              </div>
            </motion.div>
          )}

          {/* Étape 2: Représentant légal */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-lg mb-4">Représentant Légal</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nom"
                  icon={<User className="w-5 h-5" />}
                  value={formData.representantLegal.nom}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal, nom: e.target.value }
                  })}
                  required
                />

                <Input
                  label="Prénom"
                  icon={<User className="w-5 h-5" />}
                  value={formData.representantLegal.prenom}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal, prenom: e.target.value }
                  })}
                  required
                />
              </div>

              <Input
                label="Fonction"
                value={formData.representantLegal.fonction}
                onChange={(e) => setFormData({
                  ...formData,
                  representantLegal: { ...formData.representantLegal, fonction: e.target.value }
                })}
                placeholder="Ex: Gérant"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Téléphone"
                  icon={<Phone className="w-5 h-5" />}
                  value={formData.representantLegal.telephone}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal, telephone: e.target.value }
                  })}
                  placeholder="+213 XXX XX XX XX"
                />

                <Input
                  label="Email"
                  type="email"
                  icon={<Mail className="w-5 h-5" />}
                  value={formData.representantLegal.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal, email: e.target.value }
                  })}
                  required
                  placeholder="email@exemple.com"
                />
              </div>
            </motion.div>
          )}

          {/* Étape 3: Informations complémentaires */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-lg mb-4">Informations Complémentaires</h3>

              <Input
                label="Adresse du Siège Social Actuel"
                icon={<MapPin className="w-5 h-5" />}
                value={formData.adresseActuelle}
                onChange={(e) => setFormData({ ...formData, adresseActuelle: e.target.value })}
                placeholder="12 Rue Didouche Mourad, Alger"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Capital Social (DA)"
                  type="number"
                  value={formData.capital}
                  onChange={(e) => setFormData({ ...formData, capital: parseFloat(e.target.value) })}
                  placeholder="100000"
                />

                <Input
                  label="Date de Création"
                  type="date"
                  icon={<Calendar className="w-5 h-5" />}
                  value={formData.dateCreationEntreprise}
                  onChange={(e) => setFormData({ ...formData, dateCreationEntreprise: e.target.value })}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Avant de soumettre:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Vérifiez que toutes les informations sont exactes</li>
                      <li>Assurez-vous d'avoir vos documents officiels à disposition</li>
                      <li>Un traitement sous 48h ouvrées vous sera proposé</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Boutons navigation */}
          <div className="flex justify-between gap-3 pt-4">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Précédent
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                className="ml-auto"
              >
                Suivant
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="ml-auto">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer la demande
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Domiciliation
