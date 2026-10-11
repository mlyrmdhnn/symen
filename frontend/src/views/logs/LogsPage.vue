<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainTemplate from '@/template/MainTemplate.vue'
import { useServices } from '@/stores/services'

const route = useRoute()
const serviceStore = useServices()
const lines = ref<string[]>([])
const runningServices = ref<string[]>([])
const loading = ref(false)
const error = ref('')
let refreshInterval: ReturnType<typeof setInterval> | undefined

const serviceId = computed(() => {
  const value = route.query.service
  return typeof value === 'string' ? value : undefined
})
const heading = computed(() => (serviceId.value ? 'Service logs' : 'Global service logs'))

const refreshLogs = async () => {
  loading.value = lines.value.length === 0
  error.value = ''
  try {
    const response = await serviceStore.getLogs(serviceId.value)
    lines.value = response.lines
    runningServices.value = response.services ?? []
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
  } finally {
    loading.value = false
  }
}

watch(serviceId, () => void refreshLogs())

onMounted(() => {
  void refreshLogs()
  refreshInterval = setInterval(refreshLogs, 2000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <MainTemplate>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-bold text-lg text-white">{{ heading }}</h1>
        <p v-if="!serviceId" class="mt-1 text-sm text-slate-400">
          Combined output from {{ runningServices.length }} running service(s), refreshing every 2
          seconds.
        </p>
        <p v-else class="mt-1 text-sm text-slate-400">Refreshing automatically every 2 seconds.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          @click="refreshLogs"
        >
          Refresh
        </button>
        <RouterLink
          to="/services"
          class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Services
        </RouterLink>
      </div>
    </div>

    <p v-if="error" class="mt-4 text-sm text-red-400" role="alert">{{ error }}</p>

    <div class="mt-5 overflow-hidden rounded-lg border border-slate-800 bg-[#080B0E]">
      <div
        class="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400"
      >
        <span>{{ loading ? `${lines.length} log lines` : `${lines.length} log lines` }}</span>
        <span v-if="!serviceId" class="truncate pl-3">{{ runningServices.join(', ') }}</span>
      </div>
      <pre
        class="max-h-[70vh] min-h-128 overflow-auto p-4 font-mono text-xs leading-5 text-slate-300"
        >{{ lines.length ? lines.join('\n') : loading ? '' : 'No log output available yet.' }}</pre>
    </div>
  </MainTemplate>
</template>
