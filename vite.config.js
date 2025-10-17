import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // Ant Design theme customization
          '@primary-color': '#1890ff',
          '@border-radius-base': '6px',
        },
        javascriptEnabled: true,
      },
    },
  },
})
