import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export default api 