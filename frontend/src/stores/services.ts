import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/views/lib/http'

export interface Service {
  id: string
  name: string
  serviceType: string
  path: string
  executable: string | null
  executableName: string
  arguments: string[]
  status: 'running' | 'stopped' | 'error'
  pid: number | null
  startedAt: string | null
  lastError: string | null
}

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

const getResponse = async <T>(method: 'get' | 'post', url: string, payload?: object) => {
  const result = method === 'get' ? await http.get(url) : await http.post(url, { payload })
  const response = result as ApiResponse<T> | undefined
  if (!response || response.status !== 'ok') {
    throw new Error(response?.message ?? 'The service manager returned an invalid response')
  }
  return response.data
}

export const useServices = defineStore('services', () => {
  const services = ref<Service[]>([])
  const error = ref('')
  const isLoading = ref(false)
  const isWorking = ref(false)

  const runAction = async <T>(action: () => Promise<T>): Promise<T> => {
    error.value = ''
    isWorking.value = true
    try {
      return await action()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
      throw caughtError
    } finally {
      isWorking.value = false
    }
  }

  const loadServices = async () => {
    isLoading.value = true
    try {
      services.value = await getResponse<Service[]>('get', '/services')
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  const setError = (message: string) => {
    error.value = message
  }

  const addService = (service: {
    name: string
    serviceType: string
    path: string
    executableName: string
    arguments: string[]
  }) =>
    runAction(async () => {
      const created = await getResponse<Service>('post', '/services/add', service)
      services.value.push(created)
      return created
    })

  const updateService = (service: {
    id: string
    path: string
    executableName: string
    arguments: string[]
  }) =>
    runAction(async () => {
      const updated = await getResponse<Service>('post', '/services/update', service)
      const index = services.value.findIndex((item) => item.id === updated.id)
      if (index >= 0) services.value[index] = updated
      return updated
    })

  const serviceAction = (action: 'start' | 'stop' | 'delete', id: string) =>
    runAction(async () => {
      const result = await getResponse<Service | { id: string }>('post', `/services/${action}`, {
        id,
      })
      if (action === 'delete') {
        services.value = services.value.filter((service) => service.id !== id)
      } else {
        const index = services.value.findIndex((service) => service.id === id)
        if (index >= 0) services.value[index] = result as Service
      }
    })

  const getLogs = async (id?: string) =>
    getResponse<{ lines: string[]; services?: string[] }>(
      'post',
      id ? '/services/logs' : '/services/logs/global',
      id ? { id } : {},
    )

  return {
    services,
    error,
    isLoading,
    isWorking,
    loadServices,
    addService,
    updateService,
    serviceAction,
    getLogs,
    setError,
  }
})
