import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import setupAntDesign from './plugins/antd'


const app = createApp(App)
const pinia = createPinia()

// Setup Pinia
app.use(pinia)

// Setup Ant Design Vue
setupAntDesign(app)

// Mount app
app.mount('#app')
