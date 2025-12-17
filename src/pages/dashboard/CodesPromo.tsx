import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, Copy, CheckCircle, Gift } from 'lucide-react'
import { apiClient } from '../../lib/api-client'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface PromoCode {
  id: string
  code: string
  type: 'pourcentage' | 'montant'
  valeur: number
  description?: string
  date_fin: string
  montant_min?: number
  utilisations_max?: number
  utilisations_actuelles?: number
  types_application?: string | string[]
}

const CodesPromo = () => {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    loadCodes()
  }, [])

  const loadCodes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getPublicCodesPromo()
      if (response.success && response.data) {
        const responseData = response.data as PromoCode[] | { data: PromoCode[] }
        const codesData = Array.isArray(responseData) ? responseData : (responseData.data || [])
        setCodes(codesData)
      } else {
        setCodes([])
      }
    } catch {
      toast.error('Erreur lors du chargement')
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) {
      toast.error('Veuillez entrer un code')
      return
    }

    setVerifying(true)
    try {
      const result = await apiClient.validateCodePromo(verifyCode.toUpperCase(), 0, 'reservation')
      if (result.valid) {
        toast.success(`Code valide ! Réduction de ${result.reduction} DA`)
      } else {
        toast.error(result.error || 'Code invalide ou expiré')
      }
      setVerifyCode('')
    } catch {
      toast.error('Code invalide ou expiré')
    } finally {
      setVerifying(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copié !')
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
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">
          Codes Promo
        </h1>
        <p className="text-gray-600 mt-2">
          Profitez de nos offres spéciales et réductions
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-primary mb-4">Vérifier un Code</h2>
        <div className="flex gap-3">
          <Input
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
            placeholder="Entrez votre code promo"
            icon={<Tag className="w-5 h-5" />}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
          />
          <Button onClick={handleVerifyCode} disabled={verifying || !verifyCode.trim()}>
            {verifying ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Entrez un code promo pour vérifier sa validité et voir la réduction associée
        </p>
      </Card>

      {codes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Codes Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map((code) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-accent" />
                        <code className="text-lg font-bold text-primary">{code.code}</code>
                      </div>
                      <button
                        onClick={() => copyCode(code.code)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copier le code"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {code.description && (
                      <p className="text-sm text-gray-600">{code.description}</p>
                    )}

                    <div className="p-4 bg-accent/5 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Réduction</p>
                      <p className="text-2xl font-bold text-accent">
                        {code.type === 'pourcentage' ? (
                          <span>-{code.valeur}%</span>
                        ) : (
                          <span>-{code.valeur} DA</span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valide jusqu'au:</span>
                        <span className="font-medium">
                          {format(new Date(code.date_fin), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {code.montant_min > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Montant min:</span>
                          <span className="font-medium">{code.montant_min} DA</span>
                        </div>
                      )}
                      {code.utilisations_max && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Utilisations restantes:</span>
                          <span className="font-medium">
                            {code.utilisations_max - (code.utilisations_actuelles || 0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Applicable à:</p>
                      <Badge variant="default" className="text-xs">
                        {code.types_application ?
                          (typeof code.types_application === 'string' ?
                            (JSON.parse(code.types_application) as string[]).join(', ') :
                            code.types_application.join(', ')
                          ) : 'Tous les services'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {codes.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun code promo disponible
            </h3>
            <p className="text-gray-500">
              Revenez bientôt pour découvrir nos nouvelles offres !
            </p>
          </div>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-accent/5 to-teal/5">
        <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" />
          Comment utiliser un code promo ?
        </h2>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-bold text-accent">1.</span>
            <span>Copiez le code promo de votre choix</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-accent">2.</span>
            <span>Lors de votre réservation ou souscription, entrez le code dans le champ prévu</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-accent">3.</span>
            <span>La réduction sera automatiquement appliquée à votre commande</span>
          </li>
        </ol>
      </Card>
    </div>
  )
}

export default CodesPromo
