import { ref } from 'vue'
type level = 'info' | 'warning' | 'danger'

interface ToastData {
  stage: level
  data: any
  show: boolean
  title?: string
}
const toastData = ref<ToastData[]>([])

function useToast() {
  const showToast = (level: level, head: string, message: any) => {
    toastData.value.push({ stage: level, data: message, show: true, title: head })
  }

  return { toastData, showToast }
}

export default useToast
