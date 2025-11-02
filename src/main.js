import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import setupAntDesign from './plugins/antd'
import { useAuthStore } from './store/auth'

const app = createApp(App)
const pinia = createPinia()

// Setup Pinia first
app.use(pinia)

// Initialize auth store before router
const authStore = useAuthStore()

// Setup Vue Router
app.use(router)

// Setup Ant Design Vue
setupAntDesign(app)

// Initialize auth store and mount app
authStore.init().then(() => {
  console.log('Auth store initialized, mounting app...')
  app.mount('#app')
}).catch(error => {
  console.error('Failed to initialize auth store:', error)
  app.mount('#app')
})
