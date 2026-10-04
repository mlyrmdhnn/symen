import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useEarlyStartStore } from './earlyStart'
const { earlyInitialize } = useEarlyStartStore()

let globalInitialize: boolean = true
export const useInitialize = defineStore('initialize', () => {
  return {}
})
