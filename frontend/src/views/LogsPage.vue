<script setup lang="ts">
import { computed, ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'

type LogEntry = { time: string; level: 'INFO' | 'WARN' | 'ERROR'; service: string; message: string }

const logs: LogEntry[] = [
  {
    time: '18:21:42.083',
    level: 'INFO',
    service: 'Nginx Web Server',
    message: 'GET /health 200 4ms',
  },
  {
    time: '18:21:39.612',
    level: 'INFO',
    service: 'PostgreSQL Database',
    message: 'checkpoint complete: wrote 18 buffers',
  },
  {
    time: '18:21:37.229',
    level: 'WARN',
    service: 'Node API',
    message: 'Retry scheduled — attempt 2 of 5',
  },
  {
    time: '18:21:34.005',
    level: 'INFO',
    service: 'Redis Server',
    message: 'Ready to accept connections tcp',
  },
  {
    time: '18:21:31.847',
    level: 'ERROR',
    service: 'Node API',
    message: 'Connection timeout while reaching upstream',
  },
  {
    time: '18:21:28.100',
    level: 'INFO',
    service: 'Nginx Web Server',
    message: 'Upstream connection established',
  },
  {
    time: '18:21:14.556',
    level: 'INFO',
    service: 'PostgreSQL Database',
    message: 'database system is ready to accept connections',
  },
  {
    time: '18:20:58.301',
    level: 'WARN',
    service: 'Nginx Web Server',
    message: 'Request rate approaching configured limit',
  },
  {
    time: '18:20:45.772',
    level: 'INFO',
    service: 'Redis Server',
    message: 'Background saving terminated with success',
  },
  {
    time: '18:20:32.914',
    level: 'INFO',
    service: 'Nginx Web Server',
    message: 'GET /api/services 200 12ms',
  },
  {
    time: '18:20:17.441',
    level: 'ERROR',
    service: 'Node API',
    message: 'Failed to process job — retrying',
  },
  {
    time: '18:20:04.017',
    level: 'INFO',
    service: 'PostgreSQL Database',
    message: 'connection authorized: user=app database=symen',
  },
]
const search = ref('')
const level = ref('All levels')
const service = ref('All services')
const filteredLogs = computed(() =>
  logs.filter(
    (log) =>
      (level.value === 'All levels' || log.level === level.value) &&
      (service.value === 'All services' || log.service === service.value) &&
      `${log.message} ${log.service}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
)
</script>

<template>
  <MainTemplate>
    <section class="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
          <span class="h-0.5 w-4 bg-accent"></span> OBSERVABILITY
        </p>
        <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary">Logs</h1>
        <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
          A live view of what’s happening across your services.
        </p>
      </div>
      <span
        class="inline-flex items-center gap-2 rounded-xl border border-subtle bg-elevated px-4 py-3 text-sm font-medium"
      >
        <span class="size-2 rounded-full bg-emerald-500"></span> Live stream · Mock data
      </span>
    </section>

    <section
      class="mb-6 flex flex-wrap items-center gap-8 rounded-2xl border border-subtle bg-elevated p-6"
    >
      <div
        v-for="stat in [
          ['i', 'Info', '248'],
          ['!', 'Warnings', '12'],
          ['×', 'Errors', '3'],
        ]"
        :key="stat[1]"
        class="flex items-center gap-3"
      >
        <span
          class="grid size-9 place-items-center rounded-xl bg-soft font-mono font-bold text-accent"
        >
          {{ stat[0] }}
        </span>
        <span>
          <small class="block text-xs text-muted">{{ stat[1] }}</small>
          <strong class="text-sm tabular-nums">{{ stat[2] }}</strong>
        </span>
      </div>
      <span class="ml-auto text-xs text-muted">Last 24 hours · Across 4 services</span>
    </section>

    <section class="overflow-hidden rounded-2xl border border-subtle bg-elevated">
      <div class="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-primary">Process output</h2>
          <p class="mt-1 text-sm text-muted">Latest events from your local services</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <label>
            <span class="sr-only">Filter by level</span>
            <select
              v-model="level"
              class="h-10 rounded-lg border border-subtle bg-surface px-3 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            >
              <option>All levels</option>
              <option>INFO</option>
              <option>WARN</option>
              <option>ERROR</option>
            </select>
          </label>
          <label>
            <span class="sr-only">Filter by service</span>
            <select
              v-model="service"
              class="h-10 max-w-40 rounded-lg border border-subtle bg-surface px-3 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            >
              <option>All services</option>
              <option>Nginx Web Server</option>
              <option>PostgreSQL Database</option>
              <option>Redis Server</option>
              <option>Node API</option>
            </select>
          </label>
          <label
            class="flex h-10 items-center gap-2 rounded-lg border border-subtle px-3 text-muted focus-within:ring-2 focus-within:ring-accent/20"
          >
            ⌕<span class="sr-only">Search logs</span>
            <input
              v-model="search"
              class="w-36 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
              placeholder="Find in logs"
            />
          </label>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="min-w-[640px]">
          <div
            class="grid grid-cols-[110px_70px_140px_1fr] gap-3 border-y border-subtle bg-soft px-5 py-3 text-xs font-bold tracking-wider text-muted"
          >
            <span>TIME</span>
            <span>LEVEL</span>
            <span>SERVICE</span>
            <span>MESSAGE</span>
          </div>
          <div
            v-for="(log, index) in filteredLogs"
            :key="`${log.time}-${index}`"
            class="grid min-h-12 grid-cols-[110px_70px_140px_1fr] items-center gap-3 border-b border-subtle px-5 text-sm transition-colors duration-150 hover:bg-soft"
          >
            <code class="font-mono text-xs text-muted tabular-nums">{{ log.time }}</code>
            <span
              :class="[
                'w-fit rounded px-2 py-1 font-mono text-xs font-bold',
                log.level === 'ERROR'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
                  : log.level === 'WARN'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
              ]"
            >
              {{ log.level }}
            </span>
            <span class="truncate font-medium text-primary">{{ log.service }}</span>
            <code class="truncate font-mono text-xs text-muted">{{ log.message }}</code>
          </div>
          <div v-if="filteredLogs.length === 0" class="p-12 text-center text-sm text-muted">
            No log entries match your filters.
          </div>
        </div>
      </div>
      <footer class="flex justify-between p-4 text-xs text-muted tabular-nums">
        <span
          ><span class="mr-1 text-accent">●</span> Showing {{ filteredLogs.length }} entries</span
        >
        <span>Timezone: Local (UTC+7)</span>
      </footer>
    </section>
  </MainTemplate>
</template>
