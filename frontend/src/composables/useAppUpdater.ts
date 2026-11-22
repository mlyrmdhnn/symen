import { getVersion } from '@tauri-apps/api/app'
import { isTauri } from '@tauri-apps/api/core'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { computed, readonly, ref } from 'vue'

const checking = ref(false)
const available = ref(false)
const checked = ref(false)
type UpdateMetadata = Pick<Update, 'version' | 'body' | 'date'>

const version = ref<UpdateMetadata['version'] | null>(null)
const notes = ref<UpdateMetadata['body'] | null>(null)
const date = ref<UpdateMetadata['date'] | null>(null)
const currentVersion = ref<string | null>(null)
const downloading = ref(false)
const downloadedBytes = ref(0)
const totalBytes = ref<number | null>(null)
const progress = computed(() =>
  totalBytes.value && totalBytes.value > 0
    ? Math.min(100, Math.round((downloadedBytes.value / totalBytes.value) * 100))
    : null,
)
const error = ref<string | null>(null)

let pendingUpdate: Update | null = null

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason)
}

function updateCheckErrorMessage(reason: unknown) {
  const message = errorMessage(reason)
  if (message.includes('invalid type:') && message.includes('expected')) {
    return `The configured updater endpoint returned JSON that is not a valid signed Tauri updater manifest. Publish the manifest described in backend/src-tauri/UPDATER.md. (${message})`
  }
  return message
}

async function checkForUpdates(options: { silent?: boolean } = {}): Promise<boolean> {
  if (!isTauri()) {
    if (!options.silent) {
      error.value = 'Update checks are available in the installed Symen app.'
    }
    return false
  }
  if (checking.value || downloading.value) return available.value

  checking.value = true
  error.value = null
  checked.value = false

  try {
    currentVersion.value = await getVersion()
    const nextUpdate = await check()
    if (pendingUpdate) await pendingUpdate.close()
    pendingUpdate = nextUpdate
    available.value = nextUpdate !== null
    version.value = nextUpdate?.version ?? null
    notes.value = nextUpdate?.body ?? null
    date.value = nextUpdate?.date ?? null
    checked.value = true
    return available.value
  } catch (reason) {
    error.value = updateCheckErrorMessage(reason)
    checked.value = true
    return false
  } finally {
    checking.value = false
  }
}

async function installUpdate(): Promise<boolean> {
  if (!isTauri()) {
    error.value = 'Updates can only be installed in the Symen desktop app.'
    return false
  }
  if (!pendingUpdate || downloading.value || checking.value) {
    error.value = 'Check for an update before installing.'
    return false
  }

  downloading.value = true
  downloadedBytes.value = 0
  totalBytes.value = null
  error.value = null

  try {
    await pendingUpdate.downloadAndInstall((event) => {
      if (event.event === 'Started') {
        totalBytes.value = event.data.contentLength ?? null
      } else if (event.event === 'Progress') {
        downloadedBytes.value += event.data.chunkLength
      } else {
        downloadedBytes.value = totalBytes.value ?? downloadedBytes.value
      }
    })
    await relaunch()
    return true
  } catch (reason) {
    error.value = errorMessage(reason)
    return false
  } finally {
    downloading.value = false
  }
}

export function useAppUpdater() {
  return {
    checking: readonly(checking),
    available: readonly(available),
    checked: readonly(checked),
    version: readonly(version),
    notes: readonly(notes),
    date: readonly(date),
    currentVersion: readonly(currentVersion),
    downloading: readonly(downloading),
    downloadedBytes: readonly(downloadedBytes),
    totalBytes: readonly(totalBytes),
    progress,
    error: readonly(error),
    checkForUpdates,
    installUpdate,
  }
}
