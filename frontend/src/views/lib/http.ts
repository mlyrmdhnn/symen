type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const wrapper = async (method: HttpMethod, url: string, payload?: any) => {
  const response = await window.electronAPI?.runPython({
    method: method,
    url: url,
    data: payload,
  })
  return response
}

interface Options {
  payload?: any
  onError?: (error: any) => void
}

const http = {
  get: async (url: string, options?: Options) => {
    try {
      return await wrapper('GET', url, options?.payload)
    } catch (err) {
      if (options?.onError) {
        options.onError(err) // Panggil callback onError jika disediakan
      } else {
        throw err // Kalau tidak ada onError, lempar ulang error-nya
      }
    }
  },
  post: async (url: string, options?: Options) => {
    try {
      return await wrapper('POST', url, options?.payload)
    } catch (err) {
      if (options?.onError) {
        options.onError(err)
      } else {
        throw err
      }
    }
  },
  put: async (url: string, options?: Options) => {
    try {
      return await wrapper('PUT', url, options?.payload)
    } catch (err) {
      if (options?.onError) {
        options.onError(err)
      } else {
        throw err
      }
    }
  },
  delete: async (url: string, options?: Options) => {
    try {
      return await wrapper('DELETE', url, options?.payload)
    } catch (err) {
      if (options?.onError) {
        options.onError(err)
      } else {
        throw err
      }
    }
  },
}

export default http
