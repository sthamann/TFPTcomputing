import React, { useState, useEffect } from 'react'
import { Line, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
} from 'chart.js'
import { theoryApi } from '../lib/theoryApi'
import { Loader2, Info } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const CascadeVisualization = () => {
  const [cascadeData, setCascadeData] = useState(null)
  const [rgData, setRgData] = useState(null)
  const [specialScales, setSpecialScales] = useState(null)
  const [correctionFactors, setCorrectionFactors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cascade')
  
  // Load all data from Theory API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      try {
        // Load cascade levels (0 to 30)
        const cascadeLevels = await theoryApi.getCascadeLevels(30)
        
        // Load special scales
        const scales = await theoryApi.getSpecialScales()
        setSpecialScales(scales)
        
        // Load correction factors
        const corrections = await theoryApi.getCorrectionFactors()
        setCorrectionFactors(corrections)
        
        // Load RG flow data
        const rgFlow = await theoryApi.getRGFlow(91.1876, 1e16, 50)
        setRgData(rgFlow)
        
        // Process cascade data for visualization
        if (cascadeLevels && cascadeLevels.length > 0) {
          setCascadeData(cascadeLevels)
        }
      } catch (error) {
        console.error('Error loading theory data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // Prepare chart data for cascade hierarchy
  const getCascadeChartData = () => {
    if (!cascadeData) return null
    
    // Key physics scales to highlight
    const keyScales = [
      { n: 0, label: 'φ₀', physics: 'Fundamental VEV' },
      { n: 3, label: 'φ₃', physics: 'Neutrino masses' },
      { n: 12, label: 'φ₁₂', physics: 'Higgs VEV' },
      { n: 15, label: 'φ₁₅', physics: 'Proton mass' },
      { n: 16, label: 'φ₁₆', physics: 'Charm quark' },
      { n: 17, label: 'φ₁₇', physics: 'Up quark' },
      { n: 20, label: 'φ₂₀', physics: 'Cosmic ray knee' },
      { n: 25, label: 'φ₂₅', physics: 'CMB temperature' }
    ]
    
    return {
      labels: cascadeData.map(d => d.n),
      datasets: [
        {
          label: 'VEV Value φₙ',
          data: cascadeData.map(d => d.phi_n),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          pointRadius: cascadeData.map(d => 
            keyScales.some(k => k.n === d.n) ? 8 : 3
          ),
          pointBackgroundColor: cascadeData.map(d => 
            keyScales.some(k => k.n === d.n) ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)'
          ),
        },
        {
          label: 'Attenuation γₙ',
          data: cascadeData.map(d => d.gamma_n),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
          pointRadius: 3,
        }
      ]
    }
  }
  
  // Prepare chart data for energy scales
  const getEnergyScaleChartData = () => {
    if (!cascadeData) return null
    
    // Important physics scales
    const physicsScales = [
      { energy: 0.511e-3, label: 'Electron mass' },
      { energy: 0.938, label: 'Proton mass' },
      { energy: 91.2, label: 'Z boson' },
      { energy: 246, label: 'Higgs VEV' },
      { energy: 1e3, label: 'TeV scale' },
      { energy: 1e14, label: 'GUT scale' },
      { energy: 1.22e19, label: 'Planck scale' }
    ]
    
    return {
      datasets: [
        {
          label: 'Cascade Energy Scales',
          data: cascadeData.map(d => ({
            x: d.n,
            y: d.energy_scale
          })),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          showLine: true,
          tension: 0.4,
        },
        {
          label: 'Physics Landmarks',
          data: physicsScales.map(s => ({
            x: 0,
            y: s.energy,
            label: s.label
          })),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          pointRadius: 8,
          showLine: false,
        }
      ]
    }
  }
  
  // Prepare RG flow chart data
  const getRGFlowChartData = () => {
    if (!rgData || rgData.length === 0) return null
    
    return {
      labels: rgData.map(d => d.scale.toExponential(1)),
      datasets: [
        {
          label: 'g₁ (U(1))',
          data: rgData.map(d => d.g1 || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'g₂ (SU(2))',
          data: rgData.map(d => d.g2 || 0),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'g₃ (SU(3))',
          data: rgData.map(d => d.g3 || 0),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
        }
      ]
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('cascade')}
          className={`pb-2 px-1 ${
            activeTab === 'cascade'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          E₈ Cascade Hierarchy
        </button>
        <button
          onClick={() => setActiveTab('energy')}
          className={`pb-2 px-1 ${
            activeTab === 'energy'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Energy Scales
        </button>
        <button
          onClick={() => setActiveTab('rg')}
          className={`pb-2 px-1 ${
            activeTab === 'rg'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          RG Flow
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`pb-2 px-1 ${
            activeTab === 'corrections'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Correction Factors
        </button>
      </div>
      
      {/* Cascade Hierarchy Tab */}
      {activeTab === 'cascade' && cascadeData && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">
              VEV Cascade Structure
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              The E₈ cascade generates a hierarchy of vacuum expectation values through
              the attenuation function γ(n) = 0.834 + 0.108n + 0.0105n²
            </p>
            <div className="h-96">
              <Line
                data={getCascadeChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      type: 'logarithmic',
                      title: {
                        display: true,
                        text: 'VEV Value φₙ',
                        color: '#9CA3AF'
                      },
                      grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    y1: {
                      type: 'linear',
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Attenuation γₙ',
                        color: '#9CA3AF'
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Cascade Level n',
                        color: '#9CA3AF'
                      },
                      grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#9CA3AF'
                      }
                    },
                    tooltip: {
                      callbacks: {
                        afterLabel: (context) => {
                          if (context.datasetIndex === 0) {
                            const keyScales = {
                              0: 'Fundamental VEV',
                              3: 'Neutrino masses',
                              12: 'Higgs VEV',
                              15: 'Proton mass',
                              16: 'Charm quark',
                              17: 'Up quark',
                              20: 'Cosmic ray knee',
                              25: 'CMB temperature'
                            }
                            return keyScales[context.parsed.x] || ''
                          }
                          return ''
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Key Values Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">φ₀</div>
              <div className="text-lg font-semibold text-indigo-400">
                {cascadeData[0]?.phi_n.toExponential(3)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">φ₃ (neutrinos)</div>
              <div className="text-lg font-semibold text-green-400">
                {cascadeData[3]?.phi_n.toExponential(3)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">φ₁₅ (proton)</div>
              <div className="text-lg font-semibold text-purple-400">
                {cascadeData[15]?.phi_n.toExponential(3)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">φ₂₅ (CMB)</div>
              <div className="text-lg font-semibold text-red-400">
                {cascadeData[25]?.phi_n.toExponential(3)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Energy Scales Tab */}
      {activeTab === 'energy' && cascadeData && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">
              Energy Scale Hierarchy
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Each cascade level corresponds to a characteristic energy scale E_n = M_Pl × φₙⁿ
            </p>
            <div className="h-96">
              <Scatter
                data={getEnergyScaleChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      type: 'logarithmic',
                      title: {
                        display: true,
                        text: 'Energy (GeV)',
                        color: '#9CA3AF'
                      },
                      grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Cascade Level n',
                        color: '#9CA3AF'
                      },
                      grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#9CA3AF'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* RG Flow Tab */}
      {activeTab === 'rg' && rgData && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">
              2-Loop RG Running
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Gauge coupling evolution showing approximate unification at the GUT scale
            </p>
            <div className="h-96">
              <Line
                data={getRGFlowChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Coupling Strength',
                        color: '#9CA3AF'
                      },
                      grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Energy Scale (GeV)',
                        color: '#9CA3AF'
                      },
                      grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                      },
                      ticks: {
                        color: '#9CA3AF',
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#9CA3AF'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Special Scales */}
          {specialScales && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">GUT Scale</div>
                <div className="text-lg font-semibold text-indigo-400">
                  {specialScales.gut_scale?.toExponential(2)} GeV
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">φ₀ Matching</div>
                <div className="text-lg font-semibold text-green-400">
                  {specialScales.phi0_matching?.toExponential(2)} GeV
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">c₃ Matching</div>
                <div className="text-lg font-semibold text-purple-400">
                  {specialScales.c3_matching?.toExponential(2)} GeV
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Correction Factors Tab */}
      {activeTab === 'corrections' && correctionFactors && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">
              Universal Correction Factors
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Three universal mechanisms explain systematic deviations from tree-level predictions
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-500/20 rounded-lg p-2">
                    <Info className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-indigo-400">4D-Loop Renormalization</h4>
                    <div className="text-2xl font-mono my-2 text-white">
                      1 - 2c₃ = {correctionFactors['4d_loop']?.toFixed(3)}
                    </div>
                    <p className="text-sm text-gray-400">
                      One-loop renormalization in 4 dimensions. Applies to Ω_b, m_μ, m_e
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/20 rounded-lg p-2">
                    <Info className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-400">KK-Geometry</h4>
                    <div className="text-2xl font-mono my-2 text-white">
                      1 - 4c₃ = {correctionFactors['kk_geometry']?.toFixed(3)}
                    </div>
                    <p className="text-sm text-gray-400">
                      First Kaluza-Klein shell on S¹. Applies to m_u
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500/20 rounded-lg p-2">
                    <Info className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-400">VEV-Backreaction</h4>
                    <div className="text-2xl font-mono my-2 text-white">
                      1 ± kφ₀ (k = 1, 2)
                    </div>
                    <p className="text-sm text-gray-400">
                      Radion self-coupling or level mixing. Applies to m_b, ε_K
                    </p>
                    <div className="flex space-x-4 mt-2">
                      <span className="text-sm">
                        1 + φ₀ = {correctionFactors['vev_backreaction_plus']?.toFixed(3)}
                      </span>
                      <span className="text-sm">
                        1 - φ₀ = {correctionFactors['vev_backreaction_minus']?.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CascadeVisualization