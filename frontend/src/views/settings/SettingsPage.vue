<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import { computed, onMounted } from 'vue'
import { useEarlyStartStore } from '@/stores/earlyStart'
import SettingsCard from '@/components/SettingsCard.vue'
import ToggleButton from '@/components/ToggleButton.vue'
import { storeToRefs } from 'pinia'
import { useSettings } from '@/stores/settings'

const earlyStartStore = useEarlyStartStore()
const useSettingsStore = useSettings()

const { result, isLoading, error: deviceError } = storeToRefs(earlyStartStore)
const {
  realtimeChartToggle,
  earlyInitializeSettings,
  theme,
  themeLoading,
  themeSaving,
  themeError,
  chartSaving,
  chartError,
  startupArgumentsText,
  startupArgumentsPath,
  startupArgumentsLoading,
  startupArgumentsSaving,
  startupArgumentsError,
} = storeToRefs(useSettingsStore)

const selectedThemeLabel = computed(() => {
  if (theme.value === 'system') return 'System preference'
  return theme.value === 'light' ? 'Light appearance' : 'Dark appearance'
})

onMounted(() => {
  void useSettingsStore.getChartToggle()
  void useSettingsStore.loadStartupArguments()
  void earlyStartStore.getDeviceInformation()
})
</script>

<template>
  <MainTemplate>
    <h1 class="font-bold text-lg text-white">Settings</h1>
    <div class="mt-10">
      <SettingsCard tittle="Theme">
        <p class="mb-2 text-xs text-slate-400">
          Choose how Symen looks. Current selection: {{ selectedThemeLabel }}.
        </p>
        <div class="space-y-2">
          <label
            for="light"
            class="flex items-center justify-between p-3 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <span class="text-sm text-slate-200">Light</span>
            <input
              type="radio"
              name="theme"
              id="light"
              class="accent-blue-500 cursor-pointer"
              :checked="theme === 'light'"
              :disabled="themeLoading || themeSaving"
              @change="useSettingsStore.setTheme('light')"
            />
          </label>

          <label
            for="dark"
            class="flex items-center justify-between p-3 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <span class="text-sm text-slate-200">Dark</span>
            <input
              type="radio"
              name="theme"
              id="dark"
              class="accent-blue-500 cursor-pointer"
              :checked="theme === 'dark'"
              :disabled="themeLoading || themeSaving"
              @change="useSettingsStore.setTheme('dark')"
            />
          </label>

          <label
            for="system"
            class="flex items-center justify-between p-3 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <span class="text-sm text-slate-200">System</span>
            <input
              type="radio"
              name="theme"
              id="system"
              class="accent-blue-500 cursor-pointer"
              :checked="theme === 'system'"
              :disabled="themeLoading || themeSaving"
              @change="useSettingsStore.setTheme('system')"
            />
          </label>
        </div>
        <p v-if="themeError" class="mt-2 text-xs text-red-400" role="alert">{{ themeError }}</p>
      </SettingsCard>

      <SettingsCard tittle="General" class="mt-6 text-slate-400 text-sm">
        <div class="flex items-center justify-between gap-4">
          <section>
            <p class="text-sm text-slate-200">Realtime Dashboard Chart</p>
            <p class="mt-1 text-xs text-slate-500">
              Show live CPU and memory charts on the dashboard.
            </p>
          </section>
          <ToggleButton
            v-if="!earlyInitializeSettings"
            :model-value="realtimeChartToggle"
            :disabled="chartSaving"
            @update:model-value="useSettingsStore.setChartToggle"
          />
          <span v-else class="text-sm text-slate-400">Loading...</span>
        </div>
        <p v-if="chartError" class="mt-2 text-xs text-red-400" role="alert">{{ chartError }}</p>
      </SettingsCard>

      <SettingsCard tittle="Service Startup Arguments" class="mt-6">
        <p class="mb-2 text-xs text-slate-400">
          Edit the default arguments Symen adds when starting each service. Changes are saved to
          <code class="break-all text-slate-300">{{ startupArgumentsPath || 'symen.conf' }}</code>
          and affect the next service start. Saving asks for confirmation and only requires
          permission to write your user config; administrator access is not needed.
        </p>
        <textarea
          v-if="!startupArgumentsLoading"
          v-model="startupArgumentsText"
          aria-label="Service startup arguments JSON"
          autocomplete="off"
          spellcheck="false"
          class="min-h-72 w-full resize-y rounded border border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-200 outline-none focus:border-blue-500"
          :disabled="startupArgumentsSaving"
        ></textarea>
        <p v-else class="text-sm text-slate-400">Loading startup arguments...</p>
        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-50"
            :disabled="startupArgumentsLoading || startupArgumentsSaving"
            @click="useSettingsStore.saveStartupArguments"
          >
            {{ startupArgumentsSaving ? 'Saving…' : 'Save startup arguments' }}
          </button>
        </div>
        <p v-if="startupArgumentsError" class="mt-2 text-xs text-red-400" role="alert">
          {{ startupArgumentsError }}
        </p>
      </SettingsCard>

      <SettingsCard tittle="Device Information" class="mt-6">
        <div class="mb-3 flex items-center justify-end">
          <button
            type="button"
            class="rounded border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800 disabled:cursor-wait disabled:opacity-50"
            :disabled="isLoading"
            @click="earlyStartStore.getDeviceInformation"
          >
            {{ isLoading ? 'Refreshing…' : 'Refresh device details' }}
          </button>
        </div>
        <dl v-if="result" class="divide-y divide-slate-800">
          <div class="flex items-start justify-between gap-4 py-2.5 group">
            <dt class="text-sm text-slate-400 shrink-0">Device Name</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">{{
                result.deviceName
              }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4 py-2.5 group">
            <dt class="text-sm text-slate-400 shrink-0">OS</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">{{ result.os }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4 py-2.5 group">
            <dt class="text-sm text-slate-400 shrink-0">Processor</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">{{
                result.processor
              }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4 py-2.5 group">
            <dt class="text-sm text-slate-400 shrink-0">Timezone</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">{{
                result.timezone.name
              }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4 py-2.5 group">
            <dt class="text-sm text-slate-400 shrink-0">CPU Cores</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">
                {{ result.cpu.physicalCores }} Physical / {{ result.cpu.logicalCores }} Logical
              </span>
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4 py-2.5 group">
            <dt class="text-sm text-slate-400 shrink-0">Total RAM</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all"
                >{{ result.ram.totalGb }} GB</span
              >
            </dd>
          </div>
          <div
            v-for="disk in result.disks"
            :key="disk.device"
            class="flex items-start justify-between gap-4 py-2.5 group"
          >
            <dt class="text-sm text-slate-400 shrink-0">Disk {{ disk.device }}</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">
                {{ disk.usedGb }} GB / {{ disk.totalGb }} GB ({{ disk.usagePercent }}%)
              </span>
            </dd>
          </div>
        </dl>
        <p v-else-if="isLoading" class="text-sm text-slate-400">Loading device information...</p>
        <div v-else>
          <p class="text-sm text-slate-400">Device information is unavailable.</p>
          <p v-if="deviceError" class="mt-2 text-xs text-red-400" role="alert">
            {{ deviceError }}
          </p>
        </div>
      </SettingsCard>
    </div>
  </MainTemplate>
</template>
