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
  const themeError = ref('')
  const chartSaving = ref(false)
  const chartError = ref('')
  const chartSettingLoaded = ref(false)
  const startupArgumentsText = ref('')
  const startupArgumentsPath = ref('')
  const startupArgumentsLoading = ref(true)
  const startupArgumentsSaving = ref(false)
  const startupArgumentsError = ref('')
  const resolvedTheme = ref<'light' | 'dark'>('dark')
  let systemTheme: MediaQueryList | undefined
  let chartSettingRequest: Promise<void> | undefined

  const applyTheme = () => {
    const isDark =
      theme.value === 'dark' || (theme.value === 'system' && systemTheme?.matches !== false)
    resolvedTheme.value = isDark ? 'dark' : 'light'
    document.documentElement.classList.toggle('theme-light', !isDark)
    window.electronAPI?.updateThemeOverlay(resolvedTheme.value)
  }

  const initializeTheme = async () => {
    themeError.value = ''
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
      themeError.value = error instanceof Error ? error.message : String(error)
      console.error('Failed to load theme setting:', error)
      applyTheme()
    } finally {
      themeLoading.value = false
    }
  }

  const setTheme = async (value: 'system' | 'light' | 'dark') => {
    themeSaving.value = true
    themeError.value = ''
    try {
      const response = await http.put('/settings/theme', { payload: { theme: value } })
      if (!response || response.status !== 'ok' || response.data !== value) {
        throw new Error(response?.message ?? 'Python did not confirm the theme setting')
      }

      theme.value = value
      applyTheme()
    } catch (error) {
      themeError.value = error instanceof Error ? error.message : String(error)
      console.error('Failed to save theme setting:', error)
    } finally {
      themeSaving.value = false
    }
  }

  const getChartToggle = async () => {
    if (chartSettingRequest) return chartSettingRequest
    if (!chartSettingLoaded.value) earlyInitializeSettings.value = true
    chartError.value = ''

    chartSettingRequest = (async () => {
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
        chartSettingLoaded.value = true
      } catch (error) {
        chartError.value = error instanceof Error ? error.message : String(error)
        console.error('Failed to load realtime chart setting:', error)
        chartSettingLoaded.value = true
      } finally {
        earlyInitializeSettings.value = false
        chartSettingRequest = undefined
      }
    })()
    return chartSettingRequest
  }

  const setChartToggle = async (enabled: boolean) => {
    const expectedValue = enabled ? 'true' : 'false'
    chartSaving.value = true
    chartError.value = ''
    try {
      const response = await http.put(`/settings/realtime-chart/${enabled ? 'on' : 'off'}`)
      if (!response || response.realtime_chart !== expectedValue) {
        throw new Error('Python did not confirm the realtime chart setting')
      }

      data.value = response
      realtimeChartToggle.value = enabled
      chartSettingLoaded.value = true
    } catch (error) {
      chartError.value = error instanceof Error ? error.message : String(error)
      console.error('Failed to save realtime chart setting:', error)
    } finally {
      chartSaving.value = false
    }
  }

  const loadStartupArguments = async () => {
    startupArgumentsLoading.value = true
    startupArgumentsError.value = ''
    try {
      const response = await http.get('/settings/startup-arguments')
      if (
        !response ||
        response.status !== 'ok' ||
        !response.data ||
        typeof response.data !== 'object' ||
        Array.isArray(response.data) ||
        typeof response.path !== 'string'
      ) {
        throw new Error(response?.message ?? 'Python returned an invalid startup arguments config')
      }

      startupArgumentsText.value = JSON.stringify(response.data, null, 2)
      startupArgumentsPath.value = response.path
    } catch (error) {
      startupArgumentsError.value = error instanceof Error ? error.message : String(error)
      console.error('Failed to load startup arguments config:', error)
    } finally {
      startupArgumentsLoading.value = false
    }
  }

  const saveStartupArguments = async () => {
    let config: unknown
    try {
      config = JSON.parse(startupArgumentsText.value)
    } catch (error) {
      startupArgumentsError.value =
        error instanceof Error ? `Invalid JSON: ${error.message}` : String(error)
      return
    }

    if (!window.confirm('Save these service startup arguments to symen.conf?')) return

    startupArgumentsSaving.value = true
    startupArgumentsError.value = ''
    try {
      const response = await http.put('/settings/startup-arguments', {
        payload: { config },
      })
      if (!response || response.status !== 'ok') {
        throw new Error(response?.message ?? 'Python did not confirm the startup arguments config')
      }

      startupArgumentsText.value = JSON.stringify(response.data, null, 2)
      startupArgumentsPath.value = response.path
    } catch (error) {
      startupArgumentsError.value = error instanceof Error ? error.message : String(error)
      console.error('Failed to save startup arguments config:', error)
    } finally {
      startupArgumentsSaving.value = false
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
    themeError,
    chartSaving,
    chartError,
    chartSettingLoaded,
    resolvedTheme,
    initializeTheme,
    setTheme,
    startupArgumentsText,
    startupArgumentsPath,
    startupArgumentsLoading,
    startupArgumentsSaving,
    startupArgumentsError,
    loadStartupArguments,
    saveStartupArguments,
    data,
  }
})
