interface JwtPayload {
  exp: number
  iat: number
  sub?: string
  email?: string
  role?: string
  [key: string]: unknown
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))

    return payload as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true

  const payload = parseJwt(token)
  if (!payload) return true

  const exp = payload.exp * 1000
  return Date.now() >= exp
}

export function isTokenExpiringSoon(token: string | null, thresholdMs: number = 5 * 60 * 1000): boolean {
  if (!token) return false

  const payload = parseJwt(token)
  if (!payload) return false

  const exp = payload.exp * 1000
  const timeLeft = exp - Date.now()

  return timeLeft > 0 && timeLeft < thresholdMs
}

export function getTokenExpiry(token: string | null): number | null {
  if (!token) return null

  const payload = parseJwt(token)
  if (!payload) return null

  return payload.exp * 1000
}
