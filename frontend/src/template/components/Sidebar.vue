<script setup lang="ts">
import {
  Bug,
  House,
  Settings,
  Terminal,
  Wrench,
  CircleArrowLeft,
  Component,
  ArrowUpFromLine,
} from '@lucide/vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAnimation } from '@/stores/animation'
import { storeToRefs } from 'pinia'
import LetterS from '@/components/LetterS.vue'

const animation = useAnimation()
const { isOpen } = storeToRefs(animation)

const workpasce = useWorkspaceStore()
const userInitial = computed(() => workpasce.userName.charAt(0).toUpperCase() || 'U')

const items = ref([
  { title: 'Dashboard', to: '/', icon: House, isHover: false },
  { title: 'Services', to: '/services', icon: Wrench, isHover: false },
  { title: 'Logs', to: '/logs', icon: Terminal, isHover: false },
  { title: 'Version', to: '/version', icon: ArrowUpFromLine, isHover: false },
  { title: 'Settings', to: '/settings', icon: Settings, isHover: false },
  // { title: 'testing', to: '/setup', icon: Bug, isHover: false },
])
</script>

<template>
  <aside
    :class="[
      'flex min-h-screen shrink-0 flex-col overflow-hidden border-r border-subtle bg-elevated px-3 py-6 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
      isOpen ? 'w-60' : 'w-[68px]',
    ]"
  >
    <RouterLink class="mb-10 flex items-center gap-3 px-2" to="/" aria-label="Dockyard home">
      <!-- <span
        class="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-lg text-accent-fg"
        >⚓</span -->
      <LetterS class="size-9" />
      <span
        :class="[
          'overflow-hidden whitespace-nowrap text-xl font-bold tracking-tight text-primary transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0',
        ]"
        >Symen<span class="text-accent">.</span></span
      >
    </RouterLink>

    <p
      :class="[
        'overflow-hidden whitespace-nowrap px-2 text-[10px] font-bold tracking-[0.16em] text-muted transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isOpen ? 'mb-3 max-h-5 opacity-100' : 'mb-0 max-h-0 opacity-0',
      ]"
    >
      WORKSPACE
    </p>

    <nav class="grid gap-2" aria-label="Main navigation">
      <RouterLink
        v-for="(item, i) in items"
        :key="item.title"
        :to="item.to"
        active-class="!bg-soft !text-primary"
        class="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        :title="item.title"
        @mouseenter="item.isHover = true"
        @mouseleave="item.isHover = false"
      >
        <div
          v-if="!isOpen && item.isHover"
          class="absolute left-16 -translate-y-1/2 text-sm px-3 py-1.5 rounded shadow-md whitespace-nowrap z-50 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-2 before:border-y-[6px] before:border-y-transparent before:border-r-[8px] bg-surface"
        >
          {{ item.title }}
        </div>

        <span class="grid w-5 shrink-0 place-items-center">
          <component :size="20" :is="item.icon" />
        </span>
        <span
          :class="[
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isOpen ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0',
          ]"
        >
          {{ item.title }}
        </span>
      </RouterLink>
    </nav>

    <div class="mt-auto">
      <button
        class="mb-4 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-muted transition-colors duration-200 hover:bg-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        type="button"
        @click="isOpen = !isOpen"
      >
        <span class="grid w-5 shrink-0 place-items-center">
          <CircleArrowLeft
            :class="[
              'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              isOpen ? 'rotate-0' : 'rotate-180',
            ]"
          />
        </span>
        <span
          :class="[
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isOpen ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0',
          ]"
        >
          Collapse sidebar
        </span>
      </button>

      <div
        :class="[
          'flex items-center gap-3 overflow-hidden border-t border-subtle transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'max-h-20 pt-4 opacity-100' : 'max-h-0 border-transparent pt-0 opacity-0',
        ]"
      >
        <button
          class="grid size-9 shrink-0 place-items-center rounded-full border border-subtle bg-soft text-xs font-bold text-primary"
          aria-label="User menu"
        >
          {{ userInitial }}
        </button>
        <span class="whitespace-nowrap">
          <strong class="block text-xs font-semibold">{{ workpasce.userName || 'User' }}</strong>
          <small class="text-xs text-muted">Personal workspace</small>
        </span>
      </div>
    </div>
  </aside>
</template>
