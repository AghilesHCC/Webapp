import React, { useState, useEffect } from 'react'
import { Users, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '../lib/api-client'
import Card from './ui/Card'

interface TimeSlot {
  heure: string
  heureDebut: string
  heureFin: string
  placesReservees: number
  placesDisponibles: number
  disponible: boolean
}

interface AvailabilityData {
  espaceId: string
  espaceNom: string
  espaceType: string
  capaciteTotale: number
  placesReservees: number
  placesDisponibles: number
  tauxOccupation: number
  reservations: Array<{
    id: string
    dateDebut: string
    dateFin: string
    participants: number
    statut: string
  }>
  creneaux: TimeSlot[]
}

interface SeatAvailabilityProps {
  espaceId: string
  espaceName?: string
  date?: string
  dateDebut?: string
  dateFin?: string
  onAvailabilityChange?: (available: number, total: number) => void
  compact?: boolean
}

const SeatAvailability: React.FC<SeatAvailabilityProps> = ({
  espaceId,
  espaceName,
  date,
  dateDebut,
  dateFin,
  onAvailabilityChange,
  compact = false
}) => {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!espaceId) return

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ espace_id: espaceId })

        if (dateDebut && dateFin) {
          params.append('date_debut', dateDebut)
          params.append('date_fin', dateFin)
        } else if (date) {
          params.append('date', date)
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || '/api'}/reservations/availability.php?${params}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch availability')
        }

        const result = await response.json()

        if (result.success && result.data) {
          setAvailability(result.data)
          if (onAvailabilityChange) {
            onAvailabilityChange(result.data.placesDisponibles, result.data.capaciteTotale)
          }
        } else {
          throw new Error(result.error || 'Failed to fetch availability')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [espaceId, date, dateDebut, dateFin])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
        <span className="ml-2 text-sm text-gray-600">Chargement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm">Impossible de charger la disponibilite</span>
      </div>
    )
  }

  if (!availability) {
    return null
  }

  const { capaciteTotale, placesDisponibles, placesReservees, tauxOccupation, creneaux } = availability

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total
    if (ratio >= 0.5) return 'text-green-600 bg-green-100'
    if (ratio >= 0.2) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  const getAvailabilityIcon = (available: number, total: number) => {
    const ratio = available / total
    if (ratio >= 0.5) return <CheckCircle className="w-5 h-5" />
    if (ratio >= 0.2) return <AlertTriangle className="w-5 h-5" />
    return <XCircle className="w-5 h-5" />
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getAvailabilityColor(placesDisponibles, capaciteTotale)}`}>
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">
          {placesDisponibles}/{capaciteTotale} places
        </span>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <h4 className="font-semibold text-gray-900">
            {espaceName || 'Disponibilite des places'}
          </h4>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${getAvailabilityColor(placesDisponibles, capaciteTotale)}`}>
          {getAvailabilityIcon(placesDisponibles, capaciteTotale)}
          <span className="font-medium">{placesDisponibles} dispo.</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{capaciteTotale}</p>
          <p className="text-xs text-gray-600">Capacite totale</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{placesDisponibles}</p>
          <p className="text-xs text-gray-600">Disponibles</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{placesReservees}</p>
          <p className="text-xs text-gray-600">Reservees</p>
        </div>
      </div>

      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${tauxOccupation}%` }}
          transition={{ duration: 0.5 }}
          className={`absolute h-full rounded-full ${
            tauxOccupation >= 80 ? 'bg-red-500' :
            tauxOccupation >= 50 ? 'bg-amber-500' : 'bg-green-500'
          }`}
        />
      </div>
      <p className="text-xs text-gray-600 text-center">
        Taux d'occupation: {tauxOccupation}%
      </p>

      {creneaux && creneaux.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Disponibilite par creneau
          </h5>
          <div className="grid grid-cols-4 gap-1">
            <AnimatePresence>
              {creneaux.map((slot, index) => (
                <motion.div
                  key={slot.heure}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`text-center p-2 rounded text-xs ${
                    slot.disponible
                      ? slot.placesDisponibles > capaciteTotale * 0.5
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <p className="font-medium">{slot.heure}</p>
                  <p>{slot.placesDisponibles}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Card>
  )
}

export default SeatAvailability
