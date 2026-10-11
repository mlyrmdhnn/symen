const { contextBridge, ipcRenderer } = require('electron')

// Keep the renderer call short; Electron handles the request in main.ts.
contextBridge.exposeInMainWorld('electronAPI', {
  runPython: (request) => ipcRenderer.invoke('backend-bridge', request),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getRuntimeInfo: () => ipcRenderer.invoke('get-runtime-info'),
  updateThemeOverlay: (theme) => ipcRenderer.send('update-theme-overlay', theme),
})
