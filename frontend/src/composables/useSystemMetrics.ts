import { onBeforeUnmount, onMounted, ref } from 'vue'
import { desktop, errorMessage, type SystemMetrics } from '@/lib/desktop'

export function useSystemMetrics() {
  const metrics = ref<SystemMetrics | null>(null)
  const error = ref('')
  let intervalId: number | undefined
  let active = false
  let requestInFlight = false

  async function poll() {
    if (!active || requestInFlight) return
    requestInFlight = true
    try {
      const nextMetrics = await desktop.getMetrics()
      if (active) {
        metrics.value = nextMetrics
        error.value = ''
      }
    } catch (cause) {
      if (active) {
        error.value = `Unable to read system metrics: ${errorMessage(cause)}`
        console.error('System metrics request failed:', cause)
      }
    } finally {
      requestInFlight = false
    }
  }

  onMounted(() => {
    active = true
    void poll()
    intervalId = window.setInterval(() => void poll(), 1000)
  })

  onBeforeUnmount(() => {
    active = false
    if (intervalId !== undefined) window.clearInterval(intervalId)
  })

  return { metrics, error }
}
