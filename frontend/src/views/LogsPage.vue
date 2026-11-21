<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import MainTemplate from '@/template/MainTemplate.vue'
import { parseLogLevel, type LogLevel } from '@/composables/useParseLogLevel'

type DisplayLogLevel = 'INFO' | 'WARN' | 'ERROR'
type PageItem = number | '...'

interface LogEntry {
  id: string
  time: string
  level: DisplayLogLevel
  service: string
  message: string
}

interface ServiceLogBatch {
  source_id: string
  service_id: string
  service: string
  executable: string
  content: string
  start_offset: number
  offset: number
}

const MAX_LOG_ENTRIES = 2000
const PAGE_SIZE = 10

const offsets = ref<Record<string, number>>({})
const logs = ref<LogEntry[]>([])
const expandedIds = ref<Set<string>>(new Set())
const currentPage = ref(1)
const search = ref('')
const level = ref('All levels')
const service = ref('All services')
const pollError = ref('')
const lastUpdated = ref('')
let isPolling = false
let pollTimer: ReturnType<typeof setInterval> | undefined
let nextLogId = 0

function toggleExpand(id: string) {
  if (window.getSelection()?.toString()) return
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

const availableServices = computed(() => [...new Set(logs.value.map((log) => log.service))].sort())
const stats = computed(() => [
  { icon: 'i', label: 'Info', count: logs.value.filter((log) => log.level === 'INFO').length },
  { icon: '!', label: 'Warnings', count: logs.value.filter((log) => log.level === 'WARN').length },
  { icon: '×', label: 'Errors', count: logs.value.filter((log) => log.level === 'ERROR').length },
])

const filteredLogs = computed(() =>
  logs.value.filter(
    (log) =>
      (level.value === 'All levels' || log.level === level.value) &&
      (service.value === 'All services' || log.service === service.value) &&
      `${log.message} ${log.service}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / PAGE_SIZE)))
const safePage = computed(() => Math.min(currentPage.value, totalPages.value))

const paginatedLogs = computed(() => {
  const start = (safePage.value - 1) * PAGE_SIZE
  return filteredLogs.value.slice(start, start + PAGE_SIZE)
})

const paginationItems = computed<PageItem[]>(() => {
  const total = totalPages.value
  const current = safePage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total - 1, total]
  }

  if (current >= total - 3) {
    return [1, 2, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, 2, '...', current - 1, current, current + 1, '...', total - 1, total]
})

watch([level, service, search], () => {
  currentPage.value = 1
})

const refreshLogs = async () => {
  if (isPolling) return
  isPolling = true
  try {
    const batches = await invoke<ServiceLogBatch[]>('get_service_logs', {
      offsets: offsets.value,
    })
    const receivedAt = new Date().toLocaleTimeString(undefined, {
      hour12: false,
      fractionalSecondDigits: 3,
    })
    const newEntries: LogEntry[] = []

    for (const batch of batches) {
      offsets.value[batch.source_id] = batch.offset
      if (!batch.content) continue

      for (const line of parseLogLevel(batch.content, batch.executable)) {
        if (!line.text.trim()) continue
        const displayLevel: Record<LogLevel, DisplayLogLevel> = {
          info: 'INFO',
          warn: 'WARN',
          error: 'ERROR',
        }
        newEntries.push({
          id: `${batch.source_id}:${batch.start_offset}:${nextLogId++}`,
          time: receivedAt,
          level: displayLevel[line.level],
          service: batch.service,
          message: line.text,
        })
      }
    }

    if (newEntries.length > 0) {
      logs.value = [...newEntries.reverse(), ...logs.value].slice(0, MAX_LOG_ENTRIES)
    }
    lastUpdated.value = receivedAt
    pollError.value = ''
  } catch (error) {
    pollError.value = error instanceof Error ? error.message : String(error)
  } finally {
    isPolling = false
  }
}

onMounted(() => {
  void refreshLogs()
  pollTimer = setInterval(() => void refreshLogs(), 1000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
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
        <span class="size-2 rounded-full bg-emerald-500"></span>
        Live · refreshes every second
      </span>
    </section>

    <section
      class="mb-6 flex flex-wrap items-center gap-8 rounded-2xl border border-subtle bg-elevated p-6"
    >
      <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-3">
        <span
          class="grid size-9 place-items-center rounded-xl bg-soft font-mono font-bold text-accent"
        >
          {{ stat.icon }}
        </span>
        <span>
          <small class="block text-xs text-muted">{{ stat.label }}</small>
          <strong class="text-sm tabular-nums">{{ stat.count }}</strong>
        </span>
      </div>
      <span class="ml-auto text-xs text-muted">
        {{ lastUpdated ? `Updated ${lastUpdated}` : 'Waiting for service output' }}
      </span>
    </section>

    <p
      v-if="pollError"
      class="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
      role="alert"
    >
      Could not refresh logs: {{ pollError }}
    </p>

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
              <option v-for="serviceName in availableServices" :key="serviceName">
                {{ serviceName }}
              </option>
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
            v-for="log in paginatedLogs"
            :key="log.id"
            role="button"
            tabindex="0"
            :aria-expanded="expandedIds.has(log.id)"
            :class="[
              'grid min-h-12 cursor-pointer grid-cols-[110px_70px_140px_1fr] gap-3 border-b border-subtle px-5 text-sm transition-colors duration-150 select-text hover:bg-soft focus-visible:bg-soft focus-visible:outline-none',
              expandedIds.has(log.id) ? 'items-start bg-soft/60 py-3.5' : 'items-center',
            ]"
            @click="toggleExpand(log.id)"
            @keydown.enter.prevent="toggleExpand(log.id)"
            @keydown.space.prevent="toggleExpand(log.id)"
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
            <code
              :class="[
                'font-mono text-xs',
                expandedIds.has(log.id)
                  ? 'leading-relaxed break-all whitespace-pre-wrap text-primary'
                  : 'truncate text-muted',
              ]"
            >
              {{ log.message }}
            </code>
          </div>

          <div v-if="paginatedLogs.length === 0" class="p-12 text-center text-sm text-muted">
            {{ logs.length ? 'No log entries match your filters.' : 'No service output yet.' }}
          </div>
        </div>
      </div>

      <footer
        class="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 text-xs text-muted tabular-nums"
      >
        <p>
          <span class="mr-1.5 text-accent">●</span>
          Showing
          <span class="font-medium text-primary">{{
            filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
          }}</span>
          to
          <span class="font-medium text-primary">{{
            Math.min(safePage * PAGE_SIZE, filteredLogs.length)
          }}</span>
          of
          <span class="font-medium text-primary">{{ filteredLogs.length }}</span>
          results
        </p>

        <nav
          v-if="totalPages > 1"
          aria-label="Pagination"
          class="inline-flex -space-x-px rounded-lg border border-subtle bg-surface shadow-xs"
        >
          <button
            type="button"
            :disabled="safePage <= 1"
            aria-label="Previous"
            class="inline-flex h-8 w-8 items-center justify-center rounded-l-lg border-r border-subtle text-muted transition-colors hover:bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            @click="currentPage = safePage - 1"
          >
            <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <template v-for="(item, idx) in paginationItems" :key="`${item}-${idx}`">
            <span
              v-if="item === '...'"
              class="inline-flex h-8 min-w-8 items-center justify-center border-r border-subtle px-2.5 font-mono text-xs text-muted select-none"
            >
              ...
            </span>
            <button
              v-else
              type="button"
              :aria-current="item === safePage ? 'page' : undefined"
              :class="[
                'inline-flex h-8 min-w-8 items-center justify-center border-r border-subtle px-2.5 font-mono text-xs font-medium transition-colors',
                item === safePage
                  ? 'z-10 bg-accent/15 font-semibold text-accent ring-1 ring-inset ring-accent/40'
                  : 'text-muted hover:bg-soft hover:text-primary',
              ]"
              @click="currentPage = item"
            >
              {{ item }}
            </button>
          </template>

          <button
            type="button"
            :disabled="safePage >= totalPages"
            aria-label="Next"
            class="inline-flex h-8 w-8 items-center justify-center rounded-r-lg text-muted transition-colors hover:bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            @click="currentPage = safePage + 1"
          >
            <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </nav>

        <span>Timezone: Local (UTC+7)</span>
      </footer>
    </section>
  </MainTemplate>
</template>
