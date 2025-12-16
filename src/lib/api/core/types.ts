export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: any
}

export interface RegisterData {
  email: string
  password: string
  nom: string
  prenom: string
  telephone?: string
  profession?: string
  entreprise?: string
  codeParrainage?: string
}

export interface ReservationData {
  espaceId: string
  dateDebut: string
  dateFin: string
  participants?: number
  notes?: string
  codePromo?: string
  montantTotal?: number
}
