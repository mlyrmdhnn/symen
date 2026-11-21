<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import MainTemplate from '@/template/MainTemplate.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import DonutChart from '@/components/DonutChart.vue'
import useInvoke from '@/lib/http'
import ThingkingDot from '@/components/ThingkingDot.vue'
import useService from '@/composables/useService'
import { Play, Cpu, Server, Wrench, Component } from '@lucide/vue'

const workspace = useWorkspaceStore()
const { servicesData, servicesExecute } = useService()

interface BasicSysInfo {
  total_mb: number
  used_mb: number
  free_mb: number
  ram_percent: number
  cpu_percent: number
  cpu_cores: number
}

const { data, execute } = useInvoke<BasicSysInfo>('get_system_info', {
  immediate: false,
})

const runningServices = computed(
  () => (servicesData.value ?? []).filter((service) => service.is_run).length,
)

const articleData = computed(() => {
  const system = data.value
  const totalMemoryGb = system ? (system.total_mb / 1024).toFixed(1) : null
  const usedMemoryGb = system ? (system.used_mb / 1024).toFixed(1) : null
  const freeMemoryGb = system ? (system.free_mb / 1024).toFixed(1) : null

  return [
    {
      label: 'Total services',
      value: servicesData.value?.length ?? 0,
      detail: `${runningServices.value} currently running`,
      icon: Wrench,
    },
    {
      label: 'Running services',
      value: runningServices.value,
      detail: 'Across your local setup',
      icon: Play,
    },
    {
      label: 'CPU usage',
      value: system ? `${system.cpu_percent.toFixed(1)}%` : '—',
      detail: system ? `${system.cpu_cores} logical cores` : 'Waiting for system data',
      icon: Cpu,
    },
    {
      label: 'Memory in use',
      value: usedMemoryGb ? `${usedMemoryGb} GB` : '—',
      detail:
        totalMemoryGb && freeMemoryGb
          ? `${freeMemoryGb} GB free of ${totalMemoryGb} GB`
          : 'Waiting for system data',
      icon: Server,
    },
  ]
})

const date = new Date()

const dateTime = date
  .toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  .toUpperCase()

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  void execute()
  void servicesExecute()
  intervalId = setInterval(() => {
    void execute()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <MainTemplate>
    <section class="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
          <span class="h-0.5 w-4 bg-accent"></span> {{ dateTime }}
        </p>
        <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
          Welcome back, {{ workspace.userName || 'User' }}
        </h1>
        <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
          Your local development services at a glance.
        </p>
      </div>
      <RouterLink
        class="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        to="/services"
        >＋ New service</RouterLink
      >
    </section>

    <section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in articleData"
        :key="stat.label"
        class="group rounded-2xl border border-subtle bg-elevated p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5"
      >
        <div class="flex items-center justify-between text-sm font-medium text-muted">
          <span>{{ stat.label }}</span
          ><span class="grid size-10 place-items-center rounded-xl bg-soft text-lg text-accent"
            ><Component :is="stat.icon"
          /></span>
        </div>
        <p class="mt-6 text-3xl font-semibold tracking-tight text-primary tabular-nums">
          {{ stat.value }}
        </p>
        <p class="mt-2 text-sm text-muted">{{ stat.detail }}</p>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <DonutChart
        title="RAM"
        :val1="data?.used_mb"
        :val2="data?.free_mb"
        val1-title="Used"
        val2-title="Available"
        center-title="RAM Usage"
        :center-value="data?.ram_percent"
        val1-text="Used memory"
        val2-text="Available memory"
        :val1-display="data ? `${(data.used_mb / 1024).toFixed(1)} GB` : '—'"
        :val2-display="data ? `${(data.free_mb / 1024).toFixed(1)} GB` : '—'"
      />

      <DonutChart
        title="CPU"
        :val1="data?.cpu_percent"
        :val2="data ? Math.max(0, 100 - data.cpu_percent) : 0"
        val1-title="Used"
        val2-title="Available"
        center-title="CPU Usage"
        :center-value="data?.cpu_percent"
        colour1="#C96A36"
        colour2="#C7BCA9"
        val1-text="In use"
        val2-text="Available"
        :val1-display="data ? `${data.cpu_percent.toFixed(1)}%` : '—'"
        :val2-display="data ? `${Math.max(0, 100 - data.cpu_percent).toFixed(1)}%` : '—'"
      />
    </section>

    <footer class="flex justify-between gap-3 pt-8 text-xs text-muted">
      <span>Symen · Local development environment</span>
      <span>Live system and service data</span>
    </footer>
  </MainTemplate>
</template>
