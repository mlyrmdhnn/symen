<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import MainTemplate from '@/template/MainTemplate.vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
const services = computed(() => workspace.services.slice(0, 4))
</script>

<template>
  <MainTemplate>
    <section class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p
          class="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500"
        >
          <span class="h-0.5 w-4 bg-[#2496ED]"></span> SUNDAY, NOVEMBER 1, 2026
        </p>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Good evening, Mungskiee <span class="text-[#2496ED]">✦</span>
        </h1>
        <p class="mt-2 text-xs text-slate-500">
          Here’s what’s happening with your containers today.
        </p>
      </div>
      <RouterLink
        class="inline-flex h-9 items-center gap-2 rounded-md bg-[#2496ED] px-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#1684d8]"
        to="/services"
        >＋ New service</RouterLink
      >
    </section>

    <section class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in [
          {
            label: 'Total services',
            value: workspace.services.length,
            detail: 'Across all environments',
            icon: '◫',
          },
          {
            label: 'Running containers',
            value: `${workspace.runningCount} / ${workspace.services.length}`,
            detail: 'All systems go',
            icon: '✓',
          },
          { label: 'CPU usage', value: '24.8%', detail: '↓ 4.2% from last hour', icon: '⌁' },
          { label: 'Memory usage', value: '6.4 GB', detail: 'of 16 GB', icon: '▤' },
        ]"
        :key="stat.label"
        class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>{{ stat.label }}</span
          ><span
            class="grid size-8 place-items-center rounded-lg bg-sky-50 text-base text-[#2496ED] dark:bg-sky-950"
            >{{ stat.icon }}</span
          >
        </div>
        <p class="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {{ stat.value }}
        </p>
        <p class="mt-1 text-[10px] text-slate-500">{{ stat.detail }}</p>
      </article>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <article
        class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between p-4">
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">Services</h2>
            <p class="mt-1 text-[10px] text-slate-500">Your containers at a glance</p>
          </div>
          <RouterLink class="text-xs font-bold text-[#1684d8] hover:underline" to="/services"
            >View all →</RouterLink
          >
        </div>
        <div
          v-for="service in services"
          :key="service.id"
          class="flex min-h-14 items-center gap-3 border-t border-slate-100 px-4 dark:border-slate-800"
        >
          <span
            class="grid size-8 shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-xs font-bold text-[#2496ED] dark:border-slate-700 dark:bg-slate-800"
            >{{ service.image.slice(0, 1).toUpperCase() }}</span
          >
          <span class="min-w-0 flex-1"
            ><strong class="block truncate text-[11px] text-slate-900 dark:text-slate-100">{{
              service.name
            }}</strong
            ><small class="font-mono text-[9px] text-slate-500"
              >{{ service.image }}:{{ service.tag }}</small
            ></span
          >
          <code class="hidden text-[9px] text-slate-500 sm:block">{{ service.ports }}</code>
          <span
            :class="[
              'rounded-full px-2 py-1 text-[9px] font-bold',
              service.status === 'Running'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
            ]"
            >{{ service.status }}</span
          >
        </div>
        <RouterLink
          class="block border-t border-slate-100 p-3 text-center text-[10px] font-bold text-[#1684d8] dark:border-slate-800"
          to="/services"
          >Manage all services →</RouterLink
        >
      </article>

      <article
        class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="p-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">Recent activity</h2>
          <p class="mt-1 text-[10px] text-slate-500">Latest events in your workspace</p>
        </div>
        <div
          v-for="activity in [
            ['✓', 'Container started', 'api-gateway is now running', '2 minutes ago'],
            ['↓', 'Image pulled', 'postgres:16.2 downloaded successfully', '18 minutes ago'],
            ['↻', 'Container restarted', 'worker-queue restarted by policy', '1 hour ago'],
            ['■', 'Container stopped', 'minio-storage stopped manually', 'Yesterday'],
          ]"
          :key="activity[1]"
          class="flex gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800"
        >
          <span
            class="grid size-6 shrink-0 place-items-center rounded-full border border-slate-200 text-[10px] text-[#2496ED] dark:border-slate-700"
            >{{ activity[0] }}</span
          >
          <div>
            <strong class="block text-[10px] text-slate-800 dark:text-slate-200">{{
              activity[1]
            }}</strong>
            <p class="mt-1 text-[9px] text-slate-500">{{ activity[2] }}</p>
            <small class="mt-1 block text-[9px] text-slate-400">{{ activity[3] }}</small>
          </div>
        </div>
        <RouterLink
          class="block border-t border-slate-100 p-3 text-center text-[10px] font-bold text-[#1684d8] dark:border-slate-800"
          to="/logs"
          >View activity log →</RouterLink
        >
      </article>
    </section>
    <footer class="flex justify-between gap-3 pt-5 text-[9px] text-slate-400">
      <span>Dockyard · Local development environment</span
      ><span>All data is mocked for preview</span>
    </footer>
  </MainTemplate>
</template>
