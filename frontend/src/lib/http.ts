import { invoke } from '@tauri-apps/api/core'
import { ref } from 'vue'

interface Options<T> {
  payload?: Record<string, unknown>
  immediate?: boolean
  pick?: string
}

export function useInvoke<T = unknown>(method: string, options: Options<T> = {}) {
  const { immediate = true, payload, pick } = options

  const data = ref<T | null>(null)
  const error = ref<unknown | null>(null)
  const pending = ref<boolean>(false)

  const execute = async (overridePayload?: Record<string, unknown>) => {
    pending.value = true
    error.value = null

    try {
      const args = overridePayload || payload || {}

      const response = await invoke<any>(method, args)

      if (response !== undefined && response !== null) {
        data.value = pick ? response[pick] : (response as T)
      } else {
        data.value = response
      }
    } catch (err) {
      error.value = err
      console.error(`[IPC Error] ${method}:`, err)
    } finally {
      pending.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return { data, pending, error, execute }
}

export default useInvoke
