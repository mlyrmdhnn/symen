type HTTP = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Headers = 'json' | 'multipart' | 'stream'

interface Options {
  method?: HTTP
  payload?: any
  initiate?: Boolean
  credentials?: Boolean
  execute?: () => void
  onError?: (error: unknown) => void
  onSuccess?: (data: unknown) => void
  pick?: string
  baseURL?: string
  headers?: Headers
}

export type { Options }
