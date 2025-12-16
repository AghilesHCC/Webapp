import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Users,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Info,
  Tag,
  X,
  CheckCircle2
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import DateTimePicker from '../ui/DateTimePicker'
import { useAppStore } from '../../store/store'
import { useAuthStore } from '../../store/authStore'
import { ReservationForm as ReservationFormType, Espace } from '../../types'
import { format, addHours, isAfter, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'
import { apiClient } from '../../lib/api-client'

interface ReservationFormProps {
  isOpen: boolean
  onClose: () => void
  selectedEspace?: Espace
}

const ReservationForm: React.FC<ReservationFormProps> = ({ isOpen, onClose, selectedEspace }) => {
  const { user } = useAuthStore()
  const { espaces, createReservation, calculateReservationAmount } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedAmount, setEstimatedAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [validatedPromoCode, setValidatedPromoCode] = useState<{codePromoId: string, reduction: number} | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [codePromoValid, setCodePromoValid] = useState<boolean | null>(null)
  const [selectedSpace, setSelectedSpace] = useState<Espace | undefined>(selectedEspace)
  const [duration, setDuration] = useState<number>(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    trigger
  } = useForm<ReservationFormType>()

  const watchedFields = watch()

  useEffect(() => {
    if (selectedEspace) {
      setValue('espaceId', selectedEspace.id)
      setSelectedSpace(selectedEspace)
    }
  }, [selectedEspace, setValue])

  useEffect(() => {
    if (watchedFields.espaceId) {
      const space = espaces.find(e => e.id === watchedFields.espaceId)
      setSelectedSpace(space)
    }
  }, [watchedFields.espaceId, espaces])

  useEffect(() => {
    if (watchedFields.espaceId && watchedFields.dateDebut && watchedFields.dateFin) {
      try {
        const dateDebut = new Date(watchedFields.dateDebut)
        const dateFin = new Date(watchedFields.dateFin)

        if (isAfter(dateFin, dateDebut)) {
          const hours = (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60)
          setDuration(hours)

          const amount = calculateReservationAmount(
            watchedFields.espaceId,
            dateDebut,
            dateFin,
            watchedFields.codePromo
          )
          setEstimatedAmount(amount)
        }
      } catch (error) {
        // Erreur silencieuse
      }
    }
  }, [watchedFields.espaceId, watchedFields.dateDebut, watchedFields.dateFin, watchedFields.codePromo, calculateReservationAmount])

  const validatePromoCode = async () => {
    if (!watchedFields.codePromo || !estimatedAmount || !user) return

    setIsValidatingCode(true)
    setCodePromoValid(null)
    setDiscount(0)
    setValidatedPromoCode(null)

    try {
      const result = await apiClient.validateCodePromo(
        watchedFields.codePromo,
        estimatedAmount,
        'reservation'
      )

      if (result.valid && result.codePromoId) {
        setCodePromoValid(true)
        setDiscount(result.reduction)
        setValidatedPromoCode({
          codePromoId: result.codePromoId,
          reduction: result.reduction
        })
        toast.success(`Code promo appliqué! -${result.reduction.toLocaleString()} DA`)
      } else {
        setCodePromoValid(false)
        setDiscount(0)
        setValidatedPromoCode(null)
        toast.error(result.error || 'Code promo invalide')
      }
    } catch (error) {
      setCodePromoValid(false)
      setDiscount(0)
      setValidatedPromoCode(null)
      toast.error('Erreur lors de la validation du code')
    } finally {
      setIsValidatingCode(false)
    }
  }

  const checkAvailability = async (espaceId: string, dateDebut: Date, dateFin: Date): Promise<boolean> => {
    try {
      const response = await apiClient.getReservations()
      if (!response.success || !response.data) {
        return true
      }

      const reservations = response.data as any[]
      const conflicts = reservations.filter(r => {
        if (r.espace_id !== espaceId) return false
        if (!['confirmee', 'en_attente', 'en_cours'].includes(r.statut)) return false

        const resDebut = new Date(r.date_debut)
        const resFin = new Date(r.date_fin)

        return !(dateFin <= resDebut || dateDebut >= resFin)
      })

      return conflicts.length === 0
    } catch (error) {
      return true
    }
  }

  const onSubmit = async (data: ReservationFormType) => {
    if (!user) {
      toast.error('Vous devez être connecté pour réserver')
      return
    }

    // Validation finale avant envoi
    if (!data.espaceId) {
      toast.error('Veuillez sélectionner un espace')
      return
    }

    if (!data.dateDebut || !data.dateFin) {
      toast.error('Veuillez sélectionner les dates')
      return
    }

    const dateDebut = new Date(data.dateDebut)
    const dateFin = new Date(data.dateFin)

    if (!isAfter(dateFin, dateDebut)) {
      toast.error('La date de fin doit être après la date de début')
      return
    }

    const now = new Date()
    if (isBefore(dateDebut, now)) {
      toast.error('La date de début doit être dans le futur')
      return
    }

    const participants = Number(data.participants) || 1
    if (selectedSpace && participants > selectedSpace.capacite) {
      toast.error(`Capacité maximale: ${selectedSpace.capacite} personnes`)
      return
    }

    if (!selectedSpace?.disponible) {
      toast.error('Cet espace n\'est pas disponible')
      return
    }

    const isAvailable = await checkAvailability(data.espaceId, dateDebut, dateFin)
    if (!isAvailable) {
      toast.error('Cet espace n\'est pas disponible pour ces dates. Veuillez choisir d\'autres créneaux horaires.')
      return
    }

    try {
      const result = await createReservation({
        userId: user.id,
        espaceId: data.espaceId,
        dateDebut: dateDebut,
        dateFin: dateFin,
        montantTotal: estimatedAmount - discount,
        notes: data.notes,
        codePromo: data.codePromo,
        participants: participants,
        reduction: discount
      })

      if (result?.success === false) {
        const errorMsg = result.error || 'Erreur lors de la création'
        toast.error(errorMsg)
        return
      }

      if (!result || !result.id) {
        toast.error('Erreur: réponse invalide du serveur')
        return
      }

      toast.success('Réservation créée avec succès!')
      handleClose()
    } catch (error: any) {
      const errorMsg = error?.message || error?.error || 'Erreur lors de la création de la réservation'
      toast.error(errorMsg)
    }
  }

  const handleClose = () => {
    reset()
    setCurrentStep(1)
    setEstimatedAmount(0)
    setDiscount(0)
    setCodePromoValid(null)
    setValidatedPromoCode(null)
    setSelectedSpace(undefined)
    setDuration(0)
    onClose()
  }

  const nextStep = async () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = await trigger('espaceId')
    } else if (currentStep === 2) {
      isValid = await trigger(['dateDebut', 'dateFin'])

      if (isValid && watchedFields.dateDebut && watchedFields.dateFin) {
        const dateDebut = new Date(watchedFields.dateDebut)
        const dateFin = new Date(watchedFields.dateFin)

        if (!isAfter(dateFin, dateDebut)) {
          toast.error('La date de fin doit être après la date de début')
          return
        }

        const now = new Date()
        if (isBefore(dateDebut, now)) {
          toast.error('La date de début doit être dans le futur')
          return
        }

        const diffHours = (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60)
        if (diffHours < 1) {
          toast.error('La réservation doit être d\'au moins 1 heure')
          return
        }

        if (diffHours > 24 * 7) {
          toast.error('La réservation ne peut pas dépasser 7 jours')
          return
        }

        const participants = Number(watchedFields.participants) || 1
        if (selectedSpace && participants > selectedSpace.capacite) {
          toast.error(`Capacité maximale: ${selectedSpace.capacite} personnes`)
          return
        }
      }
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { number: 1, title: 'Espace', icon: MapPin },
    { number: 2, title: 'Date & Heure', icon: Calendar },
    { number: 3, title: 'Confirmation', icon: CheckCircle2 }
  ]

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    return format(now, "yyyy-MM-dd'T'HH:mm")
  }

  const getMinEndDateTime = () => {
    if (watchedFields.dateDebut) {
      const start = new Date(watchedFields.dateDebut)
      start.setHours(start.getHours() + 1)
      return format(start, "yyyy-MM-dd'T'HH:mm")
    }
    return getMinDateTime()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouvelle Réservation" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Indicateur d'étapes */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-accent text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      React.createElement(step.icon, { className: 'w-6 h-6' })
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium mt-2 ${
                      currentStep >= step.number ? 'text-accent' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 -mt-6 rounded transition-all duration-300 ${
                      currentStep > step.number ? 'bg-accent' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Étape 1: Sélection de l'espace */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Choisissez votre espace</h3>
                <p className="text-sm text-gray-600">Sélectionnez l'espace qui correspond à vos besoins</p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {espaces.map((espace) => (
                  <motion.div
                    key={espace.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        watchedFields.espaceId === espace.id
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-accent/50'
                      }`}
                      onClick={() => setValue('espaceId', espace.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            watchedFields.espaceId === espace.id
                              ? 'bg-accent text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <MapPin className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900">{espace.nom}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{espace.description}</p>
                            </div>
                            {watchedFields.espaceId === espace.id && (
                              <Check className="w-6 h-6 text-accent flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{espace.capacite} pers.</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              <span className="font-semibold text-accent">
                                {espace.prixHeure.toLocaleString()} DA/h
                              </span>
                            </div>
                          </div>
                          {espace.equipements && espace.equipements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {espace.equipements.slice(0, 3).map((equip, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                >
                                  {equip}
                                </span>
                              ))}
                              {espace.equipements.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  +{espace.equipements.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {errors.espaceId && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.espaceId.message}
                </p>
              )}
            </motion.div>
          )}

          {/* Étape 2: Date et heure */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Choisissez vos dates</h3>
                <p className="text-sm text-gray-600">Sélectionnez la période de votre réservation</p>
              </div>

              {selectedSpace && (
                <Card className="p-4 bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedSpace.nom}</p>
                      <p className="text-sm text-gray-600">
                        {selectedSpace.prixHeure.toLocaleString()} DA/heure
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <DateTimePicker
                selectedStart={watchedFields.dateDebut ? new Date(watchedFields.dateDebut) : null}
                selectedEnd={watchedFields.dateFin ? new Date(watchedFields.dateFin) : null}
                onDateChange={(start, end) => {
                  if (start) {
                    setValue('dateDebut', start.toISOString())
                  } else {
                    setValue('dateDebut', '')
                  }
                  if (end) {
                    setValue('dateFin', end.toISOString())
                  } else {
                    setValue('dateFin', '')
                  }
                }}
              />

              {duration > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900 mb-1">Durée de la réservation</p>
                        <p className="text-sm text-blue-700">
                          {duration < 1
                            ? `${Math.round(duration * 60)} minutes`
                            : `${duration.toFixed(1)} heure${duration > 1 ? 's' : ''}`}
                        </p>
                        {duration >= 4 && (
                          <p className="text-xs text-blue-600 mt-1">
                            🎉 Réduction automatique appliquée pour réservation longue durée!
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              <div>
                <Input
                  label="Nombre de participants"
                  type="number"
                  icon={<Users className="w-5 h-5" />}
                  min={1}
                  max={selectedSpace?.capacite || 10}
                  defaultValue={1}
                  {...register('participants', {
                    required: 'Le nombre de participants est requis',
                    min: { value: 1, message: 'Minimum 1 participant' },
                    max: { value: selectedSpace?.capacite || 100, message: `Maximum ${selectedSpace?.capacite || 100} participants` },
                    valueAsNumber: true
                  })}
                  placeholder={`Max ${selectedSpace?.capacite || 10} personnes`}
                  error={errors.participants?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes ou demandes spéciales (optionnel)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
                  placeholder="Équipements spéciaux, configuration de la salle, besoins particuliers..."
                />
              </div>
            </motion.div>
          )}

          {/* Étape 3: Confirmation */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Vérifiez votre réservation</h3>
                <p className="text-sm text-gray-600">Confirmez les détails avant de finaliser</p>
              </div>

              {/* Résumé de la réservation */}
              <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-accent/20">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{selectedSpace?.nom}</h4>
                      <p className="text-sm text-gray-600">{selectedSpace?.description}</p>
                    </div>
                  </div>

                  {watchedFields.dateDebut && watchedFields.dateFin && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium text-gray-900">Date de début</p>
                          <p className="text-gray-600">
                            {format(new Date(watchedFields.dateDebut), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium text-gray-900">Date de fin</p>
                          <p className="text-gray-600">
                            {format(new Date(watchedFields.dateFin), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium text-gray-900">Participants</p>
                          <p className="text-gray-600">
                            {watchedFields.participants || 1} personne{(watchedFields.participants || 1) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Code promo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code promo (optionnel)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      icon={<Tag className="w-5 h-5" />}
                      placeholder="Entrez votre code promo"
                      {...register('codePromo')}
                    />
                    {codePromoValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {codePromoValid ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validatePromoCode}
                    disabled={!watchedFields.codePromo || isValidatingCode}
                  >
                    {isValidatingCode ? 'Vérification...' : 'Appliquer'}
                  </Button>
                </div>
              </div>

              {/* Calcul du montant */}
              {estimatedAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="font-medium text-gray-900">
                          {(estimatedAmount + discount).toLocaleString()} DA
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            Réduction
                          </span>
                          <span className="font-medium text-green-600">-{discount.toLocaleString()} DA</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-bold text-accent">
                            {estimatedAmount.toLocaleString()} DA
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {watchedFields.notes && (
                <Card className="p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
                  <p className="text-sm text-gray-600">{watchedFields.notes}</p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          )}
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep} className={currentStep === 1 ? 'w-full' : 'flex-1'}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Confirmer la réservation
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default ReservationForm
