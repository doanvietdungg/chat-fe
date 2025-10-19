import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
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
