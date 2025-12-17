import type { ApiResponse } from '../types/api.types'

interface DiagnosticResult {
  category: string
  name: string
  status: 'pass' | 'fail' | 'warning' | 'skip'
  message: string
  details?: string
  duration?: number
}

interface DiagnosticReport {
  timestamp: string
  environment: {
    apiUrl: string
    nodeEnv: string
    userAgent: string
  }
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    skipped: number
  }
  results: DiagnosticResult[]
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

async function checkApiEndpoint(endpoint: string, method = 'GET', requiresAuth = false): Promise<DiagnosticResult> {
  const start = performance.now()
  const url = `${API_URL}${endpoint}`

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (requiresAuth) {
      const token = localStorage.getItem('token')
      if (!token) {
        return {
          category: 'API',
          name: `${method} ${endpoint}`,
          status: 'skip',
          message: 'Requires authentication - no token available',
          duration: performance.now() - start
        }
      }
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetchWithTimeout(url, { method, headers })
    const duration = performance.now() - start

    if (response.ok) {
      const data = await response.json() as ApiResponse
      return {
        category: 'API',
        name: `${method} ${endpoint}`,
        status: 'pass',
        message: `Status ${response.status} - Response received`,
        details: data.success !== undefined ? `success: ${data.success}` : undefined,
        duration
      }
    }

    return {
      category: 'API',
      name: `${method} ${endpoint}`,
      status: response.status === 401 && requiresAuth ? 'warning' : 'fail',
      message: `Status ${response.status} - ${response.statusText}`,
      duration
    }
  } catch (error) {
    return {
      category: 'API',
      name: `${method} ${endpoint}`,
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: performance.now() - start
    }
  }
}

function checkLocalStorage(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  try {
    localStorage.setItem('__diagnostic_test__', 'test')
    localStorage.removeItem('__diagnostic_test__')
    results.push({
      category: 'Storage',
      name: 'LocalStorage available',
      status: 'pass',
      message: 'LocalStorage is accessible'
    })
  } catch {
    results.push({
      category: 'Storage',
      name: 'LocalStorage available',
      status: 'fail',
      message: 'LocalStorage is not accessible'
    })
  }

  const token = localStorage.getItem('token')
  results.push({
    category: 'Storage',
    name: 'Auth token present',
    status: token ? 'pass' : 'warning',
    message: token ? 'Auth token found' : 'No auth token stored'
  })

  const authStore = localStorage.getItem('auth-store')
  results.push({
    category: 'Storage',
    name: 'Auth store data',
    status: authStore ? 'pass' : 'warning',
    message: authStore ? 'Auth store data found' : 'No auth store data'
  })

  return results
}

function checkEnvironmentVariables(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  const requiredVars = [
    { key: 'VITE_API_URL', value: import.meta.env.VITE_API_URL },
  ]

  for (const { key, value } of requiredVars) {
    results.push({
      category: 'Environment',
      name: key,
      status: value ? 'pass' : 'warning',
      message: value ? `Set to: ${value}` : 'Not set (using default)'
    })
  }

  results.push({
    category: 'Environment',
    name: 'MODE',
    status: 'pass',
    message: `Running in ${import.meta.env.MODE} mode`
  })

  results.push({
    category: 'Environment',
    name: 'DEV',
    status: 'pass',
    message: import.meta.env.DEV ? 'Development mode' : 'Production mode'
  })

  return results
}

function checkBrowserFeatures(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  const features = [
    { name: 'Fetch API', check: () => typeof fetch === 'function' },
    { name: 'Promise', check: () => typeof Promise === 'function' },
    { name: 'async/await', check: () => true },
    { name: 'ES6 Classes', check: () => typeof class {} === 'function' },
    { name: 'Array.includes', check: () => Array.prototype.includes !== undefined },
    { name: 'Object.entries', check: () => typeof Object.entries === 'function' },
    { name: 'Optional chaining', check: () => { const obj = { a: { b: 1 } }; return obj?.a?.b === 1 } },
    { name: 'Nullish coalescing', check: () => { const x = null ?? 'default'; return x === 'default' } },
    { name: 'WebSocket', check: () => typeof WebSocket === 'function' },
    { name: 'IntersectionObserver', check: () => typeof IntersectionObserver === 'function' },
    { name: 'ResizeObserver', check: () => typeof ResizeObserver === 'function' },
  ]

  for (const { name, check } of features) {
    try {
      const supported = check()
      results.push({
        category: 'Browser',
        name,
        status: supported ? 'pass' : 'warning',
        message: supported ? 'Supported' : 'Not supported'
      })
    } catch {
      results.push({
        category: 'Browser',
        name,
        status: 'fail',
        message: 'Error checking feature'
      })
    }
  }

  return results
}

function checkDateFormats(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  const testCases = [
    { input: '2024-01-15T10:30:00', expected: true },
    { input: '2024-01-15 10:30:00', expected: true },
    { input: '2024-01-15', expected: true },
    { input: 'invalid-date', expected: false },
  ]

  for (const { input, expected } of testCases) {
    const date = new Date(input)
    const isValid = !isNaN(date.getTime())
    results.push({
      category: 'Date Parsing',
      name: `Parse "${input}"`,
      status: isValid === expected ? 'pass' : 'fail',
      message: isValid ? `Valid date: ${date.toISOString()}` : 'Invalid date'
    })
  }

  return results
}

function checkTypeConsistency(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  const sampleApiResponse = {
    id: '123',
    nom: 'Test',
    type: 'open_space',
    capacite: 24,
    prix_heure: 200,
    prix_demi_journee: 600,
    prix_jour: 1200,
    prix_semaine: 6000,
    disponible: 1,
    description: 'Test space',
    equipements: '["WiFi", "Climatisation"]',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }

  try {
    const capacite = typeof sampleApiResponse.capacite === 'number' ? sampleApiResponse.capacite : parseInt(String(sampleApiResponse.capacite))
    results.push({
      category: 'Type Consistency',
      name: 'Capacity number conversion',
      status: !isNaN(capacite) ? 'pass' : 'fail',
      message: `Converted to: ${capacite}`
    })
  } catch {
    results.push({
      category: 'Type Consistency',
      name: 'Capacity number conversion',
      status: 'fail',
      message: 'Failed to convert'
    })
  }

  try {
    const disponible = sampleApiResponse.disponible === 1 || sampleApiResponse.disponible === true
    results.push({
      category: 'Type Consistency',
      name: 'Boolean conversion (disponible)',
      status: 'pass',
      message: `Converted to: ${disponible}`
    })
  } catch {
    results.push({
      category: 'Type Consistency',
      name: 'Boolean conversion (disponible)',
      status: 'fail',
      message: 'Failed to convert'
    })
  }

  try {
    const equipements = typeof sampleApiResponse.equipements === 'string'
      ? JSON.parse(sampleApiResponse.equipements)
      : sampleApiResponse.equipements
    results.push({
      category: 'Type Consistency',
      name: 'JSON array parsing (equipements)',
      status: Array.isArray(equipements) ? 'pass' : 'fail',
      message: `Parsed to array with ${Array.isArray(equipements) ? equipements.length : 0} items`
    })
  } catch {
    results.push({
      category: 'Type Consistency',
      name: 'JSON array parsing (equipements)',
      status: 'fail',
      message: 'Failed to parse JSON'
    })
  }

  return results
}

async function checkApiHealth(): Promise<DiagnosticResult[]> {
  const endpoints = [
    { path: '/espaces/index.php', method: 'GET', auth: false },
    { path: '/abonnements/index.php', method: 'GET', auth: false },
    { path: '/codes-promo/public.php', method: 'GET', auth: false },
    { path: '/auth/me.php', method: 'GET', auth: true },
    { path: '/reservations/index.php', method: 'GET', auth: true },
    { path: '/domiciliations/user.php', method: 'GET', auth: true },
    { path: '/notifications/index.php', method: 'GET', auth: true },
  ]

  const results: DiagnosticResult[] = []

  for (const endpoint of endpoints) {
    const result = await checkApiEndpoint(endpoint.path, endpoint.method, endpoint.auth)
    results.push(result)
  }

  return results
}

function checkReservationFieldMapping(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  const apiReservation = {
    id: 'test-id',
    user_id: 'user-123',
    userId: undefined,
    espace_id: 'espace-456',
    espaceId: undefined,
    date_debut: '2024-01-15T10:00:00Z',
    dateDebut: undefined,
    date_fin: '2024-01-15T12:00:00Z',
    dateFin: undefined,
    montant_total: 400,
    montantTotal: undefined,
    statut: 'confirmee',
    participants: 2
  }

  const userId = apiReservation.userId || apiReservation.user_id
  results.push({
    category: 'Field Mapping',
    name: 'userId fallback',
    status: userId === 'user-123' ? 'pass' : 'fail',
    message: `Resolved to: ${userId}`
  })

  const espaceId = apiReservation.espaceId || apiReservation.espace_id
  results.push({
    category: 'Field Mapping',
    name: 'espaceId fallback',
    status: espaceId === 'espace-456' ? 'pass' : 'fail',
    message: `Resolved to: ${espaceId}`
  })

  const dateDebut = apiReservation.dateDebut || apiReservation.date_debut
  results.push({
    category: 'Field Mapping',
    name: 'dateDebut fallback',
    status: dateDebut === '2024-01-15T10:00:00Z' ? 'pass' : 'fail',
    message: `Resolved to: ${dateDebut}`
  })

  const montantTotal = apiReservation.montantTotal ?? apiReservation.montant_total
  results.push({
    category: 'Field Mapping',
    name: 'montantTotal fallback',
    status: montantTotal === 400 ? 'pass' : 'fail',
    message: `Resolved to: ${montantTotal}`
  })

  return results
}

function checkCoworkingCapacity(): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  const coworkingCapacity = 24
  const reservations = [
    { participants: 5, dateDebut: '2024-01-15T09:00:00', dateFin: '2024-01-15T12:00:00' },
    { participants: 3, dateDebut: '2024-01-15T10:00:00', dateFin: '2024-01-15T14:00:00' },
    { participants: 4, dateDebut: '2024-01-15T11:00:00', dateFin: '2024-01-15T15:00:00' },
  ]

  const checkTime = new Date('2024-01-15T11:30:00')

  let occupiedSeats = 0
  for (const res of reservations) {
    const start = new Date(res.dateDebut)
    const end = new Date(res.dateFin)
    if (checkTime >= start && checkTime < end) {
      occupiedSeats += res.participants
    }
  }

  const availableSeats = coworkingCapacity - occupiedSeats
  const occupancyRate = (occupiedSeats / coworkingCapacity) * 100

  results.push({
    category: 'Coworking Capacity',
    name: 'Seat calculation',
    status: 'pass',
    message: `At 11:30: ${occupiedSeats}/${coworkingCapacity} occupied (${availableSeats} available)`,
    details: `Occupancy rate: ${occupancyRate.toFixed(1)}%`
  })

  results.push({
    category: 'Coworking Capacity',
    name: 'Availability check',
    status: availableSeats > 0 ? 'pass' : 'warning',
    message: availableSeats > 0 ? `${availableSeats} seats available` : 'Fully booked'
  })

  const newReservation = { participants: 10 }
  const canBook = newReservation.participants <= availableSeats
  results.push({
    category: 'Coworking Capacity',
    name: `Can book ${newReservation.participants} seats`,
    status: canBook ? 'pass' : 'warning',
    message: canBook ? 'Booking possible' : 'Not enough seats available'
  })

  return results
}

export async function runDiagnostics(): Promise<DiagnosticReport> {
  const results: DiagnosticResult[] = []

  results.push(...checkEnvironmentVariables())
  results.push(...checkLocalStorage())
  results.push(...checkBrowserFeatures())
  results.push(...checkDateFormats())
  results.push(...checkTypeConsistency())
  results.push(...checkReservationFieldMapping())
  results.push(...checkCoworkingCapacity())

  const apiResults = await checkApiHealth()
  results.push(...apiResults)

  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warning').length,
    skipped: results.filter(r => r.status === 'skip').length
  }

  return {
    timestamp: new Date().toISOString(),
    environment: {
      apiUrl: API_URL,
      nodeEnv: import.meta.env.MODE,
      userAgent: navigator.userAgent
    },
    summary,
    results
  }
}

export function formatDiagnosticReport(report: DiagnosticReport): string {
  const lines: string[] = []

  lines.push('='.repeat(60))
  lines.push('COFFICE APPLICATION DIAGNOSTIC REPORT')
  lines.push('='.repeat(60))
  lines.push('')
  lines.push(`Timestamp: ${report.timestamp}`)
  lines.push(`API URL: ${report.environment.apiUrl}`)
  lines.push(`Environment: ${report.environment.nodeEnv}`)
  lines.push('')

  lines.push('-'.repeat(60))
  lines.push('SUMMARY')
  lines.push('-'.repeat(60))
  lines.push(`Total Tests: ${report.summary.total}`)
  lines.push(`Passed: ${report.summary.passed}`)
  lines.push(`Failed: ${report.summary.failed}`)
  lines.push(`Warnings: ${report.summary.warnings}`)
  lines.push(`Skipped: ${report.summary.skipped}`)
  lines.push('')

  const categories = [...new Set(report.results.map(r => r.category))]

  for (const category of categories) {
    const categoryResults = report.results.filter(r => r.category === category)

    lines.push('-'.repeat(60))
    lines.push(`${category.toUpperCase()}`)
    lines.push('-'.repeat(60))

    for (const result of categoryResults) {
      const statusIcon = {
        pass: '[PASS]',
        fail: '[FAIL]',
        warning: '[WARN]',
        skip: '[SKIP]'
      }[result.status]

      lines.push(`${statusIcon} ${result.name}`)
      lines.push(`       ${result.message}`)
      if (result.details) {
        lines.push(`       ${result.details}`)
      }
      if (result.duration !== undefined) {
        lines.push(`       (${result.duration.toFixed(2)}ms)`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function getDiagnosticResultsByStatus(report: DiagnosticReport, status: DiagnosticResult['status']): DiagnosticResult[] {
  return report.results.filter(r => r.status === status)
}

export function getDiagnosticResultsByCategory(report: DiagnosticReport, category: string): DiagnosticResult[] {
  return report.results.filter(r => r.category === category)
}
