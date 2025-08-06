import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      },
      '/constants': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/compute': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
