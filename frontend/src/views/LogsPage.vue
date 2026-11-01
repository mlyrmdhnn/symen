<script setup lang="ts">
import { computed, ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'

type LogEntry = { time: string; level: 'INFO' | 'WARN' | 'ERROR'; service: string; message: string }
const logs: LogEntry[] = [
  { time: '18:21:42.083', level: 'INFO', service: 'api-gateway', message: 'GET /api/health 200 4ms' },
  { time: '18:21:39.612', level: 'INFO', service: 'postgres-db', message: 'checkpoint complete: wrote 18 buffers' },
  { time: '18:21:37.229', level: 'WARN', service: 'worker-queue', message: 'Job retry scheduled — attempt 2 of 5' },
  { time: '18:21:34.005', level: 'INFO', service: 'redis-cache', message: 'Ready to accept connections tcp' },
  { time: '18:21:31.847', level: 'ERROR', service: 'worker-queue', message: 'Connection timeout while reaching upstream' },
  { time: '18:21:28.100', level: 'INFO', service: 'api-gateway', message: 'Upstream connection established' },
  { time: '18:21:14.556', level: 'INFO', service: 'postgres-db', message: 'database system is ready to accept connections' },
  { time: '18:20:58.301', level: 'WARN', service: 'api-gateway', message: 'Request rate approaching configured limit' },
  { time: '18:20:45.772', level: 'INFO', service: 'redis-cache', message: 'Background saving terminated with success' },
  { time: '18:20:32.914', level: 'INFO', service: 'api-gateway', message: 'GET /api/services 200 12ms' },
  { time: '18:20:17.441', level: 'ERROR', service: 'worker-queue', message: 'Failed to process job — retrying' },
  { time: '18:20:04.017', level: 'INFO', service: 'postgres-db', message: 'connection authorized: user=app database=symen' },
]
const search = ref('')
const level = ref('All levels')
const service = ref('All services')
const filteredLogs = computed(() => logs.filter((log) =>
  (level.value === 'All levels' || log.level === level.value) &&
  (service.value === 'All services' || log.service === service.value) &&
  `${log.message} ${log.service}`.toLowerCase().includes(search.value.toLowerCase()),
))
</script>

<template>
  <MainTemplate>
    <section class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><p class="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500"><span class="h-0.5 w-4 bg-[#2496ED]"></span> OBSERVABILITY</p><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Logs</h1><p class="mt-2 text-xs text-slate-500">A live view of what’s happening across your services.</p></div>
      <span class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold dark:border-slate-700 dark:bg-slate-900"><span class="size-2 rounded-full bg-emerald-500"></span> Live stream · Mock data</span>
    </section>

    <section class="mb-4 flex flex-wrap items-center gap-7 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div v-for="stat in [['i','Info','248'],['!','Warnings','12'],['×','Errors','3']]" :key="stat[1]" class="flex items-center gap-2"><span class="grid size-7 place-items-center rounded-md bg-sky-50 font-mono font-bold text-[#2496ED] dark:bg-sky-950">{{ stat[0] }}</span><span><small class="block text-[9px] text-slate-500">{{ stat[1] }}</small><strong class="text-xs">{{ stat[2] }}</strong></span></div>
      <span class="ml-auto text-[9px] text-slate-500">Last 24 hours · Across 4 services</span>
    </section>

    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-wrap items-center justify-between gap-3 p-4">
        <div><h2 class="text-xs font-bold text-slate-900 dark:text-white">Container output</h2><p class="mt-1 text-[9px] text-slate-500">Latest events from your local services</p></div>
        <div class="flex flex-wrap gap-2">
          <label><span class="sr-only">Filter by level</span><select v-model="level" class="h-8 rounded-md border border-slate-200 bg-white px-2 text-[10px] dark:border-slate-700 dark:bg-slate-900"><option>All levels</option><option>INFO</option><option>WARN</option><option>ERROR</option></select></label>
          <label><span class="sr-only">Filter by service</span><select v-model="service" class="h-8 max-w-36 rounded-md border border-slate-200 bg-white px-2 text-[10px] dark:border-slate-700 dark:bg-slate-900"><option>All services</option><option>api-gateway</option><option>postgres-db</option><option>redis-cache</option><option>worker-queue</option></select></label>
          <label class="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-2 text-slate-400 dark:border-slate-700">⌕<span class="sr-only">Search logs</span><input v-model="search" class="w-28 bg-transparent text-[10px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" placeholder="Find in logs" /></label>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="min-w-[640px]">
          <div class="grid grid-cols-[110px_70px_140px_1fr] gap-3 border-y border-slate-200 bg-slate-50 px-4 py-2 text-[8px] font-bold tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950"><span>TIME</span><span>LEVEL</span><span>SERVICE</span><span>MESSAGE</span></div>
          <div v-for="(log, index) in filteredLogs" :key="`${log.time}-${index}`" class="grid min-h-10 grid-cols-[110px_70px_140px_1fr] items-center gap-3 border-b border-slate-100 px-4 text-[9px] dark:border-slate-800">
            <code class="font-mono text-slate-500">{{ log.time }}</code>
            <span :class="['w-fit rounded px-1.5 py-1 font-mono text-[8px] font-bold', log.level === 'ERROR' ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300' : log.level === 'WARN' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300']">{{ log.level }}</span>
            <span class="truncate font-semibold">{{ log.service }}</span><code class="truncate font-mono text-slate-500">{{ log.message }}</code>
          </div>
          <div v-if="filteredLogs.length === 0" class="p-12 text-center text-xs text-slate-500">No log entries match your filters.</div>
        </div>
      </div>
      <footer class="flex justify-between p-3 text-[9px] text-slate-500"><span><span class="mr-1 text-[#2496ED]">●</span> Showing {{ filteredLogs.length }} entries</span><span>Timezone: Local (UTC+7)</span></footer>
    </section>
  </MainTemplate>
</template>
