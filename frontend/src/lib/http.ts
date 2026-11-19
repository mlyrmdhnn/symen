import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

interface Options<TPayload = Record<string, any>> {
  payload?: TPayload
  pick?: string
  immediate?: boolean
  initialData?: any
}

function CreateInvoke() {
  function instance<TData = unknown, TPayload extends Record<string, any> = Record<string, any>>(
    method: string,
    options: Options<TPayload> = {},
  ) {
    const { payload, pick, immediate = true, initialData = null } = options

    const data = ref<TData | null>(initialData)
    const pending = ref<boolean>(false)
    const error = ref<string | Error | null>(null)

    async function execute(overridePayload?: TPayload) {
      try {
        pending.value = true
        error.value = null

        const finalPayload = overridePayload ?? payload ?? {}
        const response = await invoke<TData>(method, finalPayload)

        if (response !== undefined && response !== null) {
          data.value = pick ? (response as any)[pick] : response
        }
      } catch (err: any) {
        error.value = err
      } finally {
        pending.value = false
      }
    }

    if (immediate) {
      execute()
    }

    return { data, pending, error, execute }
  }

  return instance
}

const useInvoke = CreateInvoke()

export default useInvoke
