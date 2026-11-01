import { ref } from 'vue'
import type { Options } from './httpType'

function CreateInstance() {
  function instance<T>(url: string, options: Options = {}) {
    const data = ref<T | null>(null)
    const pending = ref<Boolean>(false)
    const error = ref<any | null>(null)

    const {
      credentials,
      execute,
      initiate = true,
      method = 'GET',
      onError,
      onSuccess,
      payload,
      pick,
      baseURL,
      headers = 'json',
    } = options

    // url sanitize start
    let finalURL = url

    if (baseURL) {
      finalURL = baseURL + url
    }

    // url sanitize end

    // headers condition start

    let finalHeaders = null

    if (headers == 'json') {
      finalHeaders = { 'Content-Type': 'application/json' }
    }
    // headers condition end

    async function core() {
      pending.value = true

      try {
        const response = await fetch(finalURL, {
          body: JSON.stringify(payload),
          credentials: credentials ? 'include' : 'omit',
          method: method,
        })

        let result = await response.json()

        data.value = pick ? result[pick] : result

        onSuccess?.(result)

        if (!response.ok) {
          throw {
            status: response.status,
            message: response.statusText,
          }
        }
      } catch (err: any) {
        error.value = err
        onError?.(err)
      } finally {
        pending.value = false
      }
    }

    // if initiate true, auto run core
    if (initiate) {
      core()
    }

    // if called execute, run core
    if (execute) {
      core()
    }

    return { data, pending, error, execute, onError, onSuccess }
  }

  return instance
}

const _http = CreateInstance()

export { _http as hfetch }
