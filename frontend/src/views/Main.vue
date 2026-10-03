<script setup lang="ts">
import { ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'
import http from './lib/http'

const payload = ref('')
const hasil = ref('')
const req = async () => {
  const res = await http.post('/test', {
    payload: payload.value,
  })
  hasil.value = res
}

// const requestText = ref('Hello World')
// const responseText = ref('')
// const errorText = ref('')

// const handleRequest = async (action: PythonAction) => {
//   responseText.value = ''
//   errorText.value = ''

//   try {
//     if (!window.electronAPI) {
//       throw new Error('Python requests are available only in the Electron app. Run npm run dev.')
//     }

//     // Ask Electron to run one Python action and show its answer.
//     const response = await window.electronAPI.runPython({ action, text: requestText.value })
//     responseText.value = response.message
//   } catch (err) {
//     errorText.value = err instanceof Error ? err.message : String(err)
//   }
// }
</script>

<template>
  <MainTemplate>
    <h1 class="font-bold text-lg text-slate-100">Dashboard</h1>

    <!-- 1. Bagian Metric Cards (Ringkasan Angka Cepat) -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
        <p class="text-xs text-slate-400 uppercase tracking-wider">Active Ports</p>
        <p class="text-2xl font-semibold text-white mt-1">5 Services</p>
      </div>
      <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
        <p class="text-xs text-slate-400 uppercase tracking-wider">Total Running PID</p>
        <p class="text-2xl font-semibold text-emerald-400 mt-1">12 Processes</p>
      </div>
      <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
        <p class="text-xs text-slate-400 uppercase tracking-wider">System Status</p>
        <p class="text-2xl font-semibold text-blue-400 mt-1">Healthy</p>
      </div>
    </div>

    <!-- 2. Bagian Grafik Donut -->
    <!-- <div class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
          <div ref="cpuChartRef"></div>
        </div>

        <div class="bg-[#181a1b] p-4 rounded-lg border border-slate-800">
          <div ref="ramChartRef"></div>
        </div>
      </div>
    </div> -->

    <div class="mt-6 flex flex-wrap items-center gap-2">
      <input
        v-model="payload"
        aria-label="Text to send to Python"
        class="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
      />
      <!-- <button @click="handleRequest('greet')" class="rounded bg-slate-700 px-3 py-2 text-sm">
        Greet
      </button>
      <button @click="handleRequest('uppercase')" class="rounded bg-slate-700 px-3 py-2 text-sm">
        Uppercase
      </button>
      <button @click="handleRequest('word-count')" class="rounded bg-slate-700 px-3 py-2 text-sm">
        Count words
      </button> -->
      <button @click="req" class="rounded bg-slate-700 px-3 py-2 text-sm">Salam dari py</button>
      {{ hasil }}
    </div>
  </MainTemplate>
</template>
