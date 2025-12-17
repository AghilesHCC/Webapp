import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Edit2, Save, X, Share2, Copy, Gift } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { apiClient } from '../../lib/api-client'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const Profile = () => {
  const { user, setUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    entreprise: user?.entreprise || '',
    profession: user?.profession || '',
    adresse: user?.adresse || '',
    bio: user?.bio || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        entreprise: user.entreprise || '',
        profession: user.profession || '',
        adresse: user.adresse || '',
        bio: user.bio || ''
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const response = await apiClient.updateUser(user.id, formData)
      if (response.success) {
        const meResponse = await apiClient.me()
        if (meResponse.success && meResponse.data) {
          setUser(meResponse.data as any)
        }
        toast.success('Profil mis à jour avec succès')
        setIsEditing(false)
      } else {
        toast.error(response.error || 'Erreur lors de la mise à jour')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCode = async () => {
    if (!user) return

    setGeneratingCode(true)
    try {
      const response = await apiClient.request('/parrainages/generate.php', { method: 'POST' })
      if (response.success && response.data) {
        const meResponse = await apiClient.me()
        if (meResponse.success && meResponse.data) {
          setUser(meResponse.data as any)
        }
        toast.success('Code de parrainage généré avec succès!')
      } else {
        toast.error(response.error || 'Erreur lors de la génération du code')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la génération du code')
    } finally {
      setGeneratingCode(false)
    }
  }

  const copyCodeToClipboard = () => {
    if (user?.parrainage?.codeParrain) {
      navigator.clipboard.writeText(user.parrainage.codeParrain)
      toast.success('Code copié dans le presse-papiers!')
    }
  }

  const shareCode = async () => {
    if (user?.parrainage?.codeParrain) {
      const shareText = `Rejoignez Coffice avec mon code de parrainage: ${user.parrainage.codeParrain}`
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Code de parrainage Coffice',
            text: shareText,
          })
        } catch (error) {
          copyCodeToClipboard()
        }
      } else {
        copyCodeToClipboard()
      }
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false)
              setFormData({
                nom: user.nom || '',
                prenom: user.prenom || '',
                email: user.email || '',
                telephone: user.telephone || '',
                entreprise: user.entreprise || '',
                profession: user.profession || '',
                adresse: user.adresse || '',
                bio: user.bio || ''
              })
            }}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Informations personnelles</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  disabled={!isEditing}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  disabled={!isEditing}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  icon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  disabled={!isEditing}
                  icon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                  disabled={!isEditing}
                  icon={<Building className="w-4 h-4" />}
                />
                <Input
                  label="Profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <Input
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                disabled={!isEditing}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Parrainage</h3>
                <p className="text-sm text-gray-500">Partagez et gagnez</p>
              </div>
            </div>

            {user.parrainage?.codeParrain ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg border-2 border-orange-200">
                  <p className="text-sm text-gray-600 mb-2">Votre code de parrainage</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900 tracking-wider">
                      {user.parrainage.codeParrain}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyCodeToClipboard}
                      className="ml-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={shareCode}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager mon code
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-accent">{user.parrainage.parraines || 0}</p>
                    <p className="text-xs text-gray-600">Parrainés</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(user.parrainage.recompensesTotales || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">DA gagnés</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-900 mb-1">Comment ça marche?</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Partagez votre code avec vos contacts</li>
                    <li>Ils s'inscrivent avec votre code</li>
                    <li>Vous recevez des récompenses</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4 text-sm">
                  Générez votre code de parrainage unique et commencez à gagner des récompenses
                </p>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generatingCode}
                  className="w-full"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {generatingCode ? 'Génération...' : 'Générer mon code'}
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informations du compte</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Rôle</p>
                <Badge variant={user.role === 'admin' ? 'success' : 'default'}>
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <Badge variant={user.statut === 'actif' ? 'success' : 'warning'}>
                  {user.statut}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
