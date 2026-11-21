<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import LoadingUI from '@/components/LoadingUI.vue'
import { open } from '@tauri-apps/plugin-dialog'
import { useRouter } from 'vue-router'
import useInvoke from '@/lib/http'

export interface ServiceDetail {
  id: string
  name: string
  channel: string
  version: string
  url: string
  sha256: string | null
  strip_prefix: string | null
  bin_subpath: string
  executable: string
  default_port: number | null
  needs_init: boolean
  vc_redist_required: boolean
  variant?: string | null
  recommended_for?: string[] | null
  cli_executable?: string | null
  apache_module?: string | null
}

export interface ManifestInstance {
  schema_version: number
  updated_at: string
  services: Record<string, ServiceDetail[]>
}

interface ServiceSetup {
  key: string
  label: string
  packages: ServiceDetail[]
  selectedId: string
  path: string
  progress: number
  status: 'idle' | 'downloading' | 'installed'
  installedPackageIds: string[]
  cancelRequested: boolean
  stage: 'downloading' | 'verifying' | 'extracting' | 'done' | null
  error: string | null
}

interface DownloadProgress {
  service_key: string
  package_id: string
  stage: 'downloading' | 'verifying' | 'extracting' | 'done'
  progress: number
}

const { data, pending, error } = useInvoke<ManifestInstance>('get_service_manifest')
const router = useRouter()

const date = new Date()
const dateTime = date
  .toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  .toUpperCase()

const CATEGORY_ORDER = ['php', 'nginx', 'apache', 'node', 'mysql', 'postgresql']

const CATEGORY_LABELS: Record<string, string> = {
  php: 'PHP',
  nginx: 'Nginx',
  apache: 'Apache',
  node: 'Node.js',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
}

const services = ref<ServiceSetup[]>([])

// Map data manifest dari Rust ke state UI saat berhasil di-load
watch(
  data,
  (manifest) => {
    if (!manifest?.services) return

    services.value = CATEGORY_ORDER.flatMap((key) => {
      const packages = manifest.services[key]
      const defaultPkg = packages?.[0]
      if (!packages?.length || !defaultPkg) return []

      return [
        {
          key,
          label: CATEGORY_LABELS[key] ?? key.toUpperCase(),
          packages,
          selectedId: defaultPkg.id,
          path: `C:\\symen\\bin\\${key}\\${defaultPkg.id}`,
          progress: 0,
          status: 'idle',
          installedPackageIds: [],
          cancelRequested: false,
          stage: null,
          error: null,
        },
      ]
    })
  },
  { immediate: true },
)

const selectedPackage = (service: ServiceSetup): ServiceDetail | undefined => {
  return service.packages.find((pkg) => pkg.id === service.selectedId)
}

// Update otomatis folder path saat pilihan versi/varian di dropdown diganti
const handleVersionChange = (service: ServiceSetup) => {
  const pkg = selectedPackage(service)
  if (!pkg) return

  const lastSlashIdx = service.path.lastIndexOf('\\')
  const baseFolder =
    lastSlashIdx !== -1 ? service.path.substring(0, lastSlashIdx) : `C:\\symen\\bin\\${service.key}`

  service.path = `${baseFolder}\\${pkg.id}`
  const isInstalled = service.installedPackageIds.includes(pkg.id)
  service.status = isInstalled ? 'installed' : 'idle'
  service.progress = isInstalled ? 100 : 0
  service.stage = isInstalled ? 'done' : null
  service.error = null
}

let unlistenProgress: UnlistenFn | undefined

onMounted(async () => {
  unlistenProgress = await listen<DownloadProgress>('download-progress', ({ payload }) => {
    const service = services.value.find(
      (item) => item.key === payload.service_key && item.selectedId === payload.package_id,
    )
    if (!service) return

    service.progress = payload.progress
    service.stage = payload.stage
    if (payload.stage === 'done') {
      service.cancelRequested = false
      if (!service.installedPackageIds.includes(payload.package_id)) {
        service.installedPackageIds.push(payload.package_id)
      }
      service.status = 'installed'
      service.error = null
    } else {
      if (payload.stage === 'extracting') {
        service.installedPackageIds = service.installedPackageIds.filter(
          (id) => id !== payload.package_id,
        )
      }
      service.status = 'downloading'
    }
  })
})

onBeforeUnmount(() => {
  unlistenProgress?.()
})

const startDownload = async (service: ServiceSetup) => {
  if (service.status === 'downloading') return
  const packageDetail = selectedPackage(service)
  if (!packageDetail) return

  service.status = 'downloading'
  service.progress = 0
  service.cancelRequested = false
  service.stage = 'downloading'
  service.error = null
  try {
    await invoke('install_service_package', {
      serviceKey: service.key,
      package: packageDetail,
      targetPath: service.path,
    })
  } catch (err) {
    const stillInstalled = service.installedPackageIds.includes(packageDetail.id)
    service.status = stillInstalled ? 'installed' : 'idle'
    service.progress = stillInstalled ? 100 : 0
    service.stage = stillInstalled ? 'done' : null
    if (!service.cancelRequested) {
      service.error = err instanceof Error ? err.message : String(err)
    }
    service.cancelRequested = false
  }
}

const cancelDownload = async (service: ServiceSetup) => {
  if (service.status !== 'downloading' || service.stage !== 'downloading') return

  const packageDetail = selectedPackage(service)
  if (!packageDetail) return

  service.cancelRequested = true
  service.error = null
  try {
    await invoke('cancel_service_package', {
      serviceKey: service.key,
      packageId: packageDetail.id,
    })
  } catch (err) {
    service.cancelRequested = false
    service.error = err instanceof Error ? err.message : String(err)
  }
}

const selectFolder = async (service: ServiceSetup): Promise<void> => {
  try {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      defaultPath: service.path,
      title: `Pilih Folder Instalasi ${service.label}`,
    })

    if (typeof selectedPath === 'string') {
      service.path = selectedPath
    }
  } catch (err) {
    console.error('Gagal memilih folder:', err)
  }
}

const manifestUpdatedAt = computed(() => data.value?.updated_at ?? null)
const isDownloading = computed(() =>
  services.value.some((service) => service.status === 'downloading'),
)
const installedCount = computed(
  () => services.value.filter((service) => service.installedPackageIds.length > 0).length,
)
const canFinish = computed(() => !isDownloading.value && installedCount.value > 0)

const stageLabel = (stage: ServiceSetup['stage']): string => {
  switch (stage) {
    case 'downloading':
      return 'Downloading...'
    case 'verifying':
      return 'Verifying SHA256...'
    case 'extracting':
      return 'Extracting...'
    case 'done':
      return 'Installed'
    default:
      return ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface p-6 sm:p-8 lg:p-10 text-primary">
    <div class="mx-auto">
      <!-- Header -->
      <div>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
          <span class="h-0.5 w-4 bg-accent"></span> {{ dateTime }}
        </p>
        <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
          Setup your service.
        </h1>
        <p class="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          You can manually configure the path that you put the services too.
          <span v-if="manifestUpdatedAt" class="ml-1 font-mono text-xs text-muted/80">
            (Registry: {{ manifestUpdatedAt }})
          </span>
        </p>
      </div>

      <!-- Main Container Card -->
      <div class="mt-8 rounded-2xl border border-subtle bg-elevated p-5 sm:p-6">
        <!-- Loading State -->
        <div v-if="pending && services.length === 0" class="flex items-center justify-center py-12">
          <div class="flex items-center gap-3 text-sm text-muted">
            <LoadingUI />
            <span>Loading service registry...</span>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error && services.length === 0"
          class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400"
        >
          Failed to load manifest: {{ error }}
        </div>

        <!-- Service List -->
        <div v-else class="divide-y divide-subtle">
          <div v-for="service in services" :key="service.key" class="py-5 first:pt-0 last:pb-0">
            <!-- Top Row: Nama Service | Mini Select Versi | Input Path | Tombol Download -->
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <!-- Kiri: Nama Service + Mini Select Option Versi -->
              <div class="flex items-center gap-3">
                <span class="min-w-24 text-base font-semibold tracking-tight text-primary">
                  {{ service.label }}
                </span>

                <!-- Select Option Mini -->
                <div class="relative">
                  <select
                    v-model="service.selectedId"
                    @change="handleVersionChange(service)"
                    :disabled="service.status === 'downloading'"
                    class="h-8 appearance-none rounded-lg border border-subtle bg-soft pl-2.5 pr-7 text-xs font-medium text-primary transition-colors hover:border-primary/30 focus:border-accent focus:outline-none disabled:opacity-50 cursor-pointer"
                  >
                    <option
                      v-for="pkg in service.packages"
                      :key="pkg.id"
                      :value="pkg.id"
                      class="bg-elevated text-primary"
                    >
                      {{ pkg.name }}
                    </option>
                  </select>

                  <svg
                    class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div class="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center lg:max-w-2xl">
                <div class="relative flex-1">
                  <input
                    readonly
                    @click="selectFolder(service)"
                    v-model="service.path"
                    type="text"
                    placeholder="Service installation path..."
                    :disabled="service.status === 'downloading'"
                    class="h-9 w-full rounded-lg border border-subtle bg-surface px-3 font-mono text-xs text-primary placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none disabled:opacity-60 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  @click="
                    service.status === 'downloading'
                      ? cancelDownload(service)
                      : startDownload(service)
                  "
                  :disabled="
                    service.status === 'downloading' &&
                    (service.stage !== 'downloading' || service.cancelRequested)
                  "
                  class="inline-flex h-9 w-max shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none cursor-pointer disabled:cursor-not-allowed"
                  :class="
                    service.status === 'downloading'
                      ? 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-70'
                      : service.status === 'installed'
                        ? 'border border-subtle bg-soft text-primary hover:border-primary/30'
                        : 'bg-accent text-accent-fg hover:opacity-90 disabled:opacity-70'
                  "
                >
                  <svg
                    v-if="service.status === 'downloading' && service.stage === 'downloading'"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <svg
                    v-else-if="service.status !== 'installed'"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <!-- Icon Check jika selesai -->
                  <svg
                    v-else
                    class="h-3.5 w-3.5 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>

                  <span>
                    {{
                      service.status === 'downloading'
                        ? service.cancelRequested
                          ? 'Cancelling...'
                          : service.stage === 'downloading'
                            ? 'Cancel'
                            : `${service.progress}%`
                        : service.status === 'installed'
                          ? 'Reinstall'
                          : 'Download'
                    }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Bottom Row: Progress Bar + Komponen LoadingUI (Titik 3 di kanan) -->
            <div class="mt-3 flex items-center gap-3">
              <!-- Track Progress Bar -->
              <div class="h-2 flex-1 overflow-hidden rounded-full border border-subtle bg-surface">
                <div
                  class="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                  :style="{ width: `${service.progress}%` }"
                ></div>
              </div>

              <!-- Komponen Titik 3 Milikmu -->
              <div class="flex w-8 shrink-0 items-center justify-end">
                <LoadingUI v-if="service.status === 'downloading'" />
                <span v-else class="font-mono text-[11px] text-muted">
                  {{ service.progress }}%
                </span>
              </div>
            </div>
            <div v-if="service.error" class="mt-2 text-xs text-red-400" role="alert">
              {{ service.error }}
            </div>
            <div v-else-if="service.stage" class="mt-2 text-xs text-muted" aria-live="polite">
              {{ stageLabel(service.stage) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="mt-6 flex items-center justify-end gap-2">
        <button
          :disabled="isDownloading"
          class="inline-flex min-h-11 w-max items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg transition-opacity duration-150 hover:opacity-90"
          @click="router.push('/setup')"
          :class="[
            isDownloading ? ' cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer',
          ]"
        >
          Back
        </button>
        <button
          type="button"
          :disabled="!canFinish"
          @click="router.push('/')"
          class="inline-flex min-h-11 w-max items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg transition-opacity duration-150 hover:opacity-90"
          :class="
            canFinish ? 'cursor-pointer' : 'opacity-50 pointer-events-none cursor-not-allowed'
          "
        >
          Finish & Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>
