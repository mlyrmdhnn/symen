<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 dark:border-slate-800 dark:bg-slate-900">
    <div class="flex items-center gap-2 text-xs text-slate-500"><span>Workspace</span><span class="text-slate-300">/</span><strong class="text-slate-800 dark:text-slate-100">{{ title }}</strong></div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold dark:border-slate-700"><span class="size-1.5 rounded-full bg-emerald-500"></span> Local engine <span class="text-slate-400">⌄</span></div>
      <button class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Help">?</button>
      <button class="grid size-7 place-items-center rounded-full bg-orange-200 text-[10px] font-bold text-orange-800" aria-label="User menu">M</button>
    </div>
  </header>
</template>
