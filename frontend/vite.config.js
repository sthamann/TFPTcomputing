import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://api:8000',  // Use Docker service name directly
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://api:8000',  // Use Docker service name directly
        ws: true,
        changeOrigin: true
      },
      '/constants/notebooks': {
        target: 'http://api:8000',
        changeOrigin: true
      },
      '/constants/data': {
        target: 'http://api:8000',
        changeOrigin: true
      },
      '/compute/results': {
        target: 'http://api:8000',
        changeOrigin: true
      }
    }
  }
}) 