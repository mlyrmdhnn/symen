<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import { useWorkspaceStore, type ThemeMode } from '@/stores/workspace'

const workspace = useWorkspaceStore()
const themes: { value: ThemeMode; title: string; description: string }[] = [
  { value: 'light', title: 'Light', description: 'A crisp, bright workspace' },
  { value: 'dark', title: 'Dark', description: 'Easy on the eyes, day or night' },
  { value: 'system', title: 'System', description: 'Follows your device settings' },
]
</script>

<template>
  <MainTemplate>
    <section class="mb-7">
      <p class="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500">
        <span class="h-0.5 w-4 bg-[#2496ED]"></span> PREFERENCES
      </p>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p class="mt-2 text-xs text-slate-500">Make Dockyard feel right for the way you work.</p>
    </section>

    <div>
      <div class="grid gap-4">
        <section
          id="appearance"
          class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span
              class="grid size-8 place-items-center rounded-lg bg-sky-50 text-[#2496ED] dark:bg-sky-950"
              >◐</span
            >
            <div>
              <h2 class="text-xs font-bold">Appearance</h2>
              <p class="mt-1 text-[9px] text-slate-500">
                Customize how Dockyard looks on this device.
              </p>
            </div>
          </div>
          <div class="py-4">
            <strong class="text-[10px]">Color theme</strong>
            <p class="mt-1 text-[9px] text-slate-500">Choose your preferred appearance.</p>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="theme in themes"
              :key="theme.value"
              type="button"
              :class="[
                'rounded-lg border p-2 text-left transition',
                workspace.theme === theme.value
                  ? 'border-[#2496ED] ring-1 ring-[#2496ED]'
                  : 'border-slate-200 dark:border-slate-700',
              ]"
              @click="workspace.theme = theme.value"
            >
              <span
                :class="[
                  'mb-2 flex h-16 gap-1 rounded border p-1.5',
                  theme.value === 'dark'
                    ? 'border-slate-700 bg-slate-900'
                    : theme.value === 'system'
                      ? 'border-slate-300 bg-gradient-to-r from-slate-100 to-slate-800'
                      : 'border-slate-200 bg-slate-100',
                ]"
                ><span
                  :class="[
                    'w-1/4 rounded-sm',
                    theme.value === 'dark'
                      ? 'bg-slate-700'
                      : theme.value === 'system'
                        ? 'bg-gradient-to-r from-white to-slate-700'
                        : 'bg-white',
                  ]"
                ></span
                ><span
                  :class="[
                    'flex-1 rounded-sm p-1',
                    theme.value === 'dark'
                      ? 'bg-slate-800'
                      : theme.value === 'system'
                        ? 'bg-gradient-to-r from-white to-slate-800'
                        : 'bg-white',
                  ]"
                  ><i class="block h-1 w-1/2 rounded bg-[#2496ED]"></i
                  ><i class="mt-1 block h-3 rounded bg-slate-200 dark:bg-slate-600"></i></span
              ></span>
              <strong class="block text-[9px]">{{ theme.title }}</strong
              ><small class="mt-1 block text-[8px] text-slate-500">{{ theme.description }}</small>
            </button>
          </div>
          <div
            class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-800"
          >
            <div>
              <strong class="text-[10px]">Accent color</strong>
              <p class="mt-1 text-[9px] text-slate-500">Used for actions and focus.</p>
            </div>
            <span class="flex items-center gap-2 text-[9px] font-semibold"
              ><i class="size-3 rounded bg-[#2496ED]"></i> Docker blue
              <code class="text-slate-500">#2496ED</code></span
            >
          </div>
        </section>

        <section
          id="workspace"
          class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span
              class="grid size-8 place-items-center rounded-lg bg-sky-50 text-[#2496ED] dark:bg-sky-950"
              >⌂</span
            >
            <div>
              <h2 class="text-xs font-bold">Workspace</h2>
              <p class="mt-1 text-[9px] text-slate-500">
                Your local development environment details.
              </p>
            </div>
          </div>
          <div
            class="flex min-h-11 items-center justify-between border-b border-slate-100 text-[9px] dark:border-slate-800"
          >
            <span class="text-slate-500">Workspace name</span
            ><strong
              >Symen workspace
              <button class="ml-2 text-[#1684d8]" type="button">Edit</button></strong
            >
          </div>
          <div
            class="flex min-h-11 items-center justify-between border-b border-slate-100 text-[9px] dark:border-slate-800"
          >
            <span class="text-slate-500">Environment</span
            ><strong
              ><i class="mr-1 inline-block size-1.5 rounded-full bg-emerald-500"></i>Local
              development</strong
            >
          </div>
          <div class="flex min-h-11 items-center justify-between text-[9px]">
            <span class="text-slate-500">Data source</span
            ><strong
              >Mock data
              <span
                class="ml-1 rounded bg-sky-50 px-1.5 py-1 text-[8px] text-[#1684d8] dark:bg-sky-950"
                >PREVIEW</span
              ></strong
            >
          </div>
        </section>

        <section
          id="about"
          class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <span class="grid size-9 place-items-center rounded-lg bg-[#2496ED] text-lg text-white"
            >⚓</span
          >
          <div class="flex-1">
            <strong class="text-[10px]"
              >Dockyard <span class="ml-1 font-normal text-slate-500">v0.1.0</span></strong
            >
            <p class="mt-1 text-[9px] text-slate-500">
              A calmer way to work with containers. Docker-inspired UI · Frontend preview.
            </p>
          </div>
          <span
            class="rounded bg-sky-50 px-2 py-1 text-[8px] font-bold text-[#1684d8] dark:bg-sky-950"
            >PREVIEW</span
          >
        </section>
      </div>
    </div>
  </MainTemplate>
</template>
