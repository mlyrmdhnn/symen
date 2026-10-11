<script setup lang="ts">
import { onMounted, ref } from 'vue'
import logoURL from '@/assets/symen_logo.png'
import {
  BookOpenText,
  FileStack,
  House,
  PanelLeftOpen,
  PanelRightOpen,
  Settings,
  SquareText,
  Wrench,
} from '@lucide/vue'
import { useRoute } from 'vue-router'
import { useSideToggle } from '@/stores/sideToggle'
import { storeToRefs } from 'pinia'

const store = useSideToggle()
const { isOpenSide } = storeToRefs(store)
const { toggleSide } = store
const route = useRoute()

const menus = [
  {
    name: 'Dashboard',
    icon: House,
    path: '/',
  },
  {
    name: 'Services',
    icon: Wrench,
    path: '/services',
  },
  {
    name: 'Logs',
    icon: SquareText,
    path: '/logs',
  },
  {
    name: 'Guide',
    icon: BookOpenText,
    path: '/guide',
  },
  {
    name: 'Version',
    icon: FileStack,
    path: '/version',
  },
  {
    name: 'Settings',
    icon: Settings,
    path: '/settings',
  },
]
</script>

<template>
  <div class="main-container flex flex-col h-screen bg-[#10151B] text-white">
    <header class="draggable h-16 bg-slate-950 flex items-center justify-between px-4">
      <!-- Kiri: Logo & Judul -->
      <div class="flex items-center space-x-3 select-none">
        <img :src="logoURL" class="w-10 h-10" alt="Logo" />
        <span class="font-semibold text-sm text-slate-200">Symen</span>
        <!-- <span class="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded font-mono">
          Personal
        </span> -->
      </div>

      <div class="flex-grow px-10">V.1</div>
    </header>

    <!-- Sidebar + Content -->
    <div class="flex flex-1 min-h-0">
      <aside
        class="shrink-0 bg-[#080B0E] border-r border-slate-800 transition-all duration-200"
        :class="[isOpenSide ? 'w-64' : 'w-12']"
      >
        <div
          class="p-2 mt-6 transition-all duration-200"
          :class="isOpenSide ? 'flex justify-end' : 'flex justify-start'"
        >
          <PanelRightOpen
            @click="toggleSide"
            class="transition-all duration-200"
            :class="[isOpenSide ? 'rotate-180' : 'rotate-0']"
          />
        </div>
        <div class="px-2 space-y-2 py-6">
          <div v-for="(m, i) in menus" :key="i" class="flex items-center">
            <RouterLink
              :to="m.path"
              class="w-full p-2 rounded flex items-center duration-200 relative group"
              :class="[m.path == route.path ? 'bg-[#0D1C32]' : 'hover:bg-slate-700']"
            >
              <div class="flex items-center w-full">
                <span>
                  <component
                    :is="m.icon"
                    class="h-5 w-5 shrink-0"
                    :class="[isOpenSide ? 'mr-2' : 'mx-auto']"
                  />
                </span>
                <span :class="[isOpenSide ? 'block' : 'hidden']" class="text-sm">{{ m.name }}</span>
              </div>

              <div
                v-if="!isOpenSide"
                class="absolute left-16 bg-[#1e232a] text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 border border-slate-700 flex items-center"
              >
                <div
                  class="absolute -left-1 w-2 h-2 bg-[#1e232a] border-l border-b border-slate-700 transform rotate-45"
                ></div>

                <span class="relative z-10">{{ m.name }}</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </aside>

      <main class="flex-1 min-w-0 overflow-auto p-4">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.draggable {
  -webkit-app-region: drag;
}
</style>
