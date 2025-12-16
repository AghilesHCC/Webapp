import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { transformEspace } from '../../utils/api-transformers'
import type { ApiEspace } from '../../types/api.types'
import type { Espace } from '../../types'
import toast from 'react-hot-toast'

export const useEspaces = () => {
  return useQuery({
    queryKey: ['espaces'],
    queryFn: async () => {
      const response = await apiClient.getEspaces()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch espaces')
      }
      const responseData = response.data as any
      const espaces = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return espaces.map(transformEspace)
    },
  })
}

export const useEspace = (id: string) => {
  return useQuery({
    queryKey: ['espaces', id],
    queryFn: async () => {
      const response = await apiClient.getEspace(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch espace')
      }
      return transformEspace(response.data as ApiEspace)
    },
    enabled: !!id,
  })
}

export const useCreateEspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Espace>) => {
      const response = await apiClient.createEspace(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create espace')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['espaces'] })
      toast.success('Espace créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })
}

export const useUpdateEspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Espace> }) => {
      const response = await apiClient.updateEspace(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update espace')
      }
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['espaces'] })
      queryClient.invalidateQueries({ queryKey: ['espaces', variables.id] })
      toast.success('Espace mis à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}

export const useDeleteEspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteEspace(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete espace')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['espaces'] })
      toast.success('Espace supprimé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })
}
