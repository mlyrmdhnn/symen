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
  }
}
