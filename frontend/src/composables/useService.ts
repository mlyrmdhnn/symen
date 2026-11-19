import { reactive } from 'vue'
import useInvoke from '@/lib/http'
import { ref } from 'vue'
import useToast from './useToast'
const { showToast } = useToast()

interface ServiceItem {
  id: string
  name: string
  executable: string
  path: string
  port: number
  pid: number
  is_run: boolean
  optional_command: string
}

//#region Read Services All

const {
  data: servicesData,
  error: servicesError,
  pending: servicesPending,
  execute: servicesExecute,
} = useInvoke<ServiceItem[]>('service_all', { immediate: false, initialData: [] })

const updatedPayload = ref({
  id: '',
  name: '',
  executable: 'string',
  path: '',
  port: 0,
  pid: 0,
  is_run: false,
  optional_command: '',
})

function useService() {
  //#region Add service
  const payload = reactive({
    name: '',
    executable: '',
    path: '',
    command: '',
  })

  //#endregion

  const cancel = () => {
    const p = payload
    p.command = ''
    p.executable = ''
    p.name = ''
    p.path = ''
  }

  const addService = async () => {
    const { execute, error } = useInvoke('add_service', {
      payload: {
        path: payload.path,
        name: payload.name,
        command: payload.command,
        executable: payload.executable,
      },
      immediate: false,
    })

    await execute()

    if (error.value) {
      showToast('danger', 'Already Exists', error.value)
    }
    if (!error.value) {
      await servicesExecute()
      showToast('info', 'Added Service', 'Add new service successfully')
      cancel()
    }
  }

  //#region Edit Service

  const getUpdatedData = (data: ServiceItem) => {
    const d = data
    const up = updatedPayload.value

    up.id = d.id
    up.name = d.name
    up.executable = d.executable
    up.path = d.path
    up.port = d.port
    up.pid = d.pid
    up.is_run = d.is_run
    up.optional_command = d.optional_command
  }

  const updateData = async () => {
    const { execute, error } = useInvoke('edit_service', {
      payload: {
        updatedService: updatedPayload.value,
      },
      immediate: false,
    })

    await execute()
    if (!error.value) {
      await servicesExecute()
      showToast('info', 'Editted Service', 'Edited service successfully')
      cancel()
    }
  }

  //#endregion

  //#region Delete Service
  const deleteModalOpen = ref(false)

  const selectedDeleteId = ref<string>('')

  const closeDeleteModal = () => {
    deleteModalOpen.value = false
  }

  const deleteService = async () => {
    const { error, execute, data } = useInvoke('delete_service', {
      immediate: false,
      payload: { id: selectedDeleteId.value },
    })

    await execute()

    if (!error.value) {
      await servicesExecute()
      showToast('info', 'Deleted Service', 'Delete service successfully')
      closeDeleteModal()
      return
    }
    if (error.value) {
      showToast('danger', 'Service is unvailable', 'Cannot delete service')
      closeDeleteModal()
      return
    }
  }
  //#endregion

  const loadingServiceId = ref<string | null>(null)

  //#region Start Service
  const startService = async (id: string) => {
    loadingServiceId.value = id
    try {
      const { execute, error } = useInvoke('start_service', { immediate: false, payload: { id } })
      await execute()

      if (error.value) {
        const message = error.value instanceof Error ? error.value.message : String(error.value)
        showToast('danger', 'Cannot start service', message)
        console.log(error.value)
        return
      }

      await servicesExecute()
    } finally {
      loadingServiceId.value = null
    }
  }
  //#endregion

  //#region Stop Service
  const stopService = async (id: string, pid: number) => {
    loadingServiceId.value = id
    try {
      const { error, execute } = useInvoke('stop_service', { immediate: false, payload: { pid } })
      await execute()

      if (error.value) {
        showToast('danger', 'Cannot stop service', 'Failed to stop service')
        console.log(error.value)
        return
      }

      await servicesExecute()
    } finally {
      loadingServiceId.value = null
    }
  }

  return {
    payload,
    addService,
    cancel,
    servicesData,
    servicesError,
    servicesPending,
    servicesExecute,
    getUpdatedData,
    updatedPayload,
    updateData,
    selectedDeleteId,
    deleteService,
    startService,
    stopService,
    loadingServiceId,
    deleteModalOpen,
    closeDeleteModal,
  }
}

export default useService
