import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, MapPin, Users, Check, ChevronRight, ChevronLeft,
  Info, Tag, X, AlertTriangle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import DateTimePicker from '../ui/DateTimePicker'
import SeatAvailability from '../SeatAvailability'
import { StepIndicator, SpaceSelector, PricingSummary } from './reservation'
import { useAppStore } from '../../store/store'
import { useAuthStore } from '../../store/authStore'
import type { ReservationForm as ReservationFormType, Espace } from '../../types'
import { format, isAfter, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'
import { apiClient } from '../../lib/api-client'

interface ReservationFormProps {
  isOpen: boolean
  onClose: () => void
  selectedEspace?: Espace
}

const ReservationForm = memo(({ isOpen, onClose, selectedEspace }: ReservationFormProps) => {
  const { user } = useAuthStore()
  const { espaces, createReservation, calculateReservationAmount } = useAppStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedAmount, setEstimatedAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [codePromoValid, setCodePromoValid] = useState<boolean | null>(null)
  const [selectedSpace, setSelectedSpace] = useState<Espace | undefined>(selectedEspace)
  const [duration, setDuration] = useState(0)
  const [availableSeats, setAvailableSeats] = useState<number | null>(null)
  const [totalSeats, setTotalSeats] = useState<number | null>(null)

  const isCoworkingSpace = selectedSpace?.type === 'open_space'

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset, trigger } = useForm<ReservationFormType>()
  const watchedFields = watch()

  useEffect(() => {
    if (selectedEspace) {
      setValue('espaceId', selectedEspace.id)
      setSelectedSpace(selectedEspace)
    }
  }, [selectedEspace, setValue])

  useEffect(() => {
    if (watchedFields.espaceId) {
      setSelectedSpace(espaces.find(e => e.id === watchedFields.espaceId))
    }
  }, [watchedFields.espaceId, espaces])

  useEffect(() => {
    if (watchedFields.espaceId && watchedFields.dateDebut && watchedFields.dateFin) {
      try {
        const dateDebut = new Date(watchedFields.dateDebut)
        const dateFin = new Date(watchedFields.dateFin)
        if (isAfter(dateFin, dateDebut)) {
          setDuration((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60))
          setEstimatedAmount(calculateReservationAmount(watchedFields.espaceId, dateDebut, dateFin, watchedFields.codePromo))
        }
      } catch { /* ignore */ }
    }
  }, [watchedFields.espaceId, watchedFields.dateDebut, watchedFields.dateFin, watchedFields.codePromo, calculateReservationAmount])

  const handleAvailabilityChange = useCallback((available: number, total: number) => {
    setAvailableSeats(available)
    setTotalSeats(total)
  }, [])

  const validatePromoCode = useCallback(async () => {
    if (!watchedFields.codePromo || !estimatedAmount || !user) return
    setIsValidatingCode(true)
    setCodePromoValid(null)
    setDiscount(0)

    try {
      const result = await apiClient.validateCodePromo(watchedFields.codePromo, estimatedAmount, 'reservation')
      if (result.valid && result.codePromoId) {
        setCodePromoValid(true)
        setDiscount(result.reduction)
        toast.success(`Code promo applique! -${result.reduction.toLocaleString()} DA`)
      } else {
        setCodePromoValid(false)
        toast.error(result.error || 'Code promo invalide')
      }
    } catch {
      setCodePromoValid(false)
      toast.error('Erreur lors de la validation du code')
    } finally {
      setIsValidatingCode(false)
    }
  }, [watchedFields.codePromo, estimatedAmount, user])

  const handleClose = useCallback(() => {
    reset()
    setCurrentStep(1)
    setEstimatedAmount(0)
    setDiscount(0)
    setCodePromoValid(null)
    setSelectedSpace(undefined)
    setDuration(0)
    setAvailableSeats(null)
    setTotalSeats(null)
    onClose()
  }, [reset, onClose])

  const checkAvailability = async (espaceId: string, dateDebut: Date, dateFin: Date): Promise<boolean> => {
    try {
      const response = await apiClient.getReservations()
      if (!response.success || !response.data) return true

      const reservations = response.data as { espace_id: string; statut: string; date_debut: string; date_fin: string }[]
      return !reservations.some(r => {
        if (r.espace_id !== espaceId || !['confirmee', 'en_attente', 'en_cours'].includes(r.statut)) return false
        const resDebut = new Date(r.date_debut)
        const resFin = new Date(r.date_fin)
        return !(dateFin <= resDebut || dateDebut >= resFin)
      })
    } catch {
      return true
    }
  }

  const onSubmit = async (data: ReservationFormType) => {
    if (currentStep !== 3 || !user || !data.espaceId || !data.dateDebut || !data.dateFin) {
      toast.error('Veuillez completer toutes les etapes')
      return
    }

    const dateDebut = new Date(data.dateDebut)
    const dateFin = new Date(data.dateFin)

    if (!isAfter(dateFin, dateDebut) || isBefore(dateDebut, new Date())) {
      toast.error('Dates invalides')
      return
    }

    const participants = Number(data.participants) || 1
    if (selectedSpace && participants > selectedSpace.capacite) {
      toast.error(`Capacite maximale: ${selectedSpace.capacite} personnes`)
      return
    }

    if (!selectedSpace?.disponible || !(await checkAvailability(data.espaceId, dateDebut, dateFin))) {
      toast.error('Cet espace n\'est pas disponible pour ces dates')
      return
    }

    try {
      const result = await createReservation({
        userId: user.id,
        espaceId: data.espaceId,
        dateDebut,
        dateFin,
        montantTotal: estimatedAmount - discount,
        notes: data.notes,
        codePromo: data.codePromo,
        participants,
        reduction: discount
      })

      if (result?.success === false || !result?.id) {
        toast.error(result?.error || 'Erreur lors de la creation')
        return
      }

      toast.success('Reservation creee avec succes!')
      handleClose()
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de la creation'
      toast.error(errorMsg)
    }
  }

  const nextStep = async () => {
    let isValid = currentStep === 1 ? await trigger('espaceId') : await trigger(['dateDebut', 'dateFin'])

    if (currentStep === 2 && isValid && watchedFields.dateDebut && watchedFields.dateFin) {
      const dateDebut = new Date(watchedFields.dateDebut)
      const dateFin = new Date(watchedFields.dateFin)
      const diffHours = (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60)
      const participants = Number(watchedFields.participants) || 1

      if (!isAfter(dateFin, dateDebut) || isBefore(dateDebut, new Date()) || diffHours < 1 || diffHours > 168) {
        toast.error('Dates invalides')
        return
      }

      if (isCoworkingSpace && availableSeats !== null && (availableSeats === 0 || participants > availableSeats)) {
        toast.error(availableSeats === 0 ? 'Aucune place disponible' : `Seulement ${availableSeats} places disponibles`)
        return
      }

      if (selectedSpace && participants > selectedSpace.capacite) {
        toast.error(`Capacite maximale: ${selectedSpace.capacite} personnes`)
        return
      }
    }

    if (isValid && currentStep < 3) setCurrentStep(s => s + 1)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouvelle Reservation" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <StepIndicator currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <SpaceSelector
              key="step1"
              espaces={espaces}
              selectedId={watchedFields.espaceId}
              onSelect={(id) => setValue('espaceId', id)}
              error={errors.espaceId?.message}
            />
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Choisissez vos dates</h3>
                <p className="text-sm text-gray-600">Selectionnez la periode de votre reservation</p>
              </div>

              {selectedSpace && (
                <Card className="p-4 bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedSpace.nom}</p>
                      <p className="text-sm text-gray-600">{selectedSpace.prixHeure.toLocaleString()} DA/heure</p>
                    </div>
                  </div>
                </Card>
              )}

              <DateTimePicker
                selectedStart={watchedFields.dateDebut ? new Date(watchedFields.dateDebut) : null}
                selectedEnd={watchedFields.dateFin ? new Date(watchedFields.dateFin) : null}
                onDateChange={(start, end) => {
                  setValue('dateDebut', start?.toISOString() || '')
                  setValue('dateFin', end?.toISOString() || '')
                }}
              />

              {isCoworkingSpace && selectedSpace && watchedFields.dateDebut && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <SeatAvailability
                    espaceId={selectedSpace.id}
                    espaceName={selectedSpace.nom}
                    dateDebut={watchedFields.dateDebut}
                    dateFin={watchedFields.dateFin || watchedFields.dateDebut}
                    onAvailabilityChange={handleAvailabilityChange}
                  />
                  {availableSeats !== null && availableSeats === 0 && (
                    <Card className="mt-3 p-3 bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Aucune place disponible</span>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {duration > 0 && (
                <Card className="p-4 bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Duree: {duration < 1 ? `${Math.round(duration * 60)} min` : `${duration.toFixed(1)}h`}</p>
                      {duration >= 4 && <p className="text-xs text-blue-600">Reduction longue duree appliquee!</p>}
                    </div>
                  </div>
                </Card>
              )}

              <Input
                label="Nombre de participants"
                type="number"
                icon={<Users className="w-5 h-5" />}
                min={1}
                max={isCoworkingSpace && availableSeats !== null ? availableSeats : (selectedSpace?.capacite || 10)}
                defaultValue={1}
                {...register('participants', { required: true, min: 1, valueAsNumber: true })}
                error={errors.participants?.message}
              />
              {isCoworkingSpace && availableSeats !== null && (
                <p className="text-xs text-gray-500 -mt-4">{availableSeats} place{availableSeats > 1 ? 's' : ''} disponible{availableSeats > 1 ? 's' : ''} sur {totalSeats}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                <textarea {...register('notes')} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none" placeholder="Besoins particuliers..." />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Verifiez votre reservation</h3>
                <p className="text-sm text-gray-600">Confirmez les details avant de finaliser</p>
              </div>

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
                          <p className="font-medium text-gray-900">Debut</p>
                          <p className="text-gray-600">{format(new Date(watchedFields.dateDebut), "EEEE d MMMM yyyy 'a' HH:mm", { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium text-gray-900">Fin</p>
                          <p className="text-gray-600">{format(new Date(watchedFields.dateFin), "EEEE d MMMM yyyy 'a' HH:mm", { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium text-gray-900">Participants</p>
                          <p className="text-gray-600">{watchedFields.participants || 1} personne{(watchedFields.participants || 1) > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code promo (optionnel)</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input icon={<Tag className="w-5 h-5" />} placeholder="Entrez votre code" {...register('codePromo')} />
                    {codePromoValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {codePromoValid ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="outline" onClick={validatePromoCode} disabled={!watchedFields.codePromo || isValidatingCode}>
                    {isValidatingCode ? 'Verification...' : 'Appliquer'}
                  </Button>
                </div>
              </div>

              <PricingSummary estimatedAmount={estimatedAmount} discount={discount} />

              {watchedFields.notes && (
                <Card className="p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
                  <p className="text-sm text-gray-600">{watchedFields.notes}</p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-4 border-t">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={() => setCurrentStep(s => s - 1)} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />Precedent
            </Button>
          )}
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep} className={currentStep === 1 ? 'w-full' : 'flex-1'}>
              Suivant<ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" loading={isSubmitting} className="flex-1" disabled={currentStep !== 3}>
              <Check className="w-4 h-4 mr-2" />Confirmer
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
})

ReservationForm.displayName = 'ReservationForm'

export default ReservationForm
