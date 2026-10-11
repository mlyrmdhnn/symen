/// <reference types="vite/client" />

// type PythonAction = 'greet' | 'uppercase' | 'word-count' | 'device-information'

// interface PythonRequest {
//   action: PythonAction
//   text?: string
// }

// interface Window {
//   electronAPI?: {
//     runPython: (request: PythonRequest) => Promise
//   }
// }

interface Window {
  electronAPI?: {
    runPython: ({ method, url, data }) => Promise
    selectDirectory: () => Promise<string | null>
    getRuntimeInfo: () => Promise<{
      appVersion: string
      electronVersion: string
      chromiumVersion: string
      nodeVersion: string
      v8Version: string
      platform: string
      architecture: string
    }>
    updateThemeOverlay: (theme: 'dark' | 'light') => void
  }
}
