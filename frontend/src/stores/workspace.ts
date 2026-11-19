import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Service = {
  id: number
  name: string
  executable: string
  directoryPath: string
  isRun: boolean
}

export type ThemeMode = 'system' | 'light' | 'dark'

export const useWorkspaceStore = defineStore('workspace', () => {
  const theme = ref<ThemeMode>((localStorage.getItem('dockyard-theme') as ThemeMode) || 'system')
  const userName = ref('')

  function setUserName(name: string) {
    userName.value = name
  }

  function applyTheme() {
    const preference =
      theme.value === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme.value
    document.documentElement.classList.toggle('dark', preference === 'dark')
    localStorage.setItem('dockyard-theme', theme.value)
  }

  return { theme, userName, setUserName, applyTheme }
})
