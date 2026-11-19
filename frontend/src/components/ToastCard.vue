<script setup lang="ts">
import { watch } from 'vue'
import useToast from '@/composables/useToast'

const { toastData } = useToast()

// Menyimpan referensi timer agar tidak menumpuk & bisa dibersihkan jika ditutup manual
const timers = new WeakMap<object, ReturnType<typeof setTimeout>>()

watch(
  toastData,
  (list) => {
    if (!Array.isArray(list)) return

    list.forEach((item) => {
      if (item.show && !timers.has(item)) {
        const timer = setTimeout(() => {
          item.show = false
          timers.delete(item)
        }, 3000)
        timers.set(item, timer)
      } else if (!item.show && timers.has(item)) {
        clearTimeout(timers.get(item))
        timers.delete(item)
      }
    })
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <TransitionGroup
    tag="div"
    name="toast"
    class="fixed top-20 right-10 z-[99999999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
  >
    <template v-for="(d, i) in toastData" :key="i">
      <div v-if="d.show" class="w-full pointer-events-auto">
        <!-- DANGER -->
        <div
          v-if="d.stage == 'danger'"
          role="alert"
          class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-rose-200/80 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-elevated"
        >
          <div class="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>

          <div
            class="shrink-0 rounded-xl bg-rose-500/10 p-2 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div class="flex-1 pt-0.5">
            <h4 class="text-sm font-semibold text-rose-950 dark:text-primary">
              {{ d.title ? d.title : 'Attention' }}
            </h4>
            <p class="mt-1 text-sm leading-relaxed text-rose-800/80 dark:text-muted">
              {{ d.data }}
            </p>
          </div>

          <button
            @click="d.show = false"
            type="button"
            aria-label="Tutup"
            class="shrink-0 rounded-lg p-2 text-rose-400 transition-colors duration-150 hover:bg-rose-500/10 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none dark:text-muted dark:hover:text-primary dark:hover:bg-soft"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Progress Bar -->
          <div class="absolute inset-x-0 bottom-0 h-1 bg-rose-500/15 dark:bg-rose-500/10">
            <div class="h-full origin-left bg-rose-500 dark:bg-rose-400 animate-toast-progress"></div>
          </div>
        </div>

        <!-- WARNING -->
        <div
          v-if="d.stage == 'warning'"
          role="alert"
          class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-elevated"
        >
          <div class="absolute inset-y-0 left-0 w-1 bg-amber-500"></div>

          <div
            class="shrink-0 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div class="flex-1 pt-0.5">
            <h4 class="text-sm font-semibold text-amber-950 dark:text-primary">
              {{ d.title ? d.title : 'Attention' }}
            </h4>
            <p class="mt-1 text-sm leading-relaxed text-amber-800/80 dark:text-muted">
              {{ d.data }}
            </p>
          </div>

          <button
            @click="d.show = false"
            type="button"
            aria-label="Tutup"
            class="shrink-0 rounded-lg p-2 text-amber-500/70 transition-colors duration-150 hover:bg-amber-500/10 hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none dark:text-muted dark:hover:text-primary dark:hover:bg-soft"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Progress Bar -->
          <div class="absolute inset-x-0 bottom-0 h-1 bg-amber-500/15 dark:bg-amber-500/10">
            <div class="h-full origin-left bg-amber-500 dark:bg-amber-400 animate-toast-progress"></div>
          </div>
        </div>

        <!-- INFO -->
        <div
          v-if="d.stage == 'info'"
          role="alert"
          class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-sky-200/80 bg-sky-50 p-5 dark:border-sky-500/20 dark:bg-elevated"
        >
          <div class="absolute inset-y-0 left-0 w-1 bg-sky-500"></div>

          <div
            class="shrink-0 rounded-xl bg-sky-500/10 p-2 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div class="flex-1 pt-0.5">
            <h4 class="text-sm font-semibold text-sky-950 dark:text-primary">
              {{ d.title ? d.title : 'Attention' }}
            </h4>
            <p class="mt-1 text-sm leading-relaxed text-sky-800/80 dark:text-muted">
              {{ d.data }}
            </p>
          </div>

          <button
            @click="d.show = false"
            type="button"
            aria-label="Tutup"
            class="shrink-0 rounded-lg p-2 text-sky-400 transition-colors duration-150 hover:bg-sky-500/10 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none dark:text-muted dark:hover:text-primary dark:hover:bg-soft"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Progress Bar -->
          <div class="absolute inset-x-0 bottom-0 h-1 bg-sky-500/15 dark:bg-sky-500/10">
            <div class="h-full origin-left bg-sky-500 dark:bg-sky-400 animate-toast-progress"></div>
          </div>
        </div>
      </div>
    </template>
  </TransitionGroup>
</template>

<style scoped>
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(2.5rem) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(2.5rem) scale(0.96);
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.animate-toast-progress {
  animation: toast-progress 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
