import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  Lock,
  Mail,
  Smartphone,
  Save,
  RefreshCw,
  Trash2,
  LogOut,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

const SETTINGS_KEY = 'coffice-user-settings'

interface UserSettings {
  notifications: {
    email_reservations: boolean
    email_promotions: boolean
    email_rappels: boolean
    push_enabled: boolean
  }
  privacy: {
    profile_visible: boolean
    show_entreprise: boolean
  }
}

const defaultSettings: UserSettings = {
  notifications: {
    email_reservations: true,
    email_promotions: false,
    email_rappels: true,
    push_enabled: false
  },
  privacy: {
    profile_visible: true,
    show_entreprise: true
  }
}

const loadSettings = (): UserSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (e) {}
  return defaultSettings
}

const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {}
}

const Settings = () => {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'security'>('notifications')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

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

  const handleSavePrivacy = async () => {
    setLoading(true)
    try {
      saveSettings(settings)
      await new Promise(resolve => setTimeout(resolve, 300))
      toast.success('Parametres de confidentialite enregistres')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwords.new.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Mot de passe modifie avec succes')
      setShowPasswordModal(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Etes-vous sur de vouloir vous deconnecter ?')) {
      logout()
    }
  }

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const updatePrivacy = (key: keyof UserSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }))
  }

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Confidentialite', icon: Eye },
    { id: 'security', name: 'Securite', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-accent" />
        <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
      </div>

      <div className="flex gap-4 border-b overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences de Notification</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Confirmations de reservation</p>
                    <p className="text-sm text-gray-500">Recevoir un email a chaque reservation</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_reservations}
                  onChange={(e) => updateNotification('email_reservations', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Rappels</p>
                    <p className="text-sm text-gray-500">Recevoir des rappels avant vos reservations</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_rappels}
                  onChange={(e) => updateNotification('email_rappels', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Promotions et actualites</p>
                    <p className="text-sm text-gray-500">Recevoir les offres speciales et nouveautes</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_promotions}
                  onChange={(e) => updateNotification('email_promotions', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications push</p>
                    <p className="text-sm text-gray-500">Recevoir des notifications dans le navigateur</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.push_enabled}
                  onChange={(e) => updateNotification('push_enabled', e.target.checked)}
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

      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Confidentialite</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Profil visible</p>
                    <p className="text-sm text-gray-500">Permettre aux autres membres de voir votre profil</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.profile_visible}
                  onChange={(e) => updatePrivacy('profile_visible', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Afficher entreprise</p>
                    <p className="text-sm text-gray-500">Montrer le nom de votre entreprise sur votre profil</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.show_entreprise}
                  onChange={(e) => updatePrivacy('show_entreprise', e.target.checked)}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSavePrivacy} disabled={loading}>
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
          className="space-y-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Securite du Compte</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Mot de passe</p>
                    <p className="text-sm text-gray-500">Modifier votre mot de passe</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Verifie</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Statut du compte</p>
                    <p className="text-sm text-gray-500">Votre compte est actif</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Actif</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Session</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Deconnexion</p>
                    <p className="text-sm text-gray-500">Se deconnecter de cet appareil</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Se deconnecter
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zone de danger
            </h2>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-900">Supprimer le compte</p>
                    <p className="text-sm text-red-600">Cette action est irreversible</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => toast.error('Pour supprimer votre compte, contactez-nous a desk@coffice.dz')}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Modifier le mot de passe</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Mot de passe actuel"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                required
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Modification...' : 'Modifier'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswords({ current: '', new: '', confirm: '' })
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Settings
