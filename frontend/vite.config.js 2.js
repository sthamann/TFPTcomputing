import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV 
          ? 'http://localhost:8000'  // Local development
          : 'http://api:8000',       // Docker development
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV
          ? 'ws://localhost:8000'    // Local development
          : 'ws://api:8000',         // Docker development
        ws: true,
        changeOrigin: true
      },
      '/constants/notebooks': {
        target: process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV
          ? 'http://localhost:8000'  // Local development
          : 'http://api:8000',       // Docker development
        changeOrigin: true
      },
      '/constants/data': {
        target: process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV
          ? 'http://localhost:8000'  // Local development
          : 'http://api:8000',       // Docker development
        changeOrigin: true
      },
      '/compute/results': {
        target: process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV
          ? 'http://localhost:8000'  // Local development
          : 'http://api:8000',       // Docker development
        changeOrigin: true
      }
    }
  }
}) 