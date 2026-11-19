<script setup lang="ts">
import { ref } from 'vue'
import LoadingUI from '@/components/LoadingUI.vue'
import { open } from '@tauri-apps/plugin-dialog'

const date = new Date()

const dateTime = date
  .toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  .toUpperCase()

interface ServiceSetup {
  id: string
  name: string
  versions: string[]
  selectedVersion: string
  path: string
  progress: number
  status: 'idle' | 'downloading' | 'installed'
}

const services = ref<ServiceSetup[]>([
  {
    id: 'php',
    name: 'PHP',
    versions: ['8.5.0', '8.4.2', '8.3.14', '8.2.26'],
    selectedVersion: '8.5.0',
    path: 'C:\\symen\\bin\\php\\php-8.5.0',
    progress: 35,
    status: 'downloading',
  },
  {
    id: 'nginx',
    name: 'Nginx',
    versions: ['1.27.3', '1.26.2', '1.24.0'],
    selectedVersion: '1.27.3',
    path: 'C:\\symen\\bin\\nginx\\nginx-1.27.3',
    progress: 0,
    status: 'idle',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    versions: ['9.1.0', '8.4.3', '8.0.40'],
    selectedVersion: '8.4.3',
    path: 'C:\\symen\\bin\\mysql\\mysql-8.4.3',
    progress: 100,
    status: 'installed',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    versions: ['22.11.0 LTS', '23.3.0', '20.18.1 LTS'],
    selectedVersion: '22.11.0 LTS',
    path: 'C:\\symen\\bin\\node\\v22.11.0',
    progress: 0,
    status: 'idle',
  },
])

// Update otomatis folder path saat versi diganti
const handleVersionChange = (service: ServiceSetup) => {
  const cleanVersion = service.selectedVersion.split(' ')[0]
  const baseFolder = service.path.substring(0, service.path.lastIndexOf('\\'))
  const prefix = service.id === 'nodejs' ? 'v' : `${service.id}-`
  service.path = `${baseFolder}\\${prefix}${cleanVersion}`
}

// Simulasi dummy progress download saat tombol diklik
const startDownload = (service: ServiceSetup) => {
  if (service.status === 'downloading') return

  service.status = 'downloading'
  service.progress = 0

  const interval = setInterval(() => {
    service.progress += Math.floor(Math.random() * 18) + 8
    if (service.progress >= 100) {
      service.progress = 100
      service.status = 'installed'
      clearInterval(interval)
    }
  }, 350)
}

const selectFolder = async (service: ServiceSetup): Promise<void> => {
  try {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      defaultPath: service.path,
      title: `Pilih Folder Instalasi ${service.name}`,
    })

    if (typeof selectedPath === 'string') {
      service.path = selectedPath
    }
  } catch (err) {
    console.error('Gagal memilih folder:', err)
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
        </p>
      </div>

      <!-- Main Container Card (Sesuai kotak besar di sketsa) -->
      <div class="mt-8 rounded-2xl border border-subtle bg-elevated p-5 sm:p-6">
        <div class="divide-y divide-subtle">
          <div
            v-for="(service, index) in services"
            :key="service.id"
            class="py-5 first:pt-0 last:pb-0"
          >
            <!-- Top Row: Nama Service | Mini Select Versi | Input Path | Tombol Download -->
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <!-- Kiri: Nama Service + Mini Select Option Versi -->
              <div class="flex items-center gap-3">
                <span class="min-w-20 text-base font-semibold tracking-tight text-primary">
                  {{ service.name }}
                </span>

                <!-- Select Option Mini -->
                <div class="relative">
                  <select
                    v-model="service.selectedVersion"
                    @change="handleVersionChange(service)"
                    :disabled="service.status === 'downloading'"
                    class="h-8 appearance-none rounded-lg border border-subtle bg-soft pl-2.5 pr-7 text-xs font-medium text-primary transition-colors hover:border-primary/30 focus:border-accent focus:outline-none disabled:opacity-50 cursor-pointer"
                  >
                    <option
                      v-for="ver in service.versions"
                      :key="ver"
                      :value="ver"
                      class="bg-elevated text-primary"
                    >
                      {{ ver }}
                    </option>
                  </select>
                  <!-- Custom Chevron Icon -->
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

              <!-- Kanan: Input Path + Tombol Download -->
              <div class="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center lg:max-w-2xl">
                <!-- Input Path -->
                <div class="relative flex-1">
                  <input
                    readonly
                    @click="selectFolder(service)"
                    v-model="service.path"
                    type="text"
                    placeholder="Service installation path..."
                    :disabled="service.status === 'downloading'"
                    class="h-9 w-full rounded-lg border border-subtle bg-surface px-3 font-mono text-xs text-primary placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
                  />
                </div>

                <!-- Tombol Download -->
                <button
                  type="button"
                  @click="startDownload(service)"
                  :disabled="service.status === 'downloading'"
                  class="inline-flex h-9 w-max shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none cursor-pointer disabled:cursor-not-allowed"
                  :class="
                    service.status === 'installed'
                      ? 'border border-subtle bg-soft text-primary hover:border-primary/30'
                      : 'bg-accent text-accent-fg hover:opacity-90 disabled:opacity-70'
                  "
                >
                  <!-- Icon Download -->
                  <svg
                    v-if="service.status !== 'installed'"
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
                        ? `${service.progress}%`
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
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="mt-6 flex items-center justify-end">
        <routerLink
          to="/"
          type="button"
          class="inline-flex min-h-11 w-max items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg transition-opacity duration-150 hover:opacity-90 cursor-pointer"
        >
          Finish & Go to Dashboard
        </routerLink>
      </div>
    </div>
  </div>
</template>
