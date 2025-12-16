import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { transformUser } from '../../utils/api-transformers'
import type { ApiUser } from '../../types/api.types'
import type { User } from '../../types'
import toast from 'react-hot-toast'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.getUsers()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch users')
      }
      const responseData = response.data as any
      const users = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return users.map(transformUser)
    },
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await apiClient.getUser(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user')
      }
      return transformUser(response.data as ApiUser)
    },
    enabled: !!id,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await apiClient.updateUser(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user')
      }
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
      toast.success('Utilisateur mis à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteUser(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilisateur supprimé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })
}
