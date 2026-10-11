<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import MainTemplate from '@/template/MainTemplate.vue'
import Highcharts from 'highcharts'
import { useDashboard } from '@/composables/dashboard/useDashboard'
import { useSettings } from '@/stores/settings'
import { useServices } from '@/stores/services'

const dashboardStore = useDashboard()
const { chartData } = storeToRefs(dashboardStore)
const { getChartData } = dashboardStore
const settingsStore = useSettings()
const serviceStore = useServices()
const { resolvedTheme, realtimeChartToggle, earlyInitializeSettings, chartError } =
  storeToRefs(settingsStore)

const cpuChartRef = ref<HTMLElement | null>(null)
const ramChartRef = ref<HTMLElement | null>(null)

let cpuChart: Highcharts.Chart | null = null
let ramChart: Highcharts.Chart | null = null
let metricsInterval: ReturnType<typeof setInterval> | undefined
let servicesInterval: ReturnType<typeof setInterval> | undefined
let isDashboardMounted = false

const cpuUsage = ref(0)
const ramUsage = ref(0)
const ramUsed = ref(0)
const ramTotal = ref(0)
const hasMetrics = ref(false)
const metricsError = ref('')

const freeChartColor = () => (resolvedTheme.value === 'light' ? '#e2e8f0' : '#1e293b')
const clampPercent = (value: number) => Math.min(100, Math.max(0, Number(value) || 0))
const chartsEnabled = computed(() => !earlyInitializeSettings.value && realtimeChartToggle.value)

const serviceCounts = computed(() => ({
  total: serviceStore.services.length,
  running: serviceStore.services.filter((service) => service.status === 'running').length,
  stopped: serviceStore.services.filter((service) => service.status === 'stopped').length,
  errors: serviceStore.services.filter((service) => service.status === 'error').length,
}))

const recentServices = computed(() => serviceStore.services.slice(0, 5))

const refreshMetrics = async () => {
  if (!realtimeChartToggle.value) return
  metricsError.value = ''
  try {
    await getChartData()
  } catch (error) {
    metricsError.value = error instanceof Error ? error.message : String(error)
  }
}

const refreshAll = () => {
  if (realtimeChartToggle.value) void refreshMetrics()
  void serviceStore.loadServices()
}

const stopMetricsRefresh = () => {
  if (metricsInterval) {
    clearInterval(metricsInterval)
    metricsInterval = undefined
  }
}

const destroyCharts = () => {
  cpuChart?.destroy()
  ramChart?.destroy()
  cpuChart = null
  ramChart = null
}

const initCharts = () => {
  const chartOptions = {
    chart: {
      type: 'pie' as const,
      backgroundColor: 'transparent',
      height: 190,
      spacing: [0, 0, 0, 0],
    },
    title: { text: undefined },
    credits: { enabled: false },
    tooltip: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '78%',
        borderWidth: 0,
        dataLabels: { enabled: false },
        states: { hover: { enabled: false } },
      },
    },
  }

  if (cpuChartRef.value) {
    cpuChart = Highcharts.chart(cpuChartRef.value, {
      ...chartOptions,
      series: [
        {
          name: 'Usage',
          type: 'pie',
          data: [
            { name: 'Used', y: hasMetrics.value ? cpuUsage.value : 0, color: '#3b82f6' },
            {
              name: 'Free',
              y: hasMetrics.value ? +(100 - cpuUsage.value).toFixed(1) : 100,
              color: freeChartColor(),
            },
          ],
        },
      ],
    })
  }

  if (ramChartRef.value) {
    ramChart = Highcharts.chart(ramChartRef.value, {
      ...chartOptions,
      series: [
        {
          name: 'Usage',
          type: 'pie',
          data: [
            { name: 'Used', y: hasMetrics.value ? ramUsage.value : 0, color: '#10b981' },
            {
              name: 'Free',
              y: hasMetrics.value ? +(100 - ramUsage.value).toFixed(1) : 100,
              color: freeChartColor(),
            },
          ],
        },
      ],
    })
  }
}

watch(
  () => chartData.value,
  (newData) => {
    if (!newData) return

    const payload = newData
    if (!payload?.cpu || !payload?.ram) return

    cpuUsage.value = clampPercent(payload.cpu.usagePercent)
    ramUsage.value = clampPercent(payload.ram.usagePercent)
    ramUsed.value = Number(payload.ram.usedRam) || 0
    ramTotal.value = Number(payload.ram.ramTotal) || 0
    hasMetrics.value = true

    cpuChart?.series[0]?.setData(
      [
        { name: 'Used', y: cpuUsage.value, color: '#3b82f6' },
        { name: 'Free', y: +(100 - cpuUsage.value).toFixed(1), color: freeChartColor() },
      ],
      true,
    )
    ramChart?.series[0]?.setData(
      [
        { name: 'Used', y: ramUsage.value, color: '#10b981' },
        { name: 'Free', y: +(100 - ramUsage.value).toFixed(1), color: freeChartColor() },
      ],
      true,
    )
  },
  { deep: true, immediate: true },
)

watch(resolvedTheme, () => {
  const updateFreeSegment = (chart: Highcharts.Chart | null, usage: number, color: string) => {
    chart?.series[0]?.setData(
      [
        { name: 'Used', y: usage, color },
        { name: 'Free', y: +(100 - usage).toFixed(1), color: freeChartColor() },
      ],
      true,
    )
  }

  updateFreeSegment(cpuChart, cpuUsage.value, '#3b82f6')
  updateFreeSegment(ramChart, ramUsage.value, '#10b981')
})

const startMetricsRefresh = async () => {
  await nextTick()
  if (!isDashboardMounted || !chartsEnabled.value) return
  initCharts()
  await refreshMetrics()
  if (!isDashboardMounted || !chartsEnabled.value) return
  stopMetricsRefresh()
  metricsInterval = setInterval(() => void refreshMetrics(), 1000)
}

watch(chartsEnabled, (enabled) => {
  if (enabled) {
    void startMetricsRefresh()
    return
  }

  stopMetricsRefresh()
  destroyCharts()
  metricsError.value = ''
})

const statusClass = (status: string) => {
  if (status === 'running') return 'bg-emerald-500/10 text-emerald-400'
  if (status === 'error') return 'bg-red-500/10 text-red-400'
  return 'bg-slate-500/10 text-slate-400'
}

const statusLabel = (status: string) => {
  if (status === 'running') return 'Running'
  if (status === 'error') return 'Error'
  return 'Stopped'
}

onMounted(() => {
  isDashboardMounted = true
  void settingsStore.getChartToggle()
  if (chartsEnabled.value) void startMetricsRefresh()
  void serviceStore.loadServices()
  servicesInterval = setInterval(() => void serviceStore.loadServices(), 3000)
})

onUnmounted(() => {
  isDashboardMounted = false
  stopMetricsRefresh()
  if (servicesInterval) clearInterval(servicesInterval)
  destroyCharts()
})
</script>

<template>
  <MainTemplate>
    <section class="space-y-6">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Overview</p>
          <h1 class="mt-1 text-2xl font-bold text-white">Dashboard</h1>
          <p class="mt-1 text-sm text-slate-400">
            A live snapshot of this machine and your managed services.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            @click="refreshAll"
          >
            Refresh
          </button>
          <RouterLink
            to="/add-service"
            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Add service
          </RouterLink>
        </div>
      </header>

      <p
        v-if="metricsError"
        class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        role="alert"
      >
        Could not refresh system metrics: {{ metricsError }}
      </p>
      <p
        v-if="serviceStore.error"
        class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        role="alert"
      >
        Could not refresh services: {{ serviceStore.error }}
      </p>

      <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <article class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Services</p>
          <p class="mt-2 text-2xl font-semibold text-white">{{ serviceCounts.total }}</p>
          <p class="mt-1 text-xs text-slate-500">configured locally</p>
        </article>
        <article class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Running</p>
          <p class="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            {{ serviceCounts.running }}
          </p>
          <p class="mt-1 text-xs text-slate-500">active processes</p>
        </article>
        <article class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Stopped</p>
          <p class="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <span class="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
            {{ serviceCounts.stopped }}
          </p>
          <p class="mt-1 text-xs text-slate-500">ready to start</p>
        </article>
        <article class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Needs attention</p>
          <p class="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
            {{ serviceCounts.errors }}
          </p>
          <p class="mt-1 text-xs text-slate-500">services reporting errors</p>
        </article>
      </div>

      <section aria-live="polite">
        <div
          v-if="earlyInitializeSettings"
          class="rounded-lg border border-slate-800 bg-[#10151A] px-4 py-6 text-center text-sm text-slate-400"
        >
          Loading dashboard chart preference…
        </div>
        <div v-else-if="realtimeChartToggle" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article class="rounded-lg border border-slate-800 bg-[#181a1b] p-4">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="font-semibold text-white">Processor</h2>
                <p class="mt-1 text-xs text-slate-400">Current CPU utilization</p>
              </div>
              <span
                class="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400"
              >
                {{ hasMetrics ? `${cpuUsage.toFixed(1)}%` : 'Loading' }}
              </span>
            </div>
            <div class="relative mx-auto mt-2 h-[190px] max-w-[280px]">
              <div ref="cpuChartRef" class="h-full"></div>
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              >
                <span class="text-3xl font-semibold text-white">{{
                  hasMetrics ? `${cpuUsage.toFixed(1)}%` : '--'
                }}</span>
                <span class="mt-1 text-xs text-slate-400">in use</span>
              </div>
            </div>
          </article>

          <article class="rounded-lg border border-slate-800 bg-[#181a1b] p-4">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="font-semibold text-white">Memory</h2>
                <p class="mt-1 text-xs text-slate-400">Physical RAM utilization</p>
              </div>
              <span
                class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
              >
                {{ hasMetrics ? `${ramUsage.toFixed(1)}%` : 'Loading' }}
              </span>
            </div>
            <div class="relative mx-auto mt-2 h-[190px] max-w-[280px]">
              <div ref="ramChartRef" class="h-full"></div>
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              >
                <span class="text-3xl font-semibold text-white">{{
                  hasMetrics ? `${ramUsage.toFixed(1)}%` : '--'
                }}</span>
                <span class="mt-1 text-xs text-slate-400">in use</span>
              </div>
            </div>
            <p class="text-center text-xs text-slate-400">
              {{
                hasMetrics
                  ? `${ramUsed.toFixed(2)} GB used of ${ramTotal.toFixed(2)} GB`
                  : 'Waiting for system data'
              }}
            </p>
          </article>
        </div>
        <div v-else class="rounded-lg border border-slate-800 bg-[#10151A] px-4 py-6 text-center">
          <p class="text-sm font-medium text-white">Realtime charts are turned off</p>
          <p class="mt-1 text-xs text-slate-400">
            Enable the dashboard chart setting to show live CPU and memory usage.
          </p>
          <p v-if="chartError" class="mt-2 text-xs text-red-400" role="alert">
            Could not load the saved chart preference: {{ chartError }}
          </p>
          <RouterLink
            to="/settings"
            class="mt-3 inline-flex rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            Open settings
          </RouterLink>
        </div>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-800 bg-[#10151A]">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3"
        >
          <div>
            <h2 class="font-semibold text-white">Your services</h2>
            <p class="mt-1 text-xs text-slate-400">
              Live status of your locally linked environments.
            </p>
          </div>
          <div class="flex gap-2">
            <RouterLink
              to="/logs"
              class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
            >
              View logs
            </RouterLink>
            <RouterLink
              to="/services"
              class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
            >
              All services
            </RouterLink>
          </div>
        </div>

        <div v-if="recentServices.length" class="divide-y divide-slate-800/60">
          <div
            v-for="service in recentServices"
            :key="service.id"
            class="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-white">{{ service.name }}</p>
              <p class="mt-0.5 truncate text-xs text-slate-400">{{ service.serviceType }}</p>
            </div>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="statusClass(service.status)"
            >
              {{ statusLabel(service.status) }}
            </span>
          </div>
        </div>

        <div
          v-else-if="serviceStore.isLoading"
          class="px-4 py-8 text-center text-sm text-slate-400"
        >
          Loading your services…
        </div>
        <div v-else class="px-4 py-8 text-center">
          <p class="text-sm font-medium text-white">No services added yet</p>
          <p class="mt-1 text-xs text-slate-400">
            Link an existing local environment to see its status here.
          </p>
          <RouterLink
            to="/add-service"
            class="mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Add your first service
          </RouterLink>
        </div>
      </section>
    </section>
  </MainTemplate>
</template>
