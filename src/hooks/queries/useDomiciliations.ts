import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { transformDomiciliation } from '../../utils/api-transformers'
import type { ApiDomiciliation } from '../../types/api.types'
import type { DemandeDomiciliation } from '../../types'
import toast from 'react-hot-toast'

export const useDomiciliations = () => {
  return useQuery({
    queryKey: ['domiciliations'],
    queryFn: async () => {
      const response = await apiClient.getDomiciliations()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch domiciliations')
      }
      const responseData = response.data as any
      const domiciliations = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return domiciliations.map(transformDomiciliation)
    },
  })
}

export const useUserDomiciliation = (userId: string) => {
  return useQuery({
    queryKey: ['domiciliations', 'user', userId],
    queryFn: async () => {
      const response = await apiClient.getUserDomiciliation(userId)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user domiciliation')
      }
      const responseData = response.data as any
      const domiciliation = Array.isArray(responseData) ? responseData[0] : responseData
      return domiciliation ? transformDomiciliation(domiciliation as ApiDomiciliation) : null
    },
    enabled: !!userId,
  })
}

export const useCreateDemandeDomiciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<DemandeDomiciliation>) => {
      const response = await apiClient.createDemandeDomiciliation(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create domiciliation')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domiciliations'] })
      toast.success('Demande de domiciliation créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })
}

export const useUpdateDemandeDomiciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DemandeDomiciliation> }) => {
      const response = await apiClient.updateDemandeDomiciliation(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update domiciliation')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domiciliations'] })
      toast.success('Demande mise à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}
