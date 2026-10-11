<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Monitor, RefreshCw, ShieldCheck, Wrench } from '@lucide/vue'
import MainTemplate from '@/template/MainTemplate.vue'

interface RuntimeInfo {
  appVersion: string
  electronVersion: string
  chromiumVersion: string
  nodeVersion: string
  v8Version: string
  platform: string
  architecture: string
}

const runtimeInfo = ref<RuntimeInfo | null>(null)
const isLoading = ref(false)
const loadError = ref('')

const platformLabel = computed(() => {
  if (!runtimeInfo.value) return 'Unavailable'
  const names: Record<string, string> = {
    darwin: 'macOS',
    linux: 'Linux',
    win32: 'Windows',
  }
  return `${names[runtimeInfo.value.platform] ?? runtimeInfo.value.platform} (${runtimeInfo.value.architecture})`
})

const loadRuntimeInfo = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    if (!window.electronAPI?.getRuntimeInfo) {
      throw new Error('Runtime details are only available in the desktop application.')
    }
    runtimeInfo.value = await window.electronAPI.getRuntimeInfo()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => void loadRuntimeInfo())

const componentRows = computed(() => [
  { label: 'Electron', value: runtimeInfo.value?.electronVersion },
  { label: 'Chromium', value: runtimeInfo.value?.chromiumVersion },
  { label: 'Node.js', value: runtimeInfo.value?.nodeVersion },
  { label: 'V8 JavaScript engine', value: runtimeInfo.value?.v8Version },
])
</script>

<template>
  <MainTemplate>
    <div class="">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 class="text-xl font-bold text-white">About Symen</h1>
          <p class="mt-1 text-xs text-slate-400">
            Application details and the runtime powering this desktop environment.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span class="text-xs font-mono text-emerald-400">Native service manager</span>
        </div>
      </div>

      <p
        v-if="loadError"
        class="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        role="alert"
      >
        {{ loadError }}
      </p>

      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <section
          class="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-[#10151A] p-6 text-center"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/10 text-blue-400"
          >
            <Wrench class="h-8 w-8" />
          </div>
          <h2 class="text-base font-semibold text-white">Symen</h2>
          <p class="mt-1 font-mono text-xs text-blue-400">
            {{ runtimeInfo ? `v${runtimeInfo.appVersion}` : 'Version unavailable' }}
          </p>
          <p class="mt-3 text-xs leading-relaxed text-slate-400">
            Manage native development services running on your machine.
          </p>
          <button
            class="mt-6 flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-50"
            :disabled="isLoading"
            @click="loadRuntimeInfo"
          >
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
            {{ isLoading ? 'Refreshing details...' : 'Refresh runtime details' }}
          </button>
        </section>

        <section class="rounded-lg border border-slate-800 bg-[#10151A] p-6 md:col-span-2">
          <div class="flex items-center gap-2">
            <Monitor class="h-4 w-4 text-blue-400" />
            <h3 class="text-sm font-medium text-slate-200">Desktop runtime</h3>
          </div>
          <div class="mt-4 divide-y divide-slate-800/60 text-xs">
            <div
              v-for="row in componentRows"
              :key="row.label"
              class="flex items-center justify-between gap-4 py-3"
            >
              <span class="text-slate-400">{{ row.label }}</span>
              <span
                class="rounded border border-slate-700/50 bg-slate-800/80 px-2 py-1 font-mono text-white"
              >
                {{ row.value ?? 'Unavailable' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <span class="text-slate-400">Operating system</span>
              <span
                class="rounded border border-slate-700/50 bg-slate-800/80 px-2 py-1 font-mono text-white"
              >
                {{ platformLabel }}
              </span>
            </div>
          </div>

          <div
            class="mt-4 flex items-start gap-2 border-t border-slate-800/60 pt-4 text-[11px] leading-relaxed text-slate-500"
          >
            <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p>
              Version information is read from the running desktop app. Symen manages local
              processes directly; it does not require Docker or Kubernetes.
            </p>
          </div>
        </section>
      </div>
    </div>
  </MainTemplate>
</template>
