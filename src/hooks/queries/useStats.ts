import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import type { AdminStats } from '../../types'

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await apiClient.getAdminStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch stats')
      }
      return response.data as AdminStats
    },
  })
}

export const useRevenue = (period: string = 'month') => {
  return useQuery({
    queryKey: ['admin', 'revenue', period],
    queryFn: async () => {
      const response = await apiClient.getRevenue(period)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch revenue')
      }
      return response.data
    },
  })
}
