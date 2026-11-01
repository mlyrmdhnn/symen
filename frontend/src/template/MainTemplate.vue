<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const route = useRoute()
const workspace = useWorkspaceStore()
onMounted(() => workspace.applyTheme())
watch(
  () => workspace.theme,
  () => workspace.applyTheme(),
)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
    <Sidebar />
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header :title="String(route.meta.title || 'Dashboard')" />
      <main class="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-[1480px] p-5 sm:p-8"><slot /></div>
      </main>
    </div>
  </div>
</template>
