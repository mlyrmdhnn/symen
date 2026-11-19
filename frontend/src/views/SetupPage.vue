<script setup lang="ts">
import { ref } from 'vue'

const date = new Date()

const dateTime = date
  .toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  .toUpperCase()

const features = [
  {
    title: 'Multi-stack services',
    badge: 'Runtime',
    description:
      'Run and switch between PHP, Node.js, Nginx, and databases without messy global configs.',
  },
  {
    title: 'Zero-config setup',
    badge: 'Workflow',
    description:
      'Spin up isolated local environments and custom virtual domains in just a few clicks.',
  },
  {
    title: 'Live telemetry',
    badge: 'Monitoring',
    description:
      'Keep track of active ports, CPU load, and memory footprint directly from your dashboard.',
  },
  {
    title: 'Native & lightweight',
    badge: 'Performance',
    description:
      'Built for speed with minimal background overhead—modern tooling without the bloat.',
  },
]

type SetupOption = 'blank' | 'setup' | null

const hoveredOption = ref<SetupOption>(null)

const optionDescriptions: Record<Exclude<SetupOption, null>, { title: string; text: string }> = {
  blank: {
    title: 'Blank workspace',
    text: 'Start with a clean slate and add or configure your local services manually whenever you need them.',
  },
  setup: {
    title: 'Guided service setup',
    text: 'Install essential services in one click and choose your own custom installation directory.',
  },
}
</script>

<template>
  <div class="min-h-screen bg-surface p-6 sm:p-8 lg:py-10 text-primary">
    <div class="mx-auto">
      <!-- Header / Welcome Section -->
      <div>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
          <span class="h-0.5 w-4 bg-accent"></span> {{ dateTime }}
        </p>
        <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
          Welcome to Symen.
        </h1>
        <p class="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          A modern, lightweight local development environment. Manage your runtimes, databases, and
          services in one clean workspace.
        </p>
      </div>

      <!-- 4 Feature Cards -->
      <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(item, index) in features"
          :key="index"
          class="flex flex-col justify-between rounded-2xl border border-subtle bg-elevated p-5 transition-colors duration-150 hover:border-primary/25"
        >
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-medium tracking-wide text-muted">
                {{ item.badge }}
              </span>
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-subtle bg-soft text-primary"
              >
                <!-- Icon 1: Layers / Multi-stack -->
                <svg
                  v-if="index === 0"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <!-- Icon 2: Sliders / Zero-config -->
                <svg
                  v-else-if="index === 1"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <!-- Icon 3: Activity / Telemetry -->
                <svg
                  v-else-if="index === 2"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <!-- Icon 4: Zap / Lightweight -->
                <svg
                  v-else
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
            </div>

            <h2 class="mt-4 text-lg font-semibold tracking-tight text-primary">
              {{ item.title }}
            </h2>
          </div>

          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ item.description }}
          </p>
        </div>
      </div>

      <!-- Action Buttons + Animated Hover Description -->
      <div class="mt-8 flex flex-col items-start">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Button 1: Blank Services -->
          <routerLink
            to="/"
            type="button"
            @mouseenter="hoveredOption = 'blank'"
            @mouseleave="hoveredOption = null"
            @focus="hoveredOption = 'blank'"
            @blur="hoveredOption = null"
            class="inline-flex min-h-11 w-max items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg transition-all duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none cursor-pointer"
          >
            Continue with blank services
          </routerLink>

          <!-- Button 2: Setup Services (Primary CTA) -->
          <routerLink
            to="/download"
            type="button"
            @mouseenter="hoveredOption = 'setup'"
            @mouseleave="hoveredOption = null"
            @focus="hoveredOption = 'setup'"
            @blur="hoveredOption = null"
            class="inline-flex min-h-11 w-max items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg transition-all duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none cursor-pointer"
          >
            Continue setup services
          </routerLink>
        </div>

        <!-- Fixed-height container biar layout gak loncat saat hover -->
        <div class="mt-3 min-h-[4.25rem] w-full max-w-xl">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1.5"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="hoveredOption"
              :key="hoveredOption"
              class="flex items-start gap-2.5 rounded-xl border border-subtle bg-elevated/80 px-4 py-3 text-sm"
            >
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
              <p class="leading-relaxed text-muted">
                <span class="font-medium text-primary">
                  {{ optionDescriptions[hoveredOption].title }}:
                </span>
                {{ optionDescriptions[hoveredOption].text }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
