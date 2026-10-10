<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import MainTemplate from '@/template/MainTemplate.vue'
import Highcharts from 'highcharts'
import { useDashboard } from '@/composables/dashboard/useDashboard'
import { useSettings } from '@/stores/settings'

const { chartData, getChartData } = useDashboard()
const settingsStore = useSettings()
const { resolvedTheme } = storeToRefs(settingsStore)

const cpuChartRef = ref<HTMLElement | null>(null)
const ramChartRef = ref<HTMLElement | null>(null)

let cpuChart: Highcharts.Chart | null = null
let ramChart: Highcharts.Chart | null = null
let intervalChart: any = null

const cpuUsage = ref(0)
const ramUsage = ref(0)
const ramUsed = ref(0)
const ramTotal = ref(0)

const freeChartColor = () => (resolvedTheme.value === 'light' ? '#e2e8f0' : '#1e293b')
const chartTitleColor = () => (resolvedTheme.value === 'light' ? '#475569' : '#94a3b8')

const initCharts = () => {
  if (cpuChartRef.value) {
    cpuChart = Highcharts.chart(cpuChartRef.value, {
      chart: { type: 'pie', backgroundColor: 'transparent', height: '220px' },
      title: { text: 'CPU Usage', style: { color: chartTitleColor(), fontSize: '14px' } },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: '75%',
          dataLabels: { enabled: false },
        },
      },
      series: [
        {
          name: 'Usage',
          type: 'pie',
          data: [
            { name: 'Used', y: 0, color: '#3b82f6' },
            { name: 'Free', y: 100, color: freeChartColor() },
          ],
        },
      ],
    })
  }

  if (ramChartRef.value) {
    ramChart = Highcharts.chart(ramChartRef.value, {
      chart: { type: 'pie', backgroundColor: 'transparent', height: '220px' },
      title: { text: 'RAM Usage', style: { color: chartTitleColor(), fontSize: '14px' } },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: '75%',
          dataLabels: { enabled: false },
        },
      },
      series: [
        {
          name: 'Usage',
          type: 'pie',
          data: [
            { name: 'Used', y: 0, color: '#10b981' },
            { name: 'Free', y: 100, color: freeChartColor() },
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

    const payload = newData.data?.data || newData.data || newData

    if (!payload || !payload.cpu || !payload.ram) return

    cpuUsage.value = payload.cpu.usagePercent ?? 0
    ramUsage.value = payload.ram.usagePercent ?? 0
    ramUsed.value = payload.ram.usedRam ?? 0
    ramTotal.value = payload.ram.ramTotal ?? 0

    if (cpuChart) {
      cpuChart.series[0]?.setData(
        [
          { name: 'Used', y: cpuUsage.value, color: '#3b82f6' },
          { name: 'Free', y: +(100 - cpuUsage.value).toFixed(1), color: freeChartColor() },
        ],
        true,
      )
    }

    if (ramChart) {
      ramChart.series[0]?.setData(
        [
          { name: 'Used', y: ramUsage.value, color: '#10b981' },
          { name: 'Free', y: +(100 - ramUsage.value).toFixed(1), color: freeChartColor() },
        ],
        true,
      )
    }
  },
  { deep: true, immediate: true },
)

watch(resolvedTheme, () => {
  const titleStyle = { color: chartTitleColor(), fontSize: '14px' }
  cpuChart?.setTitle({ style: titleStyle })
  ramChart?.setTitle({ style: titleStyle })

  if (cpuChart) {
    cpuChart.series[0]?.setData(
      [
        { name: 'Used', y: cpuUsage.value, color: '#3b82f6' },
        { name: 'Free', y: +(100 - cpuUsage.value).toFixed(1), color: freeChartColor() },
      ],
      true,
    )
  }
  if (ramChart) {
    ramChart.series[0]?.setData(
      [
        { name: 'Used', y: ramUsage.value, color: '#10b981' },
        { name: 'Free', y: +(100 - ramUsage.value).toFixed(1), color: freeChartColor() },
      ],
      true,
    )
  }
})

onMounted(() => {
  initCharts()
  getChartData()
  intervalChart = setInterval(getChartData, 1000)
})

onUnmounted(() => {
  if (intervalChart) clearInterval(intervalChart)
})

const isDarkMode = computed(() => resolvedTheme.value === 'dark')
</script>

<template>
  <MainTemplate>
    <div class="flex items-center justify-between">
      <h1 class="font-bold text-lg text-slate-100">Symen Dashboard (Real Data)</h1>
    </div>

    <div>
      <div v-if="isDarkMode">Mode Gelap</div>
      <div v-else>Mode Terang</div>
    </div>

    <div class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
          <div ref="cpuChartRef"></div>
          <div class="text-center text-xs text-slate-400 mt-2">Usage: {{ cpuUsage }}%</div>
        </div>

        <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
          <div ref="ramChartRef"></div>
          <div class="text-center text-xs text-slate-400 mt-2">
            Used: {{ ramUsed }} GB / Total: {{ ramTotal }} GB ({{ ramUsage }}%)
          </div>
        </div>
      </div>
    </div>
  </MainTemplate>
</template>
