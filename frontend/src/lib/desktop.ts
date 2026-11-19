import { invoke } from '@tauri-apps/api/core'

export type ServiceStatus = 'running' | 'stopped'
export type Service = {
  id: string
  name: string
  executable: string
  directoryPath: string
  args: string[]
  status: ServiceStatus
  pid: number | null
}

export type ServiceInput = Omit<Service, 'id' | 'status' | 'pid'> & { id?: string }
export type SystemMetrics = {
  cpuUsage: number
  ramUsage: number
  ramUsedBytes: number
  ramTotalBytes: number
}
export type ServiceStatusEvent = {
  serviceId: string
  status: ServiceStatus
  pid: number | null
}
export type ServiceLogEvent = {
  serviceId: string
  stream: 'stdout' | 'stderr'
  line: string
}

export const desktop = {
  getMetrics: () => invoke<SystemMetrics>('get_metrics'),
  listServices: () => invoke<Service[]>('list_services'),
  saveService: (service: ServiceInput) => invoke<Service[]>('save_service', { service }),
  deleteService: (id: string) => invoke<Service[]>('delete_service', { id }),
  startService: (id: string) => invoke<ServiceStatusEvent>('start_local_service', { id }),
  stopService: (id: string) => invoke<ServiceStatusEvent>('stop_local_service', { id }),
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
