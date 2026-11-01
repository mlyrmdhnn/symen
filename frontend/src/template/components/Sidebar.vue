<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isOpen = ref(true)
const items = [
  { title: 'Dashboard', to: '/', icon: '▦' },
  { title: 'Services', to: '/services', icon: '◫' },
  { title: 'Logs', to: '/logs', icon: '>_' },
  { title: 'Settings', to: '/settings', icon: '⚙' },
]
</script>

<template>
  <aside :class="['flex min-h-screen shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 transition-all dark:border-slate-800 dark:bg-slate-900', isOpen ? 'w-60' : 'w-[68px]']">
    <RouterLink class="mb-8 flex items-center gap-2 px-2" to="/" aria-label="Dockyard home">
      <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-[#2496ED] text-lg text-white">⚓</span>
      <span v-if="isOpen" class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">dockyard<span class="text-[#2496ED]">.</span></span>
    </RouterLink>
    <div v-if="isOpen" class="mb-6 flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-2 text-xs font-semibold dark:border-slate-700">
      <span class="grid size-7 place-items-center rounded-md bg-sky-50 text-[#2496ED] dark:bg-sky-950">S</span>
      <span class="flex-1">Symen workspace</span><span class="text-slate-400">⌄</span>
    </div>
    <p v-if="isOpen" class="mb-2 px-2 text-[10px] font-bold tracking-widest text-slate-400">WORKSPACE</p>
    <nav class="grid gap-1" aria-label="Main navigation">
      <RouterLink v-for="item in items" :key="item.title" :to="item.to" active-class="!bg-sky-50 !text-[#1684d8] dark:!bg-sky-950 dark:!text-sky-300" class="flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" :title="item.title">
        <span class="grid w-5 shrink-0 place-items-center text-base">{{ item.icon }}</span>
        <span v-if="isOpen">{{ item.title }}</span>
        <span v-if="isOpen && item.title === 'Services'" class="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">6</span>
      </RouterLink>
    </nav>
    <div class="mt-auto">
      <div v-if="isOpen" class="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <span class="size-2 rounded-full bg-emerald-500"></span><span><strong class="block text-[10px]">Local environment</strong><small class="text-[9px] text-slate-500">Connected and healthy</small></span>
      </div>
      <button class="mb-3 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" type="button" @click="isOpen = !isOpen">
        <span class="w-5 text-center">{{ isOpen ? '⇤' : '⇥' }}</span><span v-if="isOpen">Collapse sidebar</span>
      </button>
      <div v-if="isOpen" class="flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <span class="grid size-8 place-items-center rounded-full bg-orange-200 font-bold text-orange-800">M</span><span><strong class="block text-[10px]">Mungskiee</strong><small class="text-[9px] text-slate-500">Personal workspace</small></span>
      </div>
    </div>
  </aside>
</template>
