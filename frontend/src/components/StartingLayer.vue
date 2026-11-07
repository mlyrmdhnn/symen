<script setup lang="ts">
import { ref, onMounted } from 'vue'

const phase = ref<'wave' | 'vertical' | 's' | 'reveal'>('wave')

onMounted(() => {
  setTimeout(() => {
    phase.value = 'vertical'
  }, 1600)

  setTimeout(() => {
    phase.value = 's'
  }, 2200)

  setTimeout(() => {
    phase.value = 'reveal'
  }, 2900)
})
</script>

<template>
  <div
    class="w-screen h-screen bg-neutral-200 dark:bg-gray-800 flex justify-center items-center font-sans absolute"
  >
    <div class="flex items-center text-white text-6xl font-bold tracking-tight">
      <div class="relative flex items-center justify-center w-[44px] h-[64px]">
        <div
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          :class="phase === 'reveal' ? 'opacity-0' : 'opacity-100'"
        >
          <!-- Titik 1: Kiri -> Atas -->
          <div
            class="absolute transition-transform duration-500 ease-in-out"
            :class="phase === 'wave' ? '-translate-x-[22px]' : '-translate-y-[22px]'"
          >
            <div
              class="w-3 h-3 bg-gray-800 dark:bg-white rounded-full wave-dot"
              style="animation-delay: 0s"
            ></div>
          </div>

          <div class="absolute transition-transform duration-500 ease-in-out">
            <div
              class="w-3 h-3 bg-gray-800 dark:bg-white rounded-full wave-dot"
              style="animation-delay: 0.15s"
            ></div>
          </div>

          <div
            class="absolute transition-transform duration-500 ease-in-out"
            :class="phase === 'wave' ? 'translate-x-[22px]' : 'translate-y-[22px]'"
          >
            <div
              class="w-3 h-3 bg-gray-800 dark:bg-white rounded-full wave-dot"
              style="animation-delay: 0.3s"
            ></div>
          </div>
        </div>

        <svg
          v-if="phase === 's' || phase === 'reveal'"
          class="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox="0 0 44 64"
        >
          <path
            d="M 22,10 C 0,10 0,32 22,32 C 44,32 44,54 22,54"
            fill="none"
            stroke="currentColor"
            stroke-width="12"
            stroke-linecap="round"
            class="path-draw bg-gray-800 dark:bg-white"
          />
        </svg>
      </div>

      <div
        class="overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center"
        :class="phase === 'reveal' ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'"
      >
        <span class="text-gray-800 dark:text-white block whitespace-nowrap leading-none">ymen</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wave-dot {
  animation: wave 0.6s ease-in-out 2;
}

@keyframes wave {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-14px);
  }
}

.path-draw {
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: drawS 0.7s forwards ease-in-out;
}

@keyframes drawS {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
