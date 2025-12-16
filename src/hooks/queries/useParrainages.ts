import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { transformParrainage } from '../../utils/api-transformers'

export const useParrainages = (userId?: string) => {
  return useQuery({
    queryKey: userId ? ['parrainages', 'user', userId] : ['parrainages'],
    queryFn: async () => {
      const response = await apiClient.getParrainages(userId)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch parrainages')
      }
      const responseData = response.data as any
      const parrainages = Array.isArray(responseData) ? responseData : (responseData.data || [])
      return parrainages.map(transformParrainage)
    },
  })
}

export const useVerifyCodeParrainage = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      return await apiClient.verifyCodeParrainage(code)
    },
  })
}
