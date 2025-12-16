import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { transformCodePromo } from '../../utils/api-transformers'
import type { ApiCodePromo } from '../../types/api.types'
import type { CodePromo } from '../../types'
import toast from 'react-hot-toast'

export const useCodesPromo = () => {
  return useQuery({
    queryKey: ['codes-promo'],
    queryFn: async () => {
      const response = await apiClient.getCodesPromo()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch codes promo')
      }
      const responseData = response.data as any
      const codes = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return codes.map(transformCodePromo)
    },
  })
}

export const usePublicCodesPromo = () => {
  return useQuery({
    queryKey: ['codes-promo', 'public'],
    queryFn: async () => {
      const response = await apiClient.getPublicCodesPromo()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch public codes promo')
      }
      const responseData = response.data as any
      const codes = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return codes.map(transformCodePromo)
    },
  })
}

export const useValidateCodePromo = () => {
  return useMutation({
    mutationFn: async ({
      code,
      montant,
      type,
    }: {
      code: string
      montant: number
      type: string
    }) => {
      return await apiClient.validateCodePromo(code, montant, type)
    },
  })
}

export const useCreateCodePromo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<CodePromo>) => {
      const response = await apiClient.createCodePromo(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create code promo')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes-promo'] })
      toast.success('Code promo créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })
}

export const useUpdateCodePromo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CodePromo> }) => {
      const response = await apiClient.updateCodePromo(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update code promo')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes-promo'] })
      toast.success('Code promo mis à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}

export const useDeleteCodePromo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteCodePromo(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete code promo')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes-promo'] })
      toast.success('Code promo supprimé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })
}
