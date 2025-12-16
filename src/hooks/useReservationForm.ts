import { useState, useMemo } from 'react'
import { useAppStore } from '../store/store'
import type { Espace } from '../types'

interface ReservationFormData {
  espaceId: string
  dateDebut: Date
  dateFin: Date
  participants?: number
  notes?: string
  codePromo?: string
}

/**
 * Hook personnalisé pour gérer la logique du formulaire de réservation
 * Extrait la logique métier du composant UI
 */
export function useReservationForm(selectedEspace?: Espace) {
  const { espaces, calculateReservationAmount, createReservation } = useAppStore()

  const [formData, setFormData] = useState<ReservationFormData>({
    espaceId: selectedEspace?.id || '',
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 3600000), // +1 heure par défaut
    participants: 1,
    notes: '',
    codePromo: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Espace sélectionné
  const espace = useMemo(() => {
    return espaces.find(e => e.id === formData.espaceId) || selectedEspace
  }, [formData.espaceId, espaces, selectedEspace])

  // Calcul du montant
  const montantEstime = useMemo(() => {
    if (!espace || !formData.dateDebut || !formData.dateFin) return 0
    return calculateReservationAmount(espace.id, formData.dateDebut, formData.dateFin, formData.codePromo)
  }, [espace, formData.dateDebut, formData.dateFin, formData.codePromo, calculateReservationAmount])

  // Calcul de la durée
  const duree = useMemo(() => {
    if (!formData.dateDebut || !formData.dateFin) return { heures: 0, jours: 0 }

    const diffMs = formData.dateFin.getTime() - formData.dateDebut.getTime()
    const heures = diffMs / (1000 * 60 * 60)
    const jours = heures / 24

    return { heures, jours }
  }, [formData.dateDebut, formData.dateFin])

  // Type de réservation
  const typeReservation = useMemo(() => {
    if (duree.jours >= 7) return 'semaine'
    if (duree.jours >= 1) return 'jour'
    return 'heure'
  }, [duree])

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = []

    if (!formData.espaceId) {
      errors.push('Veuillez sélectionner un espace')
    }

    if (!formData.dateDebut) {
      errors.push('Veuillez sélectionner une date de début')
    }

    if (!formData.dateFin) {
      errors.push('Veuillez sélectionner une date de fin')
    }

    if (formData.dateDebut && formData.dateFin && formData.dateFin <= formData.dateDebut) {
      errors.push('La date de fin doit être après la date de début')
    }

    if (duree.heures > 8760) { // Max 1 an
      errors.push('La durée ne peut pas dépasser 1 an')
    }

    if (formData.participants && espace && formData.participants > espace.capacite) {
      errors.push(`Le nombre de participants ne peut pas dépasser ${espace.capacite}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [formData, espace, duree])

  // Soumettre la réservation
  const handleSubmit = async () => {
    if (!validation.isValid) {
      return { success: false, errors: validation.errors }
    }

    setIsSubmitting(true)
    try {
      const result = await createReservation({
        espaceId: formData.espaceId,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        participants: formData.participants,
        notes: formData.notes,
        codePromo: formData.codePromo
      })

      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      espaceId: selectedEspace?.id || '',
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 3600000),
      participants: 1,
      notes: '',
      codePromo: ''
    })
  }

  return {
    formData,
    setFormData,
    espace,
    montantEstime,
    duree,
    typeReservation,
    validation,
    isSubmitting,
    handleSubmit,
    resetForm
  }
}
