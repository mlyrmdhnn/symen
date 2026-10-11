<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Columns3 } from '@lucide/vue'
import MainTemplate from '@/template/MainTemplate.vue'
import { useServices, type Service } from '@/stores/services'

const serviceStore = useServices()
const router = useRouter()
const search = ref('')
const onlyRunning = ref(false)
const showColumnsMenu = ref(false)
const activeDropdownId = ref<string | null>(null)
const editingService = ref<Service | null>(null)
const editForm = reactive({ path: '', executableName: '', argumentsText: '' })
let refreshInterval: ReturnType<typeof setInterval> | undefined
const columns = [
  { key: 'status', label: 'Status' },
  { key: 'type', label: 'Type' },
  { key: 'path', label: 'Environment' },
  { key: 'pid', label: 'PID' },
  { key: 'startedAt', label: 'Last Started' },
]
const visibleColumns = ref(columns.map((column) => column.key))

const visibleServices = computed(() => {
  const query = search.value.trim().toLowerCase()
  return serviceStore.services.filter((service) => {
    const matchesSearch =
      !query ||
      service.name.toLowerCase().includes(query) ||
      service.serviceType.toLowerCase().includes(query) ||
      service.path.toLowerCase().includes(query)
    return matchesSearch && (!onlyRunning.value || service.status === 'running')
  })
})

const counts = computed(() => ({
  running: serviceStore.services.filter((service) => service.status === 'running').length,
  stopped: serviceStore.services.filter((service) => service.status === 'stopped').length,
  error: serviceStore.services.filter((service) => service.status === 'error').length,
}))

const load = () => void serviceStore.loadServices()
const closeDropdown = () => {
  activeDropdownId.value = null
  showColumnsMenu.value = false
}

const toggleColumn = (key: string) => {
  visibleColumns.value = visibleColumns.value.includes(key)
    ? visibleColumns.value.filter((column) => column !== key)
    : [...visibleColumns.value, key]
}

const runAction = async (action: 'start' | 'stop' | 'delete', service: Service) => {
  closeDropdown()
  if (action === 'delete' && !window.confirm(`Remove ${service.name} from the list?`)) return
  try {
    await serviceStore.serviceAction(action, service.id)
  } catch {
    // The store exposes action errors in the service list.
  }
  await serviceStore.loadServices()
}

const edit = (service: Service) => {
  serviceStore.setError('')
  editingService.value = service
  editForm.path = service.path
  editForm.executableName = service.executableName
  editForm.argumentsText = service.arguments.join('\n')
  closeDropdown()
}

const browseEditFolder = async () => {
  try {
    const selectedPath = await window.electronAPI?.selectDirectory()
    if (selectedPath) editForm.path = selectedPath
  } catch (error) {
    serviceStore.setError(error instanceof Error ? error.message : String(error))
  }
}

const saveEdit = async () => {
  if (!editingService.value) return
  try {
    await serviceStore.updateService({
      id: editingService.value.id,
      path: editForm.path,
      executableName: editForm.executableName,
      arguments: editForm.argumentsText.split(/\r?\n/).filter((argument) => argument.length > 0),
    })
    editingService.value = null
  } catch {
    // The store exposes update errors in the service list.
  }
}

const openLogs = (service?: Service) => {
  const target = service ? `/logs?service=${encodeURIComponent(service.id)}` : '/logs'
  void router.push(target)
  closeDropdown()
}

onMounted(() => {
  load()
  refreshInterval = setInterval(load, 2500)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <MainTemplate @click="closeDropdown">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="font-bold text-lg text-white">Services</h1>
        <p class="mt-1 text-sm text-slate-400">Manage native services on this machine.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          @click.stop="openLogs()"
        >
          Global logs
        </button>
        <RouterLink
          to="/add-service"
          class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Add service
        </RouterLink>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
        <span class="text-xs uppercase tracking-wide text-slate-400">Running</span>
        <div class="mt-2 flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <strong class="text-xl text-white">{{ counts.running }}</strong>
        </div>
      </div>
      <div class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
        <span class="text-xs uppercase tracking-wide text-slate-400">Stopped</span>
        <div class="mt-2 flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
          <strong class="text-xl text-white">{{ counts.stopped }}</strong>
        </div>
      </div>
      <div class="rounded-lg border border-slate-800 bg-[#10151A] p-4">
        <span class="text-xs uppercase tracking-wide text-slate-400">Error</span>
        <div class="mt-2 flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
          <strong class="text-xl text-white">{{ counts.error }}</strong>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="search"
          type="search"
          placeholder="Search services"
          class="w-full max-w-sm rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
        <div class="relative" @click.stop>
          <button
            class="rounded-md p-2 text-blue-400 hover:bg-slate-800"
            title="Choose visible columns"
            :aria-expanded="showColumnsMenu"
            @click="showColumnsMenu = !showColumnsMenu"
          >
            <Columns3 class="h-5 w-5" />
          </button>
          <div
            v-if="showColumnsMenu"
            class="absolute left-0 top-10 z-20 w-48 rounded-md border border-slate-700 bg-[#10151A] p-2 shadow-xl"
          >
            <label
              v-for="column in columns"
              :key="column.key"
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              <input
                type="checkbox"
                :checked="visibleColumns.includes(column.key)"
                class="accent-blue-500"
                @change="toggleColumn(column.key)"
              />
              {{ column.label }}
            </label>
          </div>
        </div>
      </div>
      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input v-model="onlyRunning" type="checkbox" class="accent-blue-500" />
        Only show running services
      </label>
    </div>

    <p v-if="serviceStore.error" class="mt-4 text-sm text-red-400" role="alert">
      {{ serviceStore.error }}
    </p>

    <div class="mt-4 overflow-x-auto rounded-lg border border-slate-800">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="bg-[#080B0E] text-[11px] uppercase tracking-wider text-slate-400">
          <tr>
            <th class="px-4 py-3 font-medium">Service</th>
            <th v-if="visibleColumns.includes('status')" class="px-4 py-3 font-medium">Status</th>
            <th v-if="visibleColumns.includes('type')" class="px-4 py-3 font-medium">Type</th>
            <th v-if="visibleColumns.includes('path')" class="px-4 py-3 font-medium">
              Environment
            </th>
            <th v-if="visibleColumns.includes('pid')" class="px-4 py-3 font-medium">PID</th>
            <th v-if="visibleColumns.includes('startedAt')" class="px-4 py-3 font-medium">
              Last Started
            </th>
            <th class="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr v-if="serviceStore.isLoading && !serviceStore.services.length">
            <td
              :colspan="2 + visibleColumns.length"
              class="px-4 py-8 text-center text-sm text-slate-400"
            >
              Loading services...
            </td>
          </tr>
          <tr v-else-if="!visibleServices.length">
            <td
              :colspan="2 + visibleColumns.length"
              class="px-4 py-8 text-center text-sm text-slate-400"
            >
              {{
                serviceStore.services.length
                  ? 'No services match your search.'
                  : 'No services linked yet.'
              }}
              <RouterLink
                v-if="!serviceStore.services.length"
                to="/add-service"
                class="ml-1 text-blue-400 hover:underline"
              >
                Link a local service
              </RouterLink>
            </td>
          </tr>
          <tr
            v-for="service in visibleServices"
            :key="service.id"
            class="transition-colors hover:bg-white/[0.02]"
          >
            <td class="px-4 py-3.5">
              <div class="font-medium text-white">{{ service.name }}</div>
            </td>
            <td v-if="visibleColumns.includes('status')" class="px-4 py-3.5">
              <span
                class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium"
                :class="{
                  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400':
                    service.status === 'running',
                  'border-slate-500/30 bg-slate-500/10 text-slate-400':
                    service.status === 'stopped',
                  'border-red-500/30 bg-red-500/10 text-red-400': service.status === 'error',
                }"
                :title="service.lastError ?? undefined"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="{
                    'bg-emerald-500': service.status === 'running',
                    'bg-slate-500': service.status === 'stopped',
                    'bg-red-500': service.status === 'error',
                  }"
                ></span>
                {{ service.status }}
              </span>
              <p v-if="service.lastError" class="mt-1 max-w-xs text-xs text-red-400">
                {{ service.lastError }}
              </p>
            </td>
            <td
              v-if="visibleColumns.includes('type')"
              class="px-4 py-3.5 text-xs uppercase text-slate-400"
            >
              {{ service.serviceType }}
            </td>
            <td
              v-if="visibleColumns.includes('path')"
              class="max-w-[320px] px-4 py-3.5 font-mono text-xs text-slate-400"
            >
              <span class="block truncate" :title="service.path">{{ service.path }}</span>
              <span v-if="service.executable" class="mt-1 block truncate text-slate-500">
                {{ service.executable }}
              </span>
            </td>
            <td
              v-if="visibleColumns.includes('pid')"
              class="px-4 py-3.5 font-mono text-xs text-slate-400"
            >
              {{ service.status === 'running' ? service.pid : '—' }}
            </td>
            <td
              v-if="visibleColumns.includes('startedAt')"
              class="px-4 py-3.5 text-xs text-slate-500"
            >
              {{ service.startedAt ? new Date(service.startedAt).toLocaleString() : '—' }}
            </td>
            <td class="px-4 py-3.5 text-right">
              <div class="inline-flex items-center gap-2">
                <button
                  v-if="
                    service.status === 'stopped' || (service.status === 'error' && !service.pid)
                  "
                  class="rounded px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                  :disabled="serviceStore.isWorking"
                  @click.stop="runAction('start', service)"
                >
                  Start
                </button>
                <button
                  v-else
                  class="rounded px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
                  :disabled="serviceStore.isWorking"
                  @click.stop="runAction('stop', service)"
                >
                  Stop
                </button>
                <div class="relative" @click.stop>
                  <button
                    class="rounded px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                    :aria-expanded="activeDropdownId === service.id"
                    @click="activeDropdownId = activeDropdownId === service.id ? null : service.id"
                  >
                    More
                  </button>
                  <div
                    v-if="activeDropdownId === service.id"
                    class="absolute right-0 top-9 z-20 w-36 rounded-md border border-slate-700 bg-slate-800 p-1 shadow-xl"
                  >
                    <button
                      class="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-700"
                      @click="edit(service)"
                    >
                      Edit folder
                    </button>
                    <button
                      class="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-700"
                      @click="openLogs(service)"
                    >
                      View logs
                    </button>
                    <button
                      class="block w-full rounded px-2 py-1.5 text-left text-xs text-red-400 hover:bg-slate-700"
                      @click="runAction('delete', service)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="editingService"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="editingService = null"
    >
      <form
        class="w-full max-w-xl space-y-4 rounded-lg border border-slate-700 bg-[#10151A] p-5 shadow-2xl"
        @submit.prevent="saveEdit"
        @click.stop
      >
        <h2 class="text-base font-semibold text-white">Edit {{ editingService.name }}</h2>
        <div>
          <label for="edit-service-path" class="mb-2 block text-sm text-slate-300">
            Installation folder
          </label>
          <div class="flex gap-2">
            <input
              id="edit-service-path"
              v-model.trim="editForm.path"
              required
              class="min-w-0 flex-1 rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              @click="browseEditFolder"
            >
              Browse
            </button>
          </div>
        </div>
        <label class="block">
          <span class="mb-2 block text-sm text-slate-300">Executable (optional)</span>
          <input
            v-model.trim="editForm.executableName"
            placeholder="Relative path, such as bin/nginx.exe"
            class="w-full rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm text-slate-300">Startup arguments (one per line)</span>
          <textarea
            v-model="editForm.argumentsText"
            rows="3"
            class="w-full rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          ></textarea>
        </label>
        <p v-if="serviceStore.error" class="text-sm text-red-400" role="alert">
          {{ serviceStore.error }}
        </p>
        <div class="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            class="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            @click="editingService = null"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="serviceStore.isWorking"
            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  </MainTemplate>
</template>
