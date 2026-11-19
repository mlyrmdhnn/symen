import useInvoke from '@/lib/http'

interface DiskInfo {
  name: string
  mount_point: string
  file_system: string
  total_gb: number
  available_gb: number
  used_gb: number
}

interface DeviceSpecs {
  device_name: string
  os_name: string
  os_version: string
  processor: string
  cpu_cores: number
  total_ram_gb: number
  disks: DiskInfo[]
}

function useSettings() {
  const { data: deviceData, execute: getDeviceSpecs } = useInvoke<DeviceSpecs>('get_device_specs', {
    immediate: false,
  })
  return { deviceData, getDeviceSpecs }
}

export default useSettings
