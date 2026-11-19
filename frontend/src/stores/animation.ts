import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAnimation = defineStore('animation', () => {
  const isOpen = ref<Boolean>(false)
  return { isOpen }
})
