import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/views/lib/http'
const result = ref<any>()

export const useEarlyStartStore = defineStore('earlyStart', () => {
  const isLoading = ref(true)
  const error = ref('')
  const earlyInitialize = ref(true)

  const getDeviceInformation = async () => {
    try {
      isLoading.value = true
      error.value = ''
      const res = await http.get('/settings')
      if (!res || res.status !== 'success' || !res.data) {
        throw new Error(res?.message ?? 'Could not load device information')
      }
      result.value = res.data
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
      console.error('Failed to load device information:', caughtError)
    } finally {
      isLoading.value = false
      earlyInitialize.value = false
    }
  }

  return { isLoading, error, getDeviceInformation, result, earlyInitialize }
})
