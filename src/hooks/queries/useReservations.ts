import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { transformReservation } from '../../utils/api-transformers'
import type { ApiReservation } from '../../types/api.types'
import type { Reservation } from '../../types'
import toast from 'react-hot-toast'

export const useReservations = (userId?: string) => {
  return useQuery({
    queryKey: userId ? ['reservations', 'user', userId] : ['reservations'],
    queryFn: async () => {
      const response = await apiClient.getReservations(userId)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch reservations')
      }
      const responseData = response.data as any
      const reservations = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return reservations.map(transformReservation)
    },
  })
}

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: async () => {
      const response = await apiClient.getReservation(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch reservation')
      }
      return transformReservation(response.data as ApiReservation)
    },
    enabled: !!id,
  })
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      espaceId: string
      dateDebut: string
      dateFin: string
      participants?: number
      notes?: string
      codePromo?: string
      montantTotal?: number
    }) => {
      const response = await apiClient.createReservation(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create reservation')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Réservation créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Reservation> }) => {
      const response = await apiClient.updateReservation(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update reservation')
      }
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.id] })
      toast.success('Réservation mise à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}

export const useCancelReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.cancelReservation(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel reservation')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Réservation annulée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'annulation')
    },
  })
}
