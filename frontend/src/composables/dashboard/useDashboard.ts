import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/views/lib/http'

interface DashboardMetrics {
  ram: {
    ramTotal: number
    usedRam: number
    availableRam: number
    usagePercent: number
  }
  cpu: {
    usagePercent: number
  }
}

interface DashboardResponse {
  status: string
  message?: string
  data: DashboardMetrics
}

export const useDashboard = defineStore('dashboard', () => {
  const chartData = ref<DashboardMetrics>()
  const isLoading = ref(false)
  const error = ref('')

  const getChartData = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const response = (await http.get('/dashboard')) as DashboardResponse | undefined
      if (!response || response.status !== 'ok' || !response.data?.cpu || !response.data?.ram) {
        throw new Error(response?.message ?? 'The dashboard returned invalid system metrics')
      }

      chartData.value = response.data
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  return { chartData, isLoading, error, getChartData }
})
