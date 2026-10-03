import electron from 'electron' // <-- Ubah ke default import
import type { BrowserWindow as BrowserWindowInstance } from 'electron'
import { execFile } from 'node:child_process'
import { createConnection } from 'node:net'
import path from 'node:path'
import { promisify } from 'node:util'

// Ambil propertinya via destructuring dari objek default electron
const { app, BrowserWindow, ipcMain } = electron
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
  await waitForVite()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#020617',
      symbolColor: '#94a3b8',
      height: 64,
    },
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/electron/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  ipcMain.handle('backend-bridge', async (_event, data) => {
    const backend = path.resolve(app.getAppPath(), '..', 'backend')
    const python = path.join(backend, 'venv', 'Scripts', 'python.exe')
    const script = path.join(backend, 'main.py')

    // 'data' adalah objek request dari frontend (method, url, payload)
    // Kita ubah jadi string JSON agar bisa ditangkap oleh sys.argv[1] di Python
    const jsonPayload = JSON.stringify(data)

    // Kirim HANYA script path dan string JSON payload-nya
    const { stdout } = await runPython(python, [script, jsonPayload], {
      windowsHide: true,
    })

    // Pastikan stdout tidak kosong sebelum di-parse
    if (!stdout || stdout.trim() === '') {
      throw new Error('Python backend tidak mengembalikan output apa pun (stdout kosong).')
    }

    return JSON.parse(stdout)
  })

  await mainWindow.loadURL('http://127.0.0.1:5173')
}

app
  .whenReady()
  .then(createWindow)
  .catch((error: unknown) => {
    console.error('Could not create the app window:', error)
    app.quit()
  })
