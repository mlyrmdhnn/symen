import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/views/lib/http'
const result = ref<any>()

export const useEarlyStartStore = defineStore('earlyStart', () => {
  const isLoading = ref(true)

  const getDeviceInformation = async () => {
    try {
      isLoading.value = true
      const res = await http.get('/settings')
      result.value = res.data
    } catch (error) {
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, getDeviceInformation, result }
})
