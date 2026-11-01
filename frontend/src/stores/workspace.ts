import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type Service = {
  id: number
  name: string
  image: string
  tag: string
  status: 'Running' | 'Stopped'
  ports: string
  created: string
  accent: string
}

export type ThemeMode = 'system' | 'light' | 'dark'

const initialServices: Service[] = [
  {
    id: 1,
    name: 'api-gateway',
    image: 'nginx',
    tag: '1.27-alpine',
    status: 'Running',
    ports: '8080:80',
    created: '2 hours ago',
    accent: 'blue',
  },
  {
    id: 2,
    name: 'postgres-db',
    image: 'postgres',
    tag: '16.2',
    status: 'Running',
    ports: '5432:5432',
    created: '5 hours ago',
    accent: 'indigo',
  },
  {
    id: 3,
    name: 'redis-cache',
    image: 'redis',
    tag: '7.2-alpine',
    status: 'Running',
    ports: '6379:6379',
    created: 'Yesterday',
    accent: 'red',
  },
  {
    id: 4,
    name: 'worker-queue',
    image: 'node',
    tag: '20-alpine',
    status: 'Running',
    ports: '—',
    created: 'Yesterday',
    accent: 'green',
  },
  {
    id: 5,
    name: 'minio-storage',
    image: 'minio/minio',
    tag: 'RELEASE.2024',
    status: 'Stopped',
    ports: '9000:9000',
    created: '2 days ago',
    accent: 'pink',
  },
  {
    id: 6,
    name: 'prometheus',
    image: 'prom/prometheus',
    tag: 'v2.51.0',
    status: 'Stopped',
    ports: '9090:9090',
    created: '3 days ago',
    accent: 'orange',
  },
]

export const useWorkspaceStore = defineStore('workspace', () => {
  const services = ref<Service[]>(initialServices.map((service) => ({ ...service })))
  const theme = ref<ThemeMode>((localStorage.getItem('dockyard-theme') as ThemeMode) || 'system')
  const runningCount = computed(
    () => services.value.filter((service) => service.status === 'Running').length,
  )

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

  function saveService(service: Omit<Service, 'id' | 'created' | 'accent'>, id?: number) {
    if (id !== undefined) {
      const current = services.value.find((item) => item.id === id)
      if (current) Object.assign(current, service)
      return
    }

    services.value.unshift({
      ...service,
      id: Date.now(),
      created: 'Just now',
      accent: 'blue',
    })
  }

  function deleteService(id: number) {
    services.value = services.value.filter((service) => service.id !== id)
  }

  return { services, theme, runningCount, applyTheme, saveService, deleteService }
})
