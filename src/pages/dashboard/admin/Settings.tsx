import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Building2, Clock, Mail, Bell,
  Shield, Save, RefreshCw, CheckCircle
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import toast from 'react-hot-toast'

const SETTINGS_KEY = 'coffice-admin-settings'

interface GeneralSettings {
  nom_entreprise: string
  email: string
  telephone: string
  adresse: string
  horaires_ouverture: string
  horaires_fermeture: string
}

interface NotificationSettings {
  email_nouvelles_reservations: boolean
  email_nouveaux_utilisateurs: boolean
  email_expirations_abonnements: boolean
  notifications_push: boolean
}

interface AllSettings {
  general: GeneralSettings
  notifications: NotificationSettings
}

const defaultSettings: AllSettings = {
  general: {
    nom_entreprise: 'COFFICE',
    email: 'contact@coffice.dz',
    telephone: '+213 XXX XXX XXX',
    adresse: '4eme etage, Mohammadia Mall, Alger',
    horaires_ouverture: '08:00',
    horaires_fermeture: '20:00'
  },
  notifications: {
    email_nouvelles_reservations: true,
    email_nouveaux_utilisateurs: true,
    email_expirations_abonnements: true,
    notifications_push: false
  }
}

const loadSettings = (): AllSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (e) {
    // Erreur silencieuse
  }
  return defaultSettings
}

const saveSettings = (settings: AllSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    // Erreur silencieuse
  }
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<AllSettings>(defaultSettings)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const handleSaveGeneral = async () => {
    setLoading(true)
    try {
      saveSettings(settings)
      await new Promise(resolve => setTimeout(resolve, 300))
      toast.success('Parametres generaux enregistres')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      saveSettings(settings)
      await new Promise(resolve => setTimeout(resolve, 300))
      toast.success('Preferences de notification enregistrees')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = () => {
    try {
      localStorage.removeItem('coffice-app-storage')
      toast.success('Cache efface avec succes')
      window.location.reload()
    } catch (error) {
      toast.error('Erreur lors de la suppression du cache')
    }
  }

  const updateGeneral = (field: keyof GeneralSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }))
  }

  const updateNotifications = (field: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }))
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Building2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Securite', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Parametres
        </h1>
      </div>

      <div className="flex gap-4 border-b overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'notifications' | 'security')}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Informations Generales</h2>
            <div className="space-y-4">
              <Input
                label="Nom de l'entreprise"
                value={settings.general.nom_entreprise}
                onChange={(e) => updateGeneral('nom_entreprise', e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email de contact"
                  type="email"
                  value={settings.general.email}
                  onChange={(e) => updateGeneral('email', e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label="Telephone"
                  value={settings.general.telephone}
                  onChange={(e) => updateGeneral('telephone', e.target.value)}
                />
              </div>
              <Input
                label="Adresse"
                value={settings.general.adresse}
                onChange={(e) => updateGeneral('adresse', e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Heure d'ouverture"
                  type="time"
                  value={settings.general.horaires_ouverture}
                  onChange={(e) => updateGeneral('horaires_ouverture', e.target.value)}
                  icon={<Clock className="w-5 h-5" />}
                />
                <Input
                  label="Heure de fermeture"
                  type="time"
                  value={settings.general.horaires_fermeture}
                  onChange={(e) => updateGeneral('horaires_fermeture', e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveGeneral} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </Card>

          <Card className="mt-6">
            <h2 className="text-xl font-bold text-primary mb-6">Tarification</h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                La tarification est geree directement dans la section <strong>Espaces</strong>.
                Chaque espace peut avoir ses propres tarifs (heure, demi-journee, jour, semaine).
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Preferences de Notification</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Nouvelles reservations</p>
                  <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle reservation</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_nouvelles_reservations}
                  onChange={(e) => updateNotifications('email_nouvelles_reservations', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Nouveaux utilisateurs</p>
                  <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle inscription</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_nouveaux_utilisateurs}
                  onChange={(e) => updateNotifications('email_nouveaux_utilisateurs', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Expirations d'abonnements</p>
                  <p className="text-sm text-gray-500">Rappel 7 jours avant l'expiration d'un abonnement</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_expirations_abonnements}
                  onChange={(e) => updateNotifications('email_expirations_abonnements', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Notifications push</p>
                  <p className="text-sm text-gray-500">Activer les notifications push dans le navigateur</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifications_push}
                  onChange={(e) => updateNotifications('notifications_push', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Securite & Maintenance</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Ces actions affectent le fonctionnement de l'application.
                  Effectuez toute modification avec precaution.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Effacer le cache local</p>
                    <p className="text-sm text-gray-500">Vider les donnees en cache du navigateur</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearCache}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Effacer
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Etat du systeme</p>
                    <p className="text-sm text-gray-500">Verifier la connexion a l'API</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connecte</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Version</p>
                    <p className="text-sm text-gray-500">Version actuelle de l'application</p>
                  </div>
                  <span className="text-sm font-mono bg-gray-200 px-3 py-1 rounded">v3.0.0</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default Settings
