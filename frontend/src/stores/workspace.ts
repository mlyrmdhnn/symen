import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Service = {
  id: number
  name: string
  executable: string
  directoryPath: string
}

export type ThemeMode = 'system' | 'light' | 'dark'

const initialServices: Service[] = [
  {
    id: 1,
    name: 'Nginx Web Server',
    executable: 'nginx.exe',
    directoryPath: 'C:\\tools\\nginx',
  },
  {
    id: 2,
    name: 'PostgreSQL Database',
    executable: 'postgres.exe',
    directoryPath: 'C:\\Program Files\\PostgreSQL\\16\\bin',
  },
  {
    id: 3,
    name: 'Redis Server',
    executable: 'redis-server.exe',
    directoryPath: 'C:\\tools\\redis',
  },
  {
    id: 4,
    name: 'Node API',
    executable: 'node.exe',
    directoryPath: 'C:\\Program Files\\nodejs',
  },
  {
    id: 5,
    name: 'MinIO Storage',
    executable: 'minio.exe',
    directoryPath: 'C:\\tools\\minio',
  },
  {
    id: 6,
    name: 'Prometheus',
    executable: 'prometheus.exe',
    directoryPath: 'C:\\tools\\prometheus',
  },
]

export const useWorkspaceStore = defineStore('workspace', () => {
  const services = ref<Service[]>(initialServices.map((service) => ({ ...service })))
  const theme = ref<ThemeMode>((localStorage.getItem('dockyard-theme') as ThemeMode) || 'system')

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

  function saveService(service: Omit<Service, 'id'>, id?: number) {
    if (id !== undefined) {
      const current = services.value.find((item) => item.id === id)
      if (current) Object.assign(current, service)
      return
    }

    services.value.unshift({
      ...service,
      id: Date.now(),
    })
  }

  function deleteService(id: number) {
    services.value = services.value.filter((service) => service.id !== id)
  }

  return { services, theme, applyTheme, saveService, deleteService }
})
