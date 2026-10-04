<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import { onMounted, ref } from 'vue'
import { useEarlyStartStore } from '@/stores/earlyStart'
import SettingsCard from '@/components/SettingsCard.vue'
import ToggleButton from '@/components/ToggleButton.vue'

const toggleButton = ref(false)

const { result } = useEarlyStartStore()
</script>

<template>
  <MainTemplate>
    <h1 class="font-bold text-lg text-white">Settings</h1>
    <div class="mt-10">
      <SettingsCard tittle="Theme">
        <div class="space-y-2">
          <label
            for="light"
            class="flex items-center justify-between p-3 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <span class="text-sm text-slate-200">Light</span>
            <input type="radio" name="theme" id="light" class="accent-blue-500 cursor-pointer" />
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
              checked
            />
          </label>

          <label
            for="system"
            class="flex items-center justify-between p-3 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <span class="text-sm text-slate-200">System</span>
            <input type="radio" name="theme" id="system" class="accent-blue-500 cursor-pointer" />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard tittle="General" class="mt-6 text-slate-400 text-sm">
        <div class="flex justify-between">
          <section>Realtime Dashboard Chart</section>
          <ToggleButton v-model="toggleButton" />
        </div>
      </SettingsCard>

      <SettingsCard tittle="Device Information" class="mt-6">
        <dl class="divide-y divide-slate-800">
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
      </SettingsCard>
    </div>
  </MainTemplate>
</template>
