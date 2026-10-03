<script setup lang="ts">
import { ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'
import { Columns3 } from '@lucide/vue'

const showColumnsMenu = ref(false)
const setShowColumnsMenu = () => {
  showColumnsMenu.value = !showColumnsMenu.value
}

const activeDropdownIndex = ref<number | null>(null)

const toggleOptions = (index: number) => {
  if (activeDropdownIndex.value === index) {
    activeDropdownIndex.value = null
  } else {
    activeDropdownIndex.value = index
  }
}

const closeAllDropdowns = () => {
  activeDropdownIndex.value = null
  showColumnsMenu.value = false
}

const coloms = ['port', 'PID', 'CPU (%)', 'Memory Usage', 'Memory read/write', 'Last Started']

const row = [
  {
    port: '3000',
    pid: '14280',
    cpu: '2.4%',
    usageMemory: '145.2 MB',
    readOrWriteMemory: 'Read/Write',
    lastStarted: '2026-09-27 08:30:12',
    name: 'Nginx',
  },
  {
    port: '8080',
    pid: '9842',
    cpu: '0.1%',
    usageMemory: '88.5 MB',
    readOrWriteMemory: 'Read Only',
    lastStarted: '2026-09-27 09:15:00',
    name: 'Apache',
  },
  {
    port: '5173',
    pid: '21054',
    cpu: '4.8%',
    usageMemory: '230.1 MB',
    readOrWriteMemory: 'Read/Write',
    lastStarted: '2026-09-27 10:02:45',
    name: 'MySQL',
  },
  {
    port: '3306',
    pid: '4120',
    cpu: '0.0%',
    usageMemory: '310.8 MB',
    readOrWriteMemory: 'Read/Write',
    lastStarted: '2026-09-27 07:00:10',
    name: 'PgSQL',
  },
  {
    port: '5432',
    pid: '6531',
    cpu: '0.2%',
    usageMemory: '115.4 MB',
    readOrWriteMemory: 'Read Only',
    lastStarted: '2026-09-27 07:00:15',
    name: 'Apache Kafka',
  },
]
</script>

<template>
  <MainTemplate @click="closeAllDropdowns">
    <h1 class="font-bold text-lg text-white">Services</h1>
    <div class="mt-10">
      <!-- Header -->
      <header>
        <div class="flex justify-between">
          <div class="flex items-center space-x-4">
            <div class="relative flex items-center">
              <svg
                class="absolute left-3 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                class="bg-[#080B0E] border border-slate-700 text-sm rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 w-80"
              />
            </div>

            <div class="flex items-center space-x-3">
              <div class="relative" @click.stop>
                <button
                  @click="setShowColumnsMenu"
                  class="p-2 text-blue-400 hover:bg-slate-800 rounded cursor-pointer"
                >
                  <Columns3 class="w-5 h-5" />
                </button>
                <div
                  class="h-80 w-80 right-0 bg-[#10151A] border border-slate-700 flex flex-col justify-between p-2 z-50 rounded shadow-xl"
                  :class="[showColumnsMenu ? 'absolute' : 'hidden']"
                >
                  <div class="overflow-y-auto space-y-2 pt-1">
                    <div v-for="(c, i) in coloms" :key="i" class="px-2">
                      <label class="flex items-center space-x-2 cursor-pointer select-none">
                        <input type="checkbox" class="sr-only peer" />
                        <div
                          class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"
                        ></div>
                        <span class="text-sm text-slate-300">{{ c }}</span>
                      </label>
                    </div>
                  </div>

                  <div
                    class="flex justify-between border-t border-slate-800 pt-3 px-2 text-sm text-blue-400 cursor-pointer"
                  >
                    <span class="hover:underline">Hide All</span>
                    <span class="hover:underline">Show All</span>
                  </div>
                </div>
              </div>

              <label class="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" class="sr-only peer" />
                <div
                  class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"
                ></div>
                <span class="text-sm text-slate-300">Only show running services</span>
              </label>
            </div>
          </div>
          <RouterLink
            to="/add-service"
            class="text-slate-900 bg-blue-600 rounded px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-blue-800 hover:text-gray-900 font-semibold"
          >
            Add Service
          </RouterLink>
        </div>
      </header>

      <!-- Content -->
      <div class="mt-10">
        <div>
          <!-- Tabel -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr
                  class="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400"
                >
                  <th class="py-3 px-4 w-10"></th>
                  <th class="py-3 px-4 font-medium">Name</th>
                  <th class="py-3 px-4 font-medium">Port</th>
                  <th class="py-3 px-4 font-medium">CPU</th>
                  <th class="py-3 px-4 font-medium">Memory Usage</th>
                  <th class="py-3 px-4 font-medium">Last Started</th>
                  <th class="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/40">
                <tr
                  v-for="(r, i) in row"
                  :key="i"
                  class="hover:bg-white/[0.02] transition-colors group"
                >
                  <!-- Indikator Bulat -->
                  <td class="py-3.5 px-4">
                    <span class="inline-block w-2 h-2 rounded-full border border-slate-500"></span>
                  </td>

                  <!-- Data Kolom -->
                  <td class="py-3.5 px-4 text-white font-normal">{{ r.name }}</td>
                  <td class="py-3.5 px-4 text-slate-400 font-mono text-xs">{{ r.port }}</td>
                  <td class="py-3.5 px-4 text-slate-400 font-mono text-xs">{{ r.cpu }}</td>
                  <td class="py-3.5 px-4 text-slate-400 text-xs">{{ r.usageMemory }}</td>
                  <td class="py-3.5 px-4 text-slate-500 text-xs">{{ r.lastStarted }}</td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-right space-x-3 text-slate-400">
                    <button class="hover:text-blue-400 transition-colors" title="Start">
                      <svg class="w-4 h-4 inline fill-current text-blue-500" viewBox="0 0 24 24">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </button>

                    <!-- Dropdown Container dengan .stop agar tidak menutup template utama saat diklik -->
                    <div class="inline relative" @click.stop>
                      <button
                        @click="toggleOptions(i)"
                        class="cursor-pointer hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
                      >
                        <svg
                          class="w-4 h-4 inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          ></path>
                        </svg>
                      </button>

                      <!-- Dropdown Menu per Baris -->
                      <div
                        class="w-44 bg-slate-800 border border-slate-700 rounded shadow-xl top-6 right-0 z-50 p-1 space-y-1 text-left"
                        :class="[activeDropdownIndex === i ? 'absolute' : 'hidden']"
                      >
                        <RouterLink
                          to="/details/pid/service"
                          class="w-full h-full block text-xs text-slate-300 hover:bg-slate-700 px-2 py-1.5 rounded cursor-pointer"
                        >
                          View Detail
                        </RouterLink>
                        <div
                          class="text-xs text-slate-300 hover:bg-slate-700 px-2 py-1.5 rounded cursor-pointer"
                        >
                          Edit
                        </div>
                        <div
                          class="text-xs text-slate-300 hover:bg-slate-700 px-2 py-1.5 rounded cursor-pointer"
                        >
                          Log
                        </div>
                      </div>
                    </div>

                    <button class="hover:text-red-400 transition-colors" title="Delete">
                      <svg
                        class="w-4 h-4 inline text-red-500/80"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </MainTemplate>
</template>
