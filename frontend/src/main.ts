import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import { useEarlyStartStore } from './stores/earlyStart.ts'
// const { getDeviceInformation } = useEarlyStartStore()

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// getDeviceInformation()
