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
  <div class="flex h-screen overflow-hidden bg-surface text-primary">
    <Sidebar />
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header :title="String(route.meta.title || 'Dashboard')" />
      <main class="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div class="mx-auto w-full max-w-[1480px] p-6 sm:p-8 lg:p-10">
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="translate-x-3 opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="-translate-x-3 opacity-0"
            mode="out-in"
          >
            <div :key="route.path">
              <slot />
            </div>
          </Transition>
        </div>
      </main>
    </div>
  </div>
</template>
