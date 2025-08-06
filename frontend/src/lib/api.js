import axios from 'axios'

// Always use relative path for API calls - Vite proxy will handle it
const API_BASE_URL = '/api'

console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.method, request.url)
  return request
})

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.config.url)
    return response
  },
  error => {
    console.error('API Error:', error.message, error.config?.url)
    return Promise.reject(error)
  }
)

// Constants API
export const constantsApi = {
  // Get all constants
  getAll: async () => {
    const response = await api.get('/constants')
    return response.data
  },

  // Get single constant with details
  getById: async (id) => {
    const response = await api.get(`/constants/${id}`)
    return response.data
  },

  // Calculate constant value
  calculate: async (id, { parameters, forceRecalculate } = {}) => {
    const response = await api.post(`/constants/${id}/calculate`, {
      parameters,
      forceRecalculate,
    })
    return response.data
  },
}

// Playground API
export const playgroundApi = {
  run: async (formula, parameters, outputUnit) => {
    const response = await api.post('/playground/run', {
      formula,
      parameters,
      outputUnit,
    })
    return response.data
  },
}

// DAG API
export const dagApi = {
  get: async () => {
    const response = await api.get('/dag')
    return response.data
  },
}

// WebSocket connection
export const createWebSocket = () => {
  const wsUrl = window.location.protocol === 'https:' 
    ? `wss://${window.location.host}/ws`
    : `ws://${window.location.host}/ws`
  
  return new WebSocket(wsUrl)
}

// Re-export theory API
export { theoryApi } from './theoryApi'

export default api 