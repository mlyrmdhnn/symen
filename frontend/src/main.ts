import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Highcharts from 'highcharts'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/jetbrains-mono'

Highcharts.setOptions({
  lang: {
    locale: 'en-US', // atau 'id-ID'
    decimalPoint: '.',
    thousandsSep: ',',
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
