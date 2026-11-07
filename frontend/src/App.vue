<script setup lang="ts">
import StartingLayer from './components/StartingLayer.vue'
import { ref } from 'vue'

const showStarting = ref(true)

setTimeout(() => {
  showStarting.value = false
}, 4000)
</script>

<template>
  <RouterView />

  <Transition name="fade">
    <StartingLayer v-if="showStarting" class="absolute top-0" />
  </Transition>
</template>

<style scoped>
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>
