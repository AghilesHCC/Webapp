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

export const RESERVATION_STATUT_COLORS: Record<ReservationStatut, string> = {
  [RESERVATION_STATUTS.CONFIRMEE]: 'success',
  [RESERVATION_STATUTS.EN_ATTENTE]: 'warning',
  [RESERVATION_STATUTS.EN_COURS]: 'info',
  [RESERVATION_STATUTS.ANNULEE]: 'danger',
  [RESERVATION_STATUTS.TERMINEE]: 'default'
}

export function getReservationStatutLabel(statut: string): string {
  return RESERVATION_STATUT_LABELS[statut as ReservationStatut] || statut
}

export function getReservationStatutColor(statut: string): string {
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
  REFUSEE: 'refusee',
  EXPIREE: 'expiree',
  RESILIEE: 'resiliee'
} as const

export type DomiciliationStatut = typeof DOMICILIATION_STATUTS[keyof typeof DOMICILIATION_STATUTS]

export const TYPE_RESERVATION = {
  HEURE: 'heure',
  JOUR: 'jour',
  SEMAINE: 'semaine'
} as const

export type TypeReservation = typeof TYPE_RESERVATION[keyof typeof TYPE_RESERVATION]
