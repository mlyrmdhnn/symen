import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSideToggle = defineStore('useSideToggle', () => {
  const isOpenSide = ref(true)
  const toggleSide = () => {
    isOpenSide.value = !isOpenSide.value
  }

  return { isOpenSide, toggleSide }
})
