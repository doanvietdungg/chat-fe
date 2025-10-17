import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import setupAntDesign from './plugins/antd'

const app = createApp(App)

// Setup Ant Design Vue
setupAntDesign(app)

app.mount('#app')
