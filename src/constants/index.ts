export * from './espaces'

export const RESERVATION_STATUTS = {
  CONFIRMEE: 'confirmee',
  EN_ATTENTE: 'en_attente',
  EN_COURS: 'en_cours',
  ANNULEE: 'annulee',
  TERMINEE: 'terminee'
} as const

export type ReservationStatut = typeof RESERVATION_STATUTS[keyof typeof RESERVATION_STATUTS]

export const RESERVATION_STATUT_LABELS: Record<ReservationStatut, string> = {
  [RESERVATION_STATUTS.CONFIRMEE]: 'Confirmee',
  [RESERVATION_STATUTS.EN_ATTENTE]: 'En attente',
  [RESERVATION_STATUTS.EN_COURS]: 'En cours',
  [RESERVATION_STATUTS.ANNULEE]: 'Annulee',
  [RESERVATION_STATUTS.TERMINEE]: 'Terminee'
}

export const RESERVATION_STATUT_COLORS: Record<ReservationStatut, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'error'> = {
  [RESERVATION_STATUTS.CONFIRMEE]: 'success',
  [RESERVATION_STATUTS.EN_ATTENTE]: 'warning',
  [RESERVATION_STATUTS.EN_COURS]: 'info',
  [RESERVATION_STATUTS.ANNULEE]: 'error',
  [RESERVATION_STATUTS.TERMINEE]: 'default'
}

export function getReservationStatutLabel(statut: string): string {
  return RESERVATION_STATUT_LABELS[statut as ReservationStatut] || statut
}

export function getReservationStatutColor(statut: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'error' {
  return RESERVATION_STATUT_COLORS[statut as ReservationStatut] || 'default'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const USER_STATUTS = {
  ACTIF: 'actif',
  INACTIF: 'inactif',
  SUSPENDU: 'suspendu'
} as const

export type UserStatut = typeof USER_STATUTS[keyof typeof USER_STATUTS]

export const DOMICILIATION_STATUTS = {
  EN_ATTENTE: 'en_attente',
  EN_COURS: 'en_cours',
  VALIDEE: 'validee',
  ACTIVE: 'active',
  REJETEE: 'rejetee',
  EXPIREE: 'expiree'
} as const

export type DomiciliationStatut = typeof DOMICILIATION_STATUTS[keyof typeof DOMICILIATION_STATUTS]

export const TYPE_RESERVATION = {
  HEURE: 'heure',
  DEMI_JOURNEE: 'demi_journee',
  JOUR: 'jour'
} as const

export type TypeReservation = typeof TYPE_RESERVATION[keyof typeof TYPE_RESERVATION]

export const BUSINESS_HOURS = {
  OPEN_HOUR: 8,
  OPEN_MINUTE: 30,
  CLOSE_HOUR: 18,
  CLOSE_MINUTE: 30,
  WORKING_DAYS: [0, 1, 2, 3, 4] as const
} as const

export const HALF_DAY_HOURS = 4

export const MAX_RESERVATION_DAYS = 7

export const MIN_CANCELLATION_HOURS = 24

export function isWorkingDay(date: Date): boolean {
  return BUSINESS_HOURS.WORKING_DAYS.includes(date.getDay() as 0 | 1 | 2 | 3 | 4)
}

export function isWithinBusinessHours(date: Date): boolean {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const timeValue = hours * 60 + minutes
  const openTime = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE
  const closeTime = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE
  return timeValue >= openTime && timeValue <= closeTime
}

export function getNextBusinessDay(date: Date): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)
  while (!isWorkingDay(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}
