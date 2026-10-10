import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/views/lib/http'

export const useSettings = defineStore('settings', () => {
  const realtimeChartToggle = ref(false)
  const earlyInitializeSettings = ref(true)
  const data = ref<unknown>()
  const theme = ref<'system' | 'light' | 'dark'>('system')
  const themeLoading = ref(true)
  const themeSaving = ref(false)
  const resolvedTheme = ref<'light' | 'dark'>('dark')
  let systemTheme: MediaQueryList | undefined

  const applyTheme = () => {
    const isDark =
      theme.value === 'dark' || (theme.value === 'system' && systemTheme?.matches !== false)
    resolvedTheme.value = isDark ? 'dark' : 'light'
    document.documentElement.classList.toggle('theme-light', !isDark)
  }

  const initializeTheme = async () => {
    if (!systemTheme) {
      systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.addEventListener('change', applyTheme)
    }

    try {
      const response = await http.get('/settings/theme')
      if (
        !response ||
        response.status !== 'ok' ||
        !['system', 'light', 'dark'].includes(response.data)
      ) {
        throw new Error(response?.message ?? 'Python returned an invalid theme setting')
      }

      theme.value = response.data
      applyTheme()
    } catch (error) {
      console.error('Failed to load theme setting:', error)
      applyTheme()
    } finally {
      themeLoading.value = false
    }
  }

  const setTheme = async (value: 'system' | 'light' | 'dark') => {
    themeSaving.value = true
    try {
      const response = await http.put('/settings/theme', { payload: { theme: value } })
      if (!response || response.status !== 'ok' || response.data !== value) {
        throw new Error(response?.message ?? 'Python did not confirm the theme setting')
      }

      theme.value = value
      applyTheme()
    } catch (error) {
      console.error('Failed to save theme setting:', error)
    } finally {
      themeSaving.value = false
    }
  }

  const getChartToggle = async () => {
    earlyInitializeSettings.value = true
    try {
      const response = await http.get('/settings/realtime-chart')
      if (!response || response.status !== 'ok') {
        throw new Error(response?.message ?? 'Could not load realtime chart setting')
      }

      const value = response.data
      if (value !== true && value !== false && value !== 'true' && value !== 'false') {
        throw new Error('Python returned an invalid realtime chart setting')
      }

      data.value = response
      realtimeChartToggle.value = value === true || value === 'true'
    } catch (error) {
      console.error('Failed to load realtime chart setting:', error)
    } finally {
      earlyInitializeSettings.value = false
    }
  }

  const setChartToggle = async (enabled: boolean) => {
    const expectedValue = enabled ? 'true' : 'false'
    try {
      const response = await http.put(
        `/settings/realtime-chart/${enabled ? 'on' : 'off'}`,
      )
      if (!response || response.realtime_chart !== expectedValue) {
        throw new Error('Python did not confirm the realtime chart setting')
      }

      data.value = response
      realtimeChartToggle.value = enabled
    } catch (error) {
      console.error('Failed to save realtime chart setting:', error)
    }
  }

  return {
    realtimeChartToggle,
    earlyInitializeSettings,
    getChartToggle,
    setChartToggle,
    theme,
    themeLoading,
    themeSaving,
    resolvedTheme,
    initializeTheme,
    setTheme,
    data,
  }
})
