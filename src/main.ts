import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Montar la aplicación
app.mount('#app')

// Configuración de errores globales
app.config.errorHandler = (err, vm, info) => {
  console.error('Error global:', err)
  console.error('Info:', info)
}

// Configuración de advertencias globales
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Advertencia global:', msg)
  console.warn('Trace:', trace)
} 