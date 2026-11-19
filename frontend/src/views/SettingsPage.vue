<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import { useWorkspaceStore, type ThemeMode } from '@/stores/workspace'
import useSettings from '@/composables/useSettings'
import { onMounted } from 'vue'
import LetterS from '@/components/LetterS.vue'

const workspace = useWorkspaceStore()
const { deviceData, getDeviceSpecs } = useSettings()

const themes: { value: ThemeMode; title: string; description: string }[] = [
  { value: 'light', title: 'Light', description: 'A crisp, bright workspace' },
  { value: 'dark', title: 'Dark', description: 'Easy on the eyes, day or night' },
  { value: 'system', title: 'System', description: 'Follows your device settings' },
]

onMounted(() => {
  getDeviceSpecs()
})
</script>

<template>
  <MainTemplate>
    <section class="mb-8">
      <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
        <span class="h-0.5 w-4 bg-accent"></span> PREFERENCES
      </p>
      <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary">Settings</h1>
      <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
        Make Symen feel right for the way you work.
      </p>
    </section>

    <div>
      <div class="grid gap-4">
        <section id="appearance" class="rounded-2xl border border-subtle bg-elevated p-6">
          <div class="flex items-center gap-4 border-b border-subtle pb-5">
            <span class="grid size-10 place-items-center rounded-xl bg-soft text-accent">◐</span>
            <div>
              <h2 class="text-base font-semibold tracking-tight">Appearance</h2>
              <p class="mt-1 text-sm text-muted">Customize how Sockyard looks on this device.</p>
            </div>
          </div>
          <div class="py-5">
            <strong class="text-sm font-semibold">Color theme</strong>
            <p class="mt-1 text-sm text-muted">Choose your preferred appearance.</p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              v-for="theme in themes"
              :key="theme.value"
              type="button"
              :class="[
                'rounded-xl border p-3 text-left transition-colors duration-150 hover:bg-soft focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none',
                workspace.theme === theme.value
                  ? 'border-accent ring-1 ring-accent'
                  : 'border-subtle',
              ]"
              @click="workspace.theme = theme.value"
            >
              <span
                :class="[
                  'mb-2 flex h-16 gap-1 rounded border p-2',
                  theme.value === 'dark'
                    ? 'border-[#314365] bg-[#14213D]'
                    : theme.value === 'system'
                      ? 'border-subtle bg-gradient-to-r from-[#FAF7F2] to-[#14213D]'
                      : 'border-subtle bg-[#FAF7F2]',
                ]"
                ><span
                  :class="[
                    'w-1/4 rounded-sm',
                    theme.value === 'dark'
                      ? 'bg-[#1B2C4F]'
                      : theme.value === 'system'
                        ? 'bg-gradient-to-r from-[#FFFDF9] to-[#1B2C4F]'
                        : 'bg-[#FFFDF9]',
                  ]"
                ></span
                ><span
                  :class="[
                    'flex-1 rounded-sm p-1',
                    theme.value === 'dark'
                      ? 'bg-[#1B2C4F]'
                      : theme.value === 'system'
                        ? 'bg-gradient-to-r from-[#FFFDF9] to-[#1B2C4F]'
                        : 'bg-[#FFFDF9]',
                  ]"
                  ><i
                    class="block h-1 w-1/2 rounded"
                    :class="theme.value === 'dark' ? 'bg-[#F4EDE0]' : 'bg-[#14213D]'"
                  ></i
                  ><i class="mt-1 block h-3 rounded bg-[#E6DFD1]"></i></span
              ></span>
              <strong class="block text-sm">{{ theme.title }}</strong
              ><small class="mt-1 block text-xs text-muted">{{ theme.description }}</small>
            </button>
          </div>
          <div
            class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-5"
          >
            <div>
              <strong class="text-sm font-semibold">Accent color</strong>
              <p class="mt-1 text-sm text-muted">Used for actions and focus.</p>
            </div>
            <span class="flex items-center gap-2 text-sm font-semibold"
              ><i class="size-3 rounded-full bg-accent"></i> Navy & cream
              <code class="font-mono text-xs text-muted">Adaptive</code></span
            >
          </div>
        </section>

        <section id="workspace" class="rounded-2xl border border-subtle bg-elevated p-6">
          <div class="flex items-center gap-4 border-b border-subtle pb-5">
            <span class="grid size-10 place-items-center rounded-xl bg-soft text-accent">⌂</span>
            <div>
              <h2 class="text-base font-semibold tracking-tight">Workspace</h2>
              <p class="mt-1 text-sm text-muted">Your local development environment details.</p>
            </div>
          </div>
          <div class="flex min-h-14 items-center justify-between border-b border-subtle text-sm">
            <span class="text-muted">Workspace name</span
            ><strong
              >Symen workspace
              <button
                class="ml-2 text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
                type="button"
              >
                Edit
              </button></strong
            >
          </div>
          <div class="flex min-h-14 items-center justify-between border-b border-subtle text-sm">
            <span class="text-muted">Environment</span
            ><strong
              ><i class="mr-1 inline-block size-1.5 rounded-full bg-emerald-500"></i>Local
              development</strong
            >
          </div>
          <div class="flex min-h-14 items-center justify-between text-sm">
            <span class="text-muted">Data source</span
            ><strong
              >Mock data
              <span class="ml-1 rounded bg-soft px-2 py-1 text-xs text-accent"
                >PREVIEW</span
              ></strong
            >
          </div>
        </section>

        <section
          id="about"
          class="flex items-center gap-4 rounded-2xl border border-subtle bg-elevated p-5"
        >
          <LetterS class="size-9" />

          <div class="flex-1">
            <strong class="text-sm font-semibold"
              >Symen <span class="ml-1 font-normal text-muted">v2.0.0</span></strong
            >
            <p class="mt-1 text-sm text-muted">
              A calmer way to manage local development processes · Frontend preview.
            </p>
          </div>
          <span class="rounded-lg bg-soft px-3 py-2 text-xs font-bold text-accent">PREVIEW</span>
        </section>

        <section id="deviceInformation" class="rounded-2xl border border-subtle bg-elevated p-6">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between border-b border-subtle pb-5">
            <div>
              <p
                class="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted"
              >
                <span class="h-0.5 w-3 bg-accent"></span> HARDWARE & ENVIRONMENT
              </p>
              <h2 class="text-lg font-semibold tracking-tight text-primary">Device Information</h2>
            </div>
            <span class="rounded-lg bg-soft px-3 py-2 font-mono text-xs font-semibold text-accent">
              {{ deviceData?.os_name }} {{ deviceData?.os_version }}
            </span>
          </div>

          <!-- Grid Spesifikasi Utama -->
          <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-xl border border-subtle bg-surface p-4">
              <p class="text-xs font-semibold text-muted">Device Name</p>
              <p class="mt-2 truncate font-mono text-sm font-semibold text-primary">
                {{ deviceData?.device_name || '-' }}
              </p>
            </div>

            <div class="rounded-xl border border-subtle bg-surface p-4">
              <p class="text-xs font-semibold text-muted">Operating System</p>
              <p class="mt-2 truncate font-mono text-sm font-semibold text-primary">
                {{ deviceData ? `${deviceData.os_name} ${deviceData.os_version}` : '-' }}
              </p>
            </div>

            <div class="rounded-xl border border-subtle bg-surface p-4">
              <p class="text-xs font-semibold text-muted">Timezone</p>
              <p class="mt-2 truncate font-mono text-sm font-semibold text-primary">
                {{ Intl.DateTimeFormat().resolvedOptions().timeZone }}
              </p>
            </div>

            <div class="rounded-xl border border-subtle bg-surface p-4 sm:col-span-2 lg:col-span-1">
              <p class="text-xs font-semibold text-muted">Processor</p>
              <p
                class="mt-2 truncate font-mono text-sm font-semibold text-primary"
                :title="deviceData?.processor"
              >
                {{ deviceData?.processor || '-' }}
              </p>
            </div>

            <div class="rounded-xl border border-subtle bg-surface p-4">
              <p class="text-xs font-semibold text-muted">CPU Cores</p>
              <p class="mt-2 font-mono text-sm font-semibold text-primary tabular-nums">
                {{ deviceData?.cpu_cores ? `${deviceData.cpu_cores} Logical Cores` : '-' }}
              </p>
            </div>

            <div class="rounded-xl border border-subtle bg-surface p-4">
              <p class="text-xs font-semibold text-muted">Total Memory (RAM)</p>
              <p class="mt-2 font-mono text-sm font-semibold text-primary tabular-nums">
                {{ deviceData?.total_ram_gb ? `${deviceData.total_ram_gb} GB` : '-' }}
              </p>
            </div>
          </div>

          <!-- Storage / Disks -->
          <div v-if="deviceData?.disks?.length">
            <p class="mb-3 text-xs font-bold tracking-[0.16em] text-muted">STORAGE PARTITIONS</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="disk in deviceData.disks"
                :key="disk.mount_point"
                class="rounded-xl border border-subtle bg-surface p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="grid size-8 place-items-center rounded-lg bg-soft font-mono text-xs font-bold text-accent"
                    >
                      {{ disk.mount_point.replace('\\', '') }}
                    </span>
                    <div>
                      <p class="text-sm font-semibold text-primary">
                        {{ disk.name || 'Local Disk' }} ({{ disk.mount_point }})
                      </p>
                      <p class="font-mono text-xs text-muted">{{ disk.file_system }}</p>
                    </div>
                  </div>
                  <span class="font-mono text-sm font-bold text-primary tabular-nums">
                    {{ Math.round((disk.used_gb / disk.total_gb) * 100) }}%
                  </span>
                </div>

                <!-- Progress Bar -->
                <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-soft">
                  <div
                    class="h-full rounded-full transition-[width] duration-300 ease-out"
                    :class="disk.used_gb / disk.total_gb > 0.85 ? 'bg-red-500' : 'bg-accent'"
                    :style="{ width: `${Math.min(100, (disk.used_gb / disk.total_gb) * 100)}%` }"
                  ></div>
                </div>

                <!-- Detail Kapasitas -->
                <div class="mt-3 flex justify-between font-mono text-xs text-muted tabular-nums">
                  <span>Used: {{ disk.used_gb }} GB</span>
                  <span>Free: {{ disk.available_gb }} GB / {{ disk.total_gb }} GB</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </MainTemplate>
</template>
