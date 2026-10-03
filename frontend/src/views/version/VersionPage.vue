<script setup lang="ts">
import { ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'

// Contoh data versi komponen (ala Docker Desktop / System Info)
const versionInfo = ref({
  appVersion: 'v4.32.0',
  engineVersion: '27.1.1',
  composeVersion: 'v2.29.1',
  kubernetesVersion: 'v1.30.2',
  electronVersion: '31.3.1',
  nodejsVersion: '20.14.0',
})

const isChecking = ref(false)
const updateMessage = ref('')

const checkForUpdates = () => {
  isChecking.value = true
  updateMessage.value = ''
  setTimeout(() => {
    isChecking.value = false
    updateMessage.value = 'You are using the latest version of the application.'
  }, 1500)
}
</script>

<template>
  <MainTemplate>
    <div class="max-w-4xl">
      <!-- Header Halaman -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 class="font-bold text-xl text-white">About Version</h1>
          <p class="text-xs text-slate-400 mt-1">
            Check current system build, engine components, and update status.
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-mono text-emerald-400">System Stable</span>
        </div>
      </div>

      <!-- Kartu Utama Informasi Aplikasi -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Brand / Logo Card -->
        <div
          class="bg-[#10151A] border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center"
        >
          <div
            class="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400"
          >
            <!-- Icon / Logo Mockup -->
            <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <h2 class="font-semibold text-white text-base">Service Manager</h2>
          <p class="text-xs font-mono text-blue-400 mt-1">{{ versionInfo.appVersion }}</p>
          <button
            @click="checkForUpdates"
            :disabled="isChecking"
            class="mt-6 w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {{ isChecking ? 'Checking for updates...' : 'Check for Updates' }}
          </button>
          <p v-if="updateMessage" class="text-[11px] text-slate-400 mt-2 text-center">
            {{ updateMessage }}
          </p>
        </div>

        <!-- Detail Komponen / Engine -->
        <div
          class="md:col-span-2 bg-[#10151A] border border-slate-800 rounded-lg p-6 flex flex-col justify-between"
        >
          <div>
            <h3 class="text-sm font-medium text-slate-300 mb-4">Components & Runtimes</h3>
            <div class="divide-y divide-slate-800/60 text-xs">
              <div class="py-2.5 flex justify-between items-center">
                <span class="text-slate-400">Engine Version</span>
                <span
                  class="font-mono text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50"
                  >{{ versionInfo.engineVersion }}</span
                >
              </div>
              <div class="py-2.5 flex justify-between items-center">
                <span class="text-slate-400">Compose</span>
                <span
                  class="font-mono text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50"
                  >{{ versionInfo.composeVersion }}</span
                >
              </div>
              <div class="py-2.5 flex justify-between items-center">
                <span class="text-slate-400">Kubernetes</span>
                <span
                  class="font-mono text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50"
                  >{{ versionInfo.kubernetesVersion }}</span
                >
              </div>
              <div class="py-2.5 flex justify-between items-center">
                <span class="text-slate-400">Electron / Desktop UI</span>
                <span
                  class="font-mono text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50"
                  >{{ versionInfo.electronVersion }}</span
                >
              </div>
              <div class="py-2.5 flex justify-between items-center">
                <span class="text-slate-400">Node.js Runtime</span>
                <span
                  class="font-mono text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50"
                  >{{ versionInfo.nodejsVersion }}</span
                >
              </div>
            </div>
          </div>

          <div
            class="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-500"
          >
            <span>License: MIT / Proprietary</span>
            <span class="hover:text-blue-400 cursor-pointer transition-colors"
              >View Release Notes</span
            >
          </div>
        </div>
      </div>
    </div>
  </MainTemplate>
</template>
