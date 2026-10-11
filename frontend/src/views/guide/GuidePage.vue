<script setup lang="ts">
import { RouterLink } from 'vue-router'
import MainTemplate from '@/template/MainTemplate.vue'
import { FolderOpen, Play, ScrollText, Settings2, Wrench } from '@lucide/vue'

const steps = [
  {
    number: '01',
    title: 'Link an installation',
    description:
      'Choose a service type, give it a name, and select the folder containing its existing local installation.',
    icon: FolderOpen,
  },
  {
    number: '02',
    title: 'Check its configuration',
    description:
      'Let Symen detect the usual executable, or enter its name. Add startup arguments when your service needs a config or data directory.',
    icon: Settings2,
  },
  {
    number: '03',
    title: 'Start and monitor',
    description:
      'Start or stop the process from Services. Its status refreshes automatically while Symen is open.',
    icon: Play,
  },
  {
    number: '04',
    title: 'Inspect output',
    description:
      'Open an individual service log or the combined log view to inspect output captured from running processes.',
    icon: ScrollText,
  },
]

const serviceTypes = [
  {
    name: 'Nginx',
    executable: 'nginx.exe',
    note: 'Runs in the foreground for process monitoring.',
  },
  {
    name: 'MySQL',
    executable: 'mysqld.exe',
    note: 'Use an initialized data directory and suitable configuration.',
  },
  {
    name: 'PostgreSQL',
    executable: 'postgres.exe',
    note: 'Pass -D and the initialized data directory when needed.',
  },
  { name: 'Apache', executable: 'httpd.exe', note: 'May require a valid server configuration.' },
  {
    name: 'Redis',
    executable: 'redis-server.exe',
    note: 'Can optionally be started with a config file.',
  },
  {
    name: 'PHP-CGI',
    executable: 'php-cgi.exe',
    note: 'Typically needs a bind argument, such as -b 127.0.0.1:9000.',
  },
  {
    name: 'Custom',
    executable: 'Your executable',
    note: 'The executable path must be relative to the selected folder.',
  },
]
</script>

<template>
  <MainTemplate>
    <div class="mx-auto space-y-7">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Getting started
          </p>
          <h1 class="mt-1 text-2xl font-bold text-white">Service manager guide</h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Use Symen to link and manage development services already installed on your machine.
            Services run as local processes under your user account.
          </p>
        </div>
        <RouterLink
          to="/add-service"
          class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <Wrench class="h-4 w-4" />
          Link a service
        </RouterLink>
      </header>

      <section class="rounded-lg border border-slate-800 bg-[#10151A] p-5">
        <h2 class="text-sm font-semibold text-white">Your first service</h2>
        <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="step in steps" :key="step.number" class="relative">
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400"
              >
                <component :is="step.icon" class="h-4 w-4" />
              </span>
              <span class="font-mono text-xs text-slate-500">{{ step.number }}</span>
            </div>
            <h3 class="mt-3 text-sm font-medium text-slate-200">{{ step.title }}</h3>
            <p class="mt-1 text-xs leading-relaxed text-slate-400">{{ step.description }}</p>
          </article>
        </div>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-800 bg-[#10151A]">
        <div class="border-b border-slate-800 px-5 py-4">
          <h2 class="text-sm font-semibold text-white">Supported service types</h2>
          <p class="mt-1 text-xs text-slate-400">
            Executables are detected in the selected folder and common bin folders.
          </p>
        </div>
        <div class="divide-y divide-slate-800/60">
          <article
            v-for="service in serviceTypes"
            :key="service.name"
            class="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[130px_180px_1fr] sm:items-center sm:gap-4"
          >
            <h3 class="text-sm font-medium text-slate-200">{{ service.name }}</h3>
            <code class="text-xs text-blue-400">{{ service.executable }}</code>
            <p class="text-xs leading-relaxed text-slate-400">{{ service.note }}</p>
          </article>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article class="rounded-lg border border-slate-800 bg-[#10151A] p-5">
          <h2 class="text-sm font-semibold text-white">Configuration tips</h2>
          <ul class="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-400">
            <li>
              <span class="font-medium text-slate-200">Folder:</span>
              choose the installation folder, not necessarily the executable itself.
            </li>
            <li>
              <span class="font-medium text-slate-200">Arguments:</span>
              enter one argument per line; each line is passed as one argument.
            </li>
            <li>
              <span class="font-medium text-slate-200">Databases:</span>
              prepare the data directory and configuration before starting MySQL or PostgreSQL.
            </li>
            <li>
              <span class="font-medium text-slate-200">Editing:</span>
              stop a service before changing its path or startup arguments.
            </li>
          </ul>
        </article>

        <article class="rounded-lg border border-slate-800 bg-[#10151A] p-5">
          <h2 class="text-sm font-semibold text-white">Common questions</h2>
          <div class="mt-3 space-y-4">
            <div>
              <h3 class="text-xs font-medium text-slate-200">Does Symen install services?</h3>
              <p class="mt-1 text-xs leading-relaxed text-slate-400">
                Not yet. The current workflow links an installation already on your machine; it does
                not download or provision service binaries.
              </p>
            </div>
            <div>
              <h3 class="text-xs font-medium text-slate-200">Are these Windows services?</h3>
              <p class="mt-1 text-xs leading-relaxed text-slate-400">
                No. Symen launches native child processes as your current user; it does not register
                them with the operating system's service manager.
              </p>
            </div>
            <div>
              <h3 class="text-xs font-medium text-slate-200">Why are some logs missing?</h3>
              <p class="mt-1 text-xs leading-relaxed text-slate-400">
                The log view captures process stdout and stderr. A service that writes only to its
                own log files may not show that output here.
              </p>
            </div>
          </div>
        </article>
      </section>

      <footer
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/60 px-5 py-4"
      >
        <div>
          <p class="text-sm font-medium text-white">Ready to manage a local environment?</p>
          <p class="mt-1 text-xs text-slate-400">
            Add a service or check the current process status.
          </p>
        </div>
        <div class="flex gap-2">
          <RouterLink
            to="/services"
            class="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            View services
          </RouterLink>
          <RouterLink
            to="/logs"
            class="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            View logs
          </RouterLink>
        </div>
      </footer>
    </div>
  </MainTemplate>
</template>
