const { contextBridge, ipcRenderer } = require('electron')

// Keep the renderer call short; Electron handles the request in main.ts.
contextBridge.exposeInMainWorld('electronAPI', {
  runPython: (request) => ipcRenderer.invoke('backend-bridge', request),
})
