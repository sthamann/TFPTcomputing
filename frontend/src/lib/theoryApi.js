import api from './api'

// Theory API endpoints
export const theoryApi = {
  // Get all calculated constants from TopologicalConstants
  calculate: async () => {
    try {
      const response = await api.get('/api/theory/calculate')
      return response.data
    } catch (error) {
      console.error('Theory calculation failed:', error)
      // Return mock data as fallback
      return null
    }
  },

  // Get RG running at specific scale
  getRGRunning: async (scale) => {
    try {
      const response = await api.get(`/api/theory/rg-running/${scale}`)
      return response.data
    } catch (error) {
      console.error('RG running calculation failed:', error)
      return null
    }
  },

  // Get cascade values for level n
  getCascade: async (n) => {
    try {
      const response = await api.get(`/api/theory/cascade/${n}`)
      return response.data
    } catch (error) {
      console.error('Cascade calculation failed:', error)
      // Fallback calculation
      const phi0 = 0.053171
      const gamma = (k) => 0.834 + 0.108 * k + 0.0105 * k * k
      let sum = 0
      for (let i = 0; i < n; i++) {
        sum += gamma(i)
      }
      return {
        n,
        phi_n: phi0 * Math.exp(-sum),
        gamma_n: gamma(n),
        energy_scale: 1.2209e19 * Math.pow(phi0 * Math.exp(-sum), n)
      }
    }
  },

  // Get special scales
  getSpecialScales: async () => {
    try {
      const response = await api.get('/api/theory/special-scales')
      return response.data
    } catch (error) {
      console.error('Special scales calculation failed:', error)
      return {
        gut_scale: 1.2e14,
        phi0_matching: 2.4e16,
        c3_matching: 7.7e17
      }
    }
  },

  // Get correction factors
  getCorrectionFactors: async () => {
    try {
      const response = await api.get('/api/theory/correction-factors')
      return response.data
    } catch (error) {
      console.error('Correction factors calculation failed:', error)
      return {
        '4d_loop': 0.920,
        'kk_geometry': 0.841,
        'vev_backreaction_plus': 1.106,
        'vev_backreaction_minus': 0.894
      }
    }
  },

  // Get multiple cascade levels at once
  getCascadeLevels: async (maxLevel = 30) => {
    try {
      const promises = []
      for (let n = 0; n <= maxLevel; n++) {
        promises.push(theoryApi.getCascade(n))
      }
      const results = await Promise.all(promises)
      return results.filter(r => r !== null)
    } catch (error) {
      console.error('Cascade levels calculation failed:', error)
      // Fallback to local calculation
      const levels = []
      const phi0 = 0.053171
      const gamma = (k) => 0.834 + 0.108 * k + 0.0105 * k * k
      const M_Pl = 1.2209e19
      
      for (let n = 0; n <= maxLevel; n++) {
        let sum = 0
        for (let i = 0; i < n; i++) {
          sum += gamma(i)
        }
        const phi_n = phi0 * Math.exp(-sum)
        levels.push({
          n,
          phi_n,
          gamma_n: gamma(n),
          energy_scale: M_Pl * Math.pow(phi_n, n)
        })
      }
      return levels
    }
  },

  // Get RG flow data for visualization
  getRGFlow: async (startScale = 91.1876, endScale = 1e16, points = 100) => {
    try {
      const scales = []
      const logStart = Math.log10(startScale)
      const logEnd = Math.log10(endScale)
      const step = (logEnd - logStart) / (points - 1)
      
      for (let i = 0; i < points; i++) {
        const scale = Math.pow(10, logStart + i * step)
        scales.push(scale)
      }
      
      const promises = scales.map(scale => theoryApi.getRGRunning(scale))
      const results = await Promise.all(promises)
      
      return results.map((data, i) => ({
        scale: scales[i],
        ...data
      })).filter(r => r !== null)
    } catch (error) {
      console.error('RG flow calculation failed:', error)
      return []
    }
  }
}

export default theoryApi