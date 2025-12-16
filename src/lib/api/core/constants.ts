export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api'

export const PUBLIC_ENDPOINTS = [
  '/auth/login.php',
  '/auth/register.php'
]

export const MAX_RETRIES = 3

export const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000

export const PROTECTED_PATHS = [
  '/app',
  '/erp',
  '/dashboard',
  '/tableau-de-bord',
  '/admin',
  '/profil',
  '/reservations',
  '/mes-reservations'
]
