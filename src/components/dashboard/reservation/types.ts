import type { Espace, ReservationForm as ReservationFormType } from '../../../types'
import type { UseFormReturn } from 'react-hook-form'

export interface ReservationFormState {
  currentStep: number
  estimatedAmount: number
  discount: number
  isValidatingCode: boolean
  codePromoValid: boolean | null
  selectedSpace: Espace | undefined
  duration: number
  availableSeats: number | null
  totalSeats: number | null
}

export interface ReservationFormProps {
  isOpen: boolean
  onClose: () => void
  selectedEspace?: Espace
}

export interface StepProps {
  form: UseFormReturn<ReservationFormType>
  state: ReservationFormState
  espaces: Espace[]
  onStateChange: (updates: Partial<ReservationFormState>) => void
}

export interface Step {
  number: number
  title: string
  icon: React.ComponentType<{ className?: string }>
}
