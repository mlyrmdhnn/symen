<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'
import { useWorkspaceStore, type Service } from '@/stores/workspace'
import { Pencil, Play, Trash, Square } from '@lucide/vue'

const workspace = useWorkspaceStore()
const search = ref('')
const modalOpen = ref(false)
const editingId = ref<number>()
const directoryInput = ref<HTMLInputElement>()
const draft = reactive({
  name: '',
  executable: '',
  directoryPath: '',
})
const filteredServices = computed(() =>
  workspace.services.filter((item) =>
    `${item.name} ${item.executable} ${item.directoryPath}`
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  ),
)

function openCreate() {
  editingId.value = undefined
  Object.assign(draft, { name: '', executable: '', directoryPath: '' })
  modalOpen.value = true
}
function openEdit(service: Service) {
  editingId.value = service.id
  Object.assign(draft, {
    name: service.name,
    executable: service.executable,
    directoryPath: service.directoryPath,
  })
  modalOpen.value = true
}
function selectDirectory(event: Event) {
  const input = event.currentTarget
  if (!(input instanceof HTMLInputElement)) return

  const selectedFile = input.files?.[0]
  const directoryName = selectedFile?.webkitRelativePath.split('/')[0]
  if (directoryName) draft.directoryPath = directoryName
  input.value = ''
}
function submitService() {
  workspace.saveService({ ...draft }, editingId.value)
  modalOpen.value = false
}
function removeService(service: Service) {
  if (window.confirm(`Delete "${service.name}" from this mock workspace?`))
    workspace.deleteService(service.id)
}
</script>

<template>
  <MainTemplate>
    <section class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p
          class="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500"
        >
          <span class="h-0.5 w-4 bg-[#2496ED]"></span> LOCAL DEVELOPMENT PROCESSES
        </p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
        <p class="mt-2 text-xs text-slate-500">
          Configure local development processes and their working directories.
        </p>
      </div>
      <button
        class="rounded-md bg-[#2496ED] px-3 py-2 text-xs font-bold text-white hover:bg-[#1684d8]"
        type="button"
        @click="openCreate"
      >
        ＋ Add service
      </button>
    </section>

    <section class="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
      <div
        v-for="stat in [
          ['Total services', workspace.services.length],
          [
            'Executables configured',
            workspace.services.filter((service) => service.executable).length,
          ],
          [
            'Directories configured',
            workspace.services.filter((service) => service.directoryPath).length,
          ],
        ]"
        :key="stat[0]"
        class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
      >
        <span
          class="grid size-8 place-items-center rounded-lg bg-sky-50 text-[#2496ED] dark:bg-sky-950"
          >◫</span
        ><span
          ><small class="block text-[9px] text-slate-500">{{ stat[0] }}</small
          ><strong class="text-base">{{ stat[1] }}</strong></span
        >
      </div>
    </section>

    <section
      class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 dark:border-slate-800"
      >
        <div class="flex items-center gap-2 py-4 text-[10px] font-semibold text-[#1684d8]">
          All services
          <span class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] dark:bg-slate-800">{{
            workspace.services.length
          }}</span>
        </div>
        <label
          class="mb-2 flex h-8 items-center gap-2 rounded-md border border-slate-200 px-2 text-slate-400 dark:border-slate-700 sm:mb-0"
          >⌕<span class="sr-only">Search services</span
          ><input
            v-model="search"
            class="w-40 bg-transparent text-[10px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
            type="search"
            placeholder="Search services..."
        /></label>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] text-left text-[10px]">
          <thead
            class="bg-slate-50 text-[8px] font-bold tracking-wider text-slate-400 dark:bg-slate-950"
          >
            <tr>
              <th class="px-4 py-3">Service</th>
              <th class="px-4 py-3">Executable</th>
              <th class="px-4 py-3">PID</th>
              <th class="px-4 py-3">Port</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="service in filteredServices"
              :key="service.id"
              class="border-t border-slate-100 dark:border-slate-800"
            >
              <td class="px-4 py-3">
                <span class="flex items-center gap-2 font-bold"
                  ><span
                    class="grid size-8 place-items-center rounded-md border border-slate-200 bg-slate-50 text-[#2496ED] dark:border-slate-700 dark:bg-slate-800"
                    >{{ service.name.slice(0, 1).toUpperCase() }}</span
                  >{{ service.name }}</span
                >
              </td>
              <td class="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                {{ service.executable }}
              </td>
              <td class="px-4 py-3 font-mono text-slate-500">{{ service.directoryPath }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button
                    class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-[#1684d8] dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                    type="button"
                    aria-label="Edit service"
                    @click="openEdit(service)"
                  >
                    <Pencil :size="20" /></button
                  ><button
                    class="rounded px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all duration-200 cursor-pointer"
                    type="button"
                    aria-label="Delete service"
                    @click="removeService(service)"
                  >
                    <Trash :size="20" />
                  </button>
                  <button
                    class="rounded px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all duration-200 cursor-pointer"
                    type="button"
                    aria-label="Delete service"
                    @click="removeService(service)"
                  >
                    <Square :size="20" />
                    <!-- <Play :size="20" /> -->
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredServices.length === 0">
              <td colspan="4" class="p-12 text-center text-xs text-slate-500">
                No services found.
                <button class="font-bold text-[#1684d8]" type="button" @click="openCreate">
                  Add service
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer
        class="flex flex-wrap justify-between gap-2 border-t border-slate-200 px-4 py-3 text-[9px] text-slate-500 dark:border-slate-800"
      >
        Showing {{ filteredServices.length }} of {{ workspace.services.length }} services
        <span>● Frontend preview · Changes stay in this session</span>
      </footer>
    </section>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-10 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="modalOpen = false"
      @keydown.esc="modalOpen = false"
    >
      <form
        class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        @submit.prevent="submitService"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="mb-2 text-[9px] font-bold tracking-widest text-slate-500">
              SERVICE CONFIGURATION
            </p>
            <h2 class="text-lg font-bold">{{ editingId ? 'Edit service' : 'Add a service' }}</h2>
          </div>
          <button
            class="text-xl text-slate-400"
            type="button"
            aria-label="Close dialog"
            @click="modalOpen = false"
          >
            ×
          </button>
        </div>
        <p class="mb-5 mt-2 text-[10px] text-slate-500">
          Configure a local executable and its working directory.
        </p>
        <label class="mb-3 grid gap-1.5 text-[10px] font-semibold"
          >Service name<input
            v-model.trim="draft.name"
            required
            maxlength="48"
            placeholder="e.g. Nginx Web Server"
            class="h-9 rounded-md border border-slate-200 bg-white px-3 font-normal dark:border-slate-700 dark:bg-slate-950"
        /></label>
        <label class="mb-3 grid gap-1.5 text-[10px] font-semibold"
          >Executable<input
            v-model.trim="draft.executable"
            required
            placeholder="e.g. nginx.exe"
            class="h-9 rounded-md border border-slate-200 bg-white px-3 font-normal dark:border-slate-700 dark:bg-slate-950"
        /></label>
        <div class="mb-1 grid gap-1.5 text-[10px] font-semibold">
          <label for="directory-path">Directory path</label>
          <span class="flex gap-2">
            <input
              id="directory-path"
              v-model.trim="draft.directoryPath"
              required
              placeholder="e.g. C:\tools\nginx"
              class="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 font-normal dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              class="h-9 shrink-0 rounded-md border border-slate-200 px-3 text-[10px] font-semibold dark:border-slate-700"
              type="button"
              @click="directoryInput?.click()"
            >
              Browse
            </button>
            <input
              ref="directoryInput"
              class="hidden"
              type="file"
              webkitdirectory
              @change="selectDirectory"
            />
          </span>
          <span class="font-normal text-slate-500">
            Folder selection fills its name; enter the full path manually if needed.
          </span>
        </div>
        <div
          class="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800"
        >
          <button
            class="rounded-md border border-slate-200 px-3 py-2 text-[10px] font-semibold dark:border-slate-700"
            type="button"
            @click="modalOpen = false"
          >
            Cancel</button
          ><button
            class="rounded-md bg-[#2496ED] px-3 py-2 text-[10px] font-bold text-white"
            type="submit"
          >
            {{ editingId ? 'Save changes' : 'Add service' }}
          </button>
        </div>
      </form>
    </div>
  </MainTemplate>
</template>
