<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'
import { Pencil, Play, Trash, Square } from '@lucide/vue'
import AddServiceCard from '@/components/AddServiceCard.vue'
import DeleteServiceModal from '@/components/DeleteServiceModal.vue'
import useService from '@/composables/useService'
import EditServiceCard from '@/components/EditServiceCard.vue'
import LoadingUI from '@/components/LoadingUI.vue'
import useToast from '@/composables/useToast'
const { showToast } = useToast()

const {
  servicesData,
  servicesExecute,
  servicesError,
  servicesPending,
  getUpdatedData,
  deleteService,
  selectedDeleteId,
  startService,
  stopService,
  loadingServiceId,
  deleteModalOpen,
  closeDeleteModal,
} = useService()

const search = ref('')
const modalOpen = ref(false)
const selectedDeleteService = reactive({
  id: '',
  name: '',
})

const closeModal = () => {
  modalOpen.value = false
}

const openModal = () => {
  modalOpen.value = true
}

const allServices = computed(() => servicesData.value ?? [])
const runningCount = computed(() => allServices.value.filter((service) => service.is_run).length)
const stoppedCount = computed(() => allServices.value.length - runningCount.value)
const filteredServices = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return allServices.value

  return allServices.value.filter((service) =>
    [service.name, service.executable, service.path, service.port, service.pid]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})

const serviceStats = computed(() => [
  { label: 'Total services', value: allServices.value.length, detail: 'Configured locally' },
  { label: 'Running', value: runningCount.value, detail: 'Currently active' },
  { label: 'Stopped', value: stoppedCount.value, detail: 'Ready to start' },
])

const openDeleteModal = (id: string, name: string, is_run: boolean) => {
  if (is_run) {
    showToast(
      'warning',
      `${name} still running`,
      'Please stop the service before delete the service',
    )
    return
  }

  selectedDeleteService.name = name
  selectedDeleteService.id = id
  deleteModalOpen.value = true
  selectedDeleteId.value = id
}

const showUpdateModal = ref(false)

const openUpdateModal = (data: any, is_run: boolean, name: string) => {
  if (is_run) {
    showToast(
      'info',
      `${name} still running`,
      'Please stop the service first before edit the service',
    )
    return
  }
  getUpdatedData(data)
  showUpdateModal.value = true
}

onMounted(() => {
  void servicesExecute()
})
</script>

<template>
  <MainTemplate>
    <AddServiceCard v-if="modalOpen" @close-modal="closeModal" />
    <DeleteServiceModal
      v-if="deleteModalOpen"
      @close-delete-modal="closeDeleteModal"
      :id="selectedDeleteService.id"
      :name="selectedDeleteService.name"
      @confirm-delete="deleteService"
    />
    <EditServiceCard v-if="showUpdateModal" @close-modal="showUpdateModal = false" />
    <section class="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
          <span class="h-0.5 w-4 bg-accent"></span> LOCAL DEVELOPMENT PROCESSES
        </p>
        <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary">Services</h1>
        <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
          Configure local development processes and their working directories.
        </p>
      </div>
      <button
        class="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        type="button"
        @click="openModal"
      >
        <span aria-hidden="true">＋</span>
        Add service
      </button>
    </section>

    <section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        v-for="stat in serviceStats"
        :key="stat.label"
        class="rounded-2xl border border-subtle bg-elevated p-6"
      >
        <p class="text-sm font-medium text-muted">{{ stat.label }}</p>
        <p class="mt-4 text-3xl font-semibold tracking-tight text-primary tabular-nums">
          {{ stat.value }}
        </p>
        <p class="mt-2 text-sm text-muted">{{ stat.detail }}</p>
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-subtle bg-elevated">
      <div
        class="flex flex-wrap items-center justify-between gap-4 border-b border-subtle px-6 py-5"
      >
        <div>
          <h2 class="text-base font-semibold tracking-tight text-primary">All services</h2>
          <p class="mt-1 text-sm text-muted">Manage and monitor your local processes.</p>
        </div>
        <label
          class="flex h-11 items-center gap-2 rounded-xl border border-subtle px-3 text-muted transition-colors duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
          ><span aria-hidden="true">⌕</span><span class="sr-only">Search services</span
          ><input
            v-model="search"
            class="w-48 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
            type="search"
            placeholder="Search services..."
        /></label>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-soft text-xs font-semibold tracking-wide text-muted">
            <tr>
              <th class="px-5 py-4">Service</th>
              <th class="px-5 py-4">Executable</th>
              <th class="px-5 py-4">Working directory</th>
              <th class="px-5 py-4">Status</th>
              <th class="px-5 py-4">Port</th>
              <th class="px-5 py-4">PID</th>
              <th class="px-5 py-4"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="service in filteredServices"
              :key="service.id"
              class="border-t border-subtle transition-colors duration-150 hover:bg-soft"
            >
              <td class="px-5 py-4">
                <span class="font-semibold text-primary">{{ service.name }}</span>
              </td>
              <td class="px-5 py-4 font-mono text-xs text-muted">
                {{ service.executable }}
              </td>
              <td
                class="max-w-[280px] truncate px-5 py-4 font-mono text-xs text-muted"
                :title="service.path"
              >
                {{ service.path }}
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                  :class="
                    service.is_run
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-soft text-muted'
                  "
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="service.is_run ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span>
                  {{ service.is_run ? 'Running' : 'Stopped' }}
                </span>
              </td>
              <td class="px-5 py-4 font-mono text-xs text-muted tabular-nums">
                {{ service.port || '—' }}
              </td>
              <td class="px-5 py-4 font-mono text-xs text-muted tabular-nums">
                {{ service.pid || '—' }}
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    class="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-soft hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    aria-label="Edit service"
                    :disabled="loadingServiceId === service.id"
                    @click="openUpdateModal(service, service.is_run, service.name)"
                  >
                    <Pencil :size="16" />
                  </button>
                  <button
                    class="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950"
                    type="button"
                    aria-label="Delete service"
                    :disabled="loadingServiceId === service.id"
                    :title="
                      service.is_run ? 'Stop the service before deleting it' : 'Delete service'
                    "
                    @click="openDeleteModal(service.id, service.name, service.is_run)"
                  >
                    <Trash :size="16" />
                  </button>
                  <button
                    class="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-soft focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    :aria-label="service.is_run ? 'Stop service' : 'Start service'"
                    :disabled="loadingServiceId === service.id"
                    @click="
                      service.is_run
                        ? stopService(service.id, service.pid)
                        : startService(service.id)
                    "
                  >
                    <template v-if="loadingServiceId === service.id">
                      <LoadingUI class="w-8 h-8" />
                    </template>
                    <template v-else>
                      <Square
                        v-if="service.is_run"
                        :size="16"
                        class="cursor-pointer text-red-500"
                      />
                      <Play v-else :size="16" class="cursor-pointer text-accent" />
                    </template>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="servicesPending">
              <td colspan="7" class="p-12 text-center text-sm text-muted">
                Loading your services…
              </td>
            </tr>
            <tr v-else-if="servicesError">
              <td colspan="7" class="p-12 text-center text-sm text-rose-600">
                Unable to load services. Please try again.
              </td>
            </tr>
            <tr v-else-if="filteredServices.length === 0">
              <td colspan="7" class="p-12 text-center">
                <p class="text-base font-medium text-primary">
                  {{ search ? 'No matching services' : 'No services yet' }}
                </p>
                <p class="mt-2 text-sm text-muted">
                  {{
                    search
                      ? 'Try another name, executable, or path.'
                      : 'Add a service to manage it from Symen.'
                  }}
                </p>
                <button
                  v-if="!search"
                  class="mt-4 font-semibold text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
                  type="button"
                  @click="openModal"
                >
                  Add your first service
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer
        class="flex flex-wrap justify-between gap-2 border-t border-subtle px-6 py-4 text-sm text-muted tabular-nums"
      >
        Showing {{ filteredServices.length }} of {{ allServices.length }} services
        <span>{{ runningCount }} running · {{ stoppedCount }} stopped</span>
      </footer>
    </section>
  </MainTemplate>
</template>
