<script setup lang="ts">
interface Props {
  size?: number | string
  monochrome?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 28,
  monochrome: false,
})
</script>

<template>
  <div
    class="gemini-loader"
    role="status"
    aria-label="Loading"
    :style="{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
    }"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="100%" height="100%">
      <defs>
        <linearGradient id="gemini-sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4285f4" />
          <stop offset="50%" stop-color="#9b72cb" />
          <stop offset="100%" stop-color="#d96570" />
        </linearGradient>
      </defs>

      <!-- FASE 1: 3 Titik -->
      <g class="dots-layer">
        <circle
          class="dot dot-1"
          cx="7.4"
          cy="14"
          r="2.1"
          :fill="monochrome ? 'currentColor' : '#4285f4'"
        />
        <circle
          class="dot dot-2"
          cx="14"
          cy="14"
          r="2.1"
          :fill="monochrome ? 'currentColor' : '#9b72cb'"
        />
        <circle
          class="dot dot-3"
          cx="20.6"
          cy="14"
          r="2.1"
          :fill="monochrome ? 'currentColor' : '#d96570'"
        />
      </g>

      <!-- FASE 2: Sparkle Gemini Muter -->
      <g class="sparkle-layer">
        <path
          :fill="monochrome ? 'currentColor' : 'url(#gemini-sparkle-grad)'"
          d="M14 2.5 C14 9.2 18.8 14 25.5 14 C18.8 14 14 18.8 14 25.5 C14 18.8 9.2 14 2.5 14 C9.2 14 14 9.2 14 2.5 Z"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.gemini-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

/* Total siklus: 2.6 detik */
.dots-layer {
  transform-origin: 14px 14px;
  animation: dots-visibility 2.6s infinite ease-in-out;
}

.dot-1 {
  animation: dot-1-anim 2.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.dot-2 {
  animation: dot-2-anim 2.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.dot-3 {
  animation: dot-3-anim 2.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.sparkle-layer {
  transform-origin: 14px 14px;
  animation: sparkle-anim 2.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

/* Titik 1: Mantul -> geser ke tengah (x=14) -> balik */
@keyframes dot-1-anim {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  10% {
    transform: translate(0, -4.5px) scale(1.15);
  }
  22% {
    transform: translate(0, 0) scale(1);
  }
  35%,
  78% {
    transform: translate(6.6px, 0) scale(0.2);
  }
  90% {
    transform: translate(0, 0) scale(1);
  }
}

/* Titik 2: Mantul bergantian -> diam di tengah -> balik */
@keyframes dot-2-anim {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  16% {
    transform: translate(0, -4.5px) scale(1.15);
  }
  28% {
    transform: translate(0, 0) scale(1);
  }
  35%,
  78% {
    transform: translate(0, 0) scale(0.2);
  }
  90% {
    transform: translate(0, 0) scale(1);
  }
}

/* Titik 3: Mantul terakhir -> geser ke tengah (x=14) -> balik */
@keyframes dot-3-anim {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  22% {
    transform: translate(0, -4.5px) scale(1.15);
  }
  32% {
    transform: translate(0, 0) scale(1);
  }
  35%,
  78% {
    transform: translate(-6.6px, 0) scale(0.2);
  }
  90% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes dots-visibility {
  0%,
  33% {
    opacity: 1;
  }
  38%,
  76% {
    opacity: 0;
  }
  84%,
  100% {
    opacity: 1;
  }
}

/* Bintang muncul tepat saat 3 titik menyatu, muter 270 derajat, lalu mengecil lagi */
@keyframes sparkle-anim {
  0%,
  33% {
    opacity: 0;
    transform: scale(0.15) rotate(-90deg);
  }
  44% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  66% {
    opacity: 1;
    transform: scale(1.06) rotate(180deg);
  }
  78% {
    opacity: 0;
    transform: scale(0.15) rotate(270deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.15) rotate(270deg);
  }
}
</style>
