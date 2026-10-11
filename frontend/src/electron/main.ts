import electron from 'electron' // <-- Ubah ke default import
import type { BrowserWindow as BrowserWindowInstance } from 'electron'
import { execFile } from 'node:child_process'
import { createConnection } from 'node:net'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

// Ambil propertinya via destructuring dari objek default electron
const { app, BrowserWindow, dialog, ipcMain } = electron
const runPython = promisify(execFile)

let mainWindow: BrowserWindowInstance | null = null

// Wait for Vite because both processes start together in the dev script.
async function waitForVite(): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const isReady = await new Promise<boolean>((resolve) => {
      const socket = createConnection({ host: '127.0.0.1', port: 5173 })
      socket.once('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.once('error', () => resolve(false))
    })

    if (isReady) return
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error('Vite did not start at http://localhost:5173')
}

async function createWindow(): Promise<void> {
  if (!app.isPackaged) await waitForVite()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(
      app.getAppPath(),
      app.isPackaged ? 'dist/symen_logo.ico' : 'public/symen_logo.ico',
    ),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#020617',
      symbolColor: '#94a3b8',
      height: 64,
    },
    webPreferences: {
      preload: path.join(
        app.getAppPath(),
        app.isPackaged ? 'dist-electron/preload.cjs' : 'src/electron/preload.cjs',
      ),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  ipcMain.on('update-theme-overlay', (_event, theme: 'dark' | 'light') => {
    if (!mainWindow) return
    if (theme == 'dark') {
      mainWindow.setTitleBarOverlay({
        color: '#020617',
        symbolColor: '#94a3b8',
        height: 64,
      })
    } else {
      mainWindow.setTitleBarOverlay({
        color: '#f8fafc',
        symbolColor: '#475569',
        height: 64,
      })
    }
  })

  ipcMain.handle('backend-bridge', async (_event, data) => {
    const backend = app.isPackaged
      ? path.join(process.resourcesPath, 'backend')
      : path.resolve(app.getAppPath(), '..', 'backend')
    const executable = app.isPackaged
      ? path.join(backend, 'symen-backend.exe')
      : path.join(backend, 'venv', 'Scripts', 'python.exe')
    const script = path.join(backend, 'main.py')
    const jsonPayload = JSON.stringify(data)
    const args = app.isPackaged ? [jsonPayload] : [script, jsonPayload]

    if (!existsSync(executable)) {
      throw new Error(`Python backend executable was not found: ${executable}`)
    }

    const { stdout } = await runPython(executable, args, {
      cwd: backend,
      env: app.isPackaged
        ? {
            ...process.env,
            SYMEN_DATA_DIR: app.getPath('userData'),
            SYMEN_CONFIG_DIR: app.getPath('userData'),
          }
        : process.env,
      windowsHide: true,
    })

    if (!stdout || stdout.trim() === '') {
      throw new Error('Python backend tidak mengembalikan output apa pun (stdout kosong).')
    }

    return JSON.parse(stdout)
  })

  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

  ipcMain.handle('get-runtime-info', () => ({
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    chromiumVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    v8Version: process.versions.v8,
    platform: process.platform,
    architecture: process.arch,
  }))

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'))
  } else {
    await mainWindow.loadURL('http://127.0.0.1:5173')
  }
}

app
  .whenReady()
  .then(createWindow)
  .catch((error: unknown) => {
    console.error('Could not create the app window:', error)
    app.quit()
  })
