// Forzar redespliegue en Vercel

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Montar la aplicación
app.mount('#app')

// Configuración de errores globales
app.config.errorHandler = (err) => {
  console.error('Error global:', err)
}

// Configuración de advertencias globales
app.config.warnHandler = (msg) => {
  console.warn('Warning global:', msg)
} 