<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEarlyStartStore } from './stores/earlyStart'
import { useSettings } from './stores/settings'

const earlyStartStore = useEarlyStartStore()
const { isLoading } = storeToRefs(earlyStartStore)
const settingsStore = useSettings()
earlyStartStore.getDeviceInformation()
void settingsStore.initializeTheme()
</script>

<template>
  <RouterView />
  <div
    v-if="isLoading"
    class="absolute top-0 right-0 bg-slate-950 h-screen w-screen flex justify-center items-center"
  >
    <div>
      <div class="relative w-30 h-30">
        <div
          class="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"
        ></div>
        <div
          class="absolute top-0 left-0 w-full h-full border-4 border-blue-700 rounded-full border-t-transparent animate-spin"
        ></div>
      </div>
      <div class="text-white text-center mt-6">Starting Engine...</div>
    </div>
  </div>
</template>

<style scoped></style>
