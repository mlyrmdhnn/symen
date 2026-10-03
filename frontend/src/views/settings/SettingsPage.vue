<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import { onMounted, ref } from 'vue'
import http from '../lib/http'
import { useEarlyStartStore } from '@/stores/earlyStart'
const { result } = useEarlyStartStore()

const hasil = ref<any['data']>()
const errorText = ref('')
type DeviceInfoItem = {
  label: string
  value: string
}

const getSpec = async () => {
  errorText.value = ''

  // try {
  //   const res = await http.get('/settings')
  //   hasil.value = res
  // } catch (err) {}
}

// dummy dulu — nanti ganti pakai navigator / API
const deviceInfo: DeviceInfoItem[] = [
  { label: 'Device Name', value: 'MacBook Pro 14"' },
  { label: 'Device Type', value: 'Desktop' },
  { label: 'Operating System', value: 'macOS Sequoia 15.3' },
  { label: 'Browser', value: 'Chrome 133.0.6943.98' },
  { label: 'Platform', value: 'MacIntel' },
  { label: 'Screen Resolution', value: '1512 × 982' },
  { label: 'Viewport', value: '1440 × 900' },
  { label: 'Pixel Ratio', value: '2x' },
  { label: 'CPU Cores', value: '10' },
  { label: 'Device Memory', value: '16 GB' },
  { label: 'Language', value: 'en-US' },
  { label: 'Timezone', value: 'Asia/Jakarta (GMT+7)' },
  { label: 'IP Address', value: '182.253.140.22' },
  {
    label: 'User Agent',
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  },
]

const copyValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    // ignore
  }
}
onMounted(() => {
  getSpec()
})
</script>

<template>
  <MainTemplate>
    <h1 class="font-bold text-lg text-white">Settings</h1>
    <div class="mt-10">
      <section class="border border-slate-800 rounded-md p-4 bg-[#10151A]">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Theme</h2>
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
      </section>
      <p v-if="errorText" class="mt-4 text-sm text-red-300">{{ errorText }}</p>
      <pre>
        {{ result }}
      </pre>
      <!-- Device Information -->
      <section class="mt-6 border border-slate-800 rounded-md p-4 bg-[#10151A]">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Device Information
        </h2>

        <dl class="divide-y divide-slate-800">
          <div
            v-for="item in deviceInfo"
            :key="item.label"
            class="flex items-start justify-between gap-4 py-2.5 group"
          >
            <dt class="text-sm text-slate-400 shrink-0">{{ item.label }}</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200 text-right break-all">{{ item.value }}</span>
              <button
                type="button"
                class="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-slate-500 hover:text-slate-300 cursor-pointer shrink-0"
                title="Copy"
                @click="copyValue(item.value)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </MainTemplate>
</template>
