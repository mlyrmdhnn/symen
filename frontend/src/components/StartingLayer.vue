<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import useInvoke from '@/lib/http'
import useToast from '@/composables/useToast'
import router from '@/router'

const { showToast } = useToast()

const phase = ref<'wave' | 'vertical' | 's' | 'reveal'>('wave')
const showForm = ref(false)
const animationComplete = ref(false)

const props = defineProps<{ isNameExists: boolean }>()

const emit = defineEmits<{ success: [name: string] }>()

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

  setTimeout(() => {
    animationComplete.value = true
    if (!props.isNameExists) {
      showForm.value = true
    }
  }, 3700)
})

watch(
  () => props.isNameExists,
  (isNameExists) => {
    if (animationComplete.value) {
      showForm.value = !isNameExists
    }
  },
)

const name = ref('')
const isLoading = ref(false)

const setName = async () => {
  const trimmedName = name.value.trim()
  if (!trimmedName) {
    showToast('info', 'Enter valid name', 'Please enter valid name')
    return
  }
  if (trimmedName.length < 3) {
    showToast('info', 'Minimal name 3 char', 'Please enter name at least 3 characters')
    return
  }
  isLoading.value = true
  const { error, execute } = useInvoke('edit_name', {
    immediate: false,
    payload: {
      name: trimmedName,
    },
  })
  await execute()

  if (error.value) {
    showToast('danger', 'Something went wrong', 'y', error.value)
    isLoading.value = false
    return
  }

  emit('success', trimmedName)
  isLoading.value = false
}
</script>

<template>
  <div class="absolute flex h-screen w-screen items-center justify-center bg-surface font-sans">
    <div v-if="!showForm" class="flex items-center text-white text-6xl font-bold tracking-tight">
      <div class="relative flex items-center justify-center w-[44px] h-[64px]">
        <div
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          :class="phase === 'reveal' ? 'opacity-0' : 'opacity-100'"
        >
          <div
            class="absolute transition-transform duration-500 ease-in-out"
            :class="phase === 'wave' ? '-translate-x-[22px]' : '-translate-y-[22px]'"
          >
            <div class="wave-dot size-3 rounded-full bg-accent" style="animation-delay: 0s"></div>
          </div>

          <div class="absolute transition-transform duration-500 ease-in-out">
            <div
              class="wave-dot size-3 rounded-full bg-accent"
              style="animation-delay: 0.15s"
            ></div>
          </div>

          <div
            class="absolute transition-transform duration-500 ease-in-out"
            :class="phase === 'wave' ? 'translate-x-[22px]' : 'translate-y-[22px]'"
          >
            <div class="wave-dot size-3 rounded-full bg-accent" style="animation-delay: 0.3s"></div>
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
            class="path-draw stroke-accent"
          />
        </svg>
      </div>

      <div
        class="flex items-center overflow-hidden transition-[max-width,opacity] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="phase === 'reveal' ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'"
      >
        <span class="block whitespace-nowrap leading-none text-primary">ymen</span>
      </div>
    </div>
    <div
      v-else
      class="w-full max-w-lg rounded-2xl border border-subtle bg-elevated p-8 text-primary sm:p-10"
    >
      <p class="mb-3 text-xs font-bold tracking-[0.16em] text-muted">WELCOME</p>
      <h1 class="text-4xl font-semibold leading-tight tracking-tight">Welcome to Symen</h1>
      <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
        Personalize your local development workspace.
      </p>
      <div>
        <form @submit.prevent="setName" class="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            class="h-12 min-w-0 flex-1 rounded-lg border border-subtle bg-surface px-4 text-base text-primary placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            placeholder="Enter your name..."
            name=""
            maxlength="15"
            id=""
            v-model="name"
            :disabled="isLoading"
          />
          <button
            class="h-12 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
          >
            {{ isLoading ? 'Submiting...' : 'Submit' }}
          </button>
        </form>
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
