import http from '@/views/lib/http'
import { ref } from 'vue'

export function useDashboard() {
  const chartData = ref<any>()

  const getChartData = async () => {
    const res: any = await http.get('/dashboard', {})
    chartData.value = res.data
  }

  return { chartData, getChartData }
}
