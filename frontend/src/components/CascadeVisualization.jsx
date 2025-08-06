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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { theoryApi } from '../lib/theoryApi'
import { Loader2, Info, Sparkles, Zap, Atom } from 'lucide-react'
import KaTeXFormula from './KaTeXFormula'

// Register the data labels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

const CascadeVisualization = () => {
  const [cascadeData, setCascadeData] = useState(null)
  const [rgData, setRgData] = useState(null)
  const [specialScales, setSpecialScales] = useState(null)
  const [correctionFactors, setCorrectionFactors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cascade')
  
  // Constants derived from cascade levels with categories
  const cascadeDerivedConstants = {
    0: { 
      symbol: 'φ₀', 
      name: 'Fundamental VEV', 
      value: '0.0532', 
      category: 'fundamental',
      constants: ['sin²θ_W', 'θ_c', 'α_s'],
      color: 'rgb(251, 191, 36)'
    },
    1: { 
      symbol: 'φ₁', 
      name: 'Neutrino mixing', 
      value: '2.99e-3', 
      category: 'neutrino',
      constants: ['neutrino mixing'],
      color: 'rgb(147, 51, 234)'
    },
    3: { 
      symbol: 'φ₃', 
      name: 'Neutrino scale', 
      value: '8.51e-4', 
      category: 'neutrino',
      constants: ['m_ν', 'Δν_t'],
      color: 'rgb(168, 85, 247)'
    },
    5: { 
      symbol: 'φ₅', 
      name: 'Electron', 
      value: '2.04e-4', 
      category: 'lepton',
      constants: ['m_e', 'y_e'],
      color: 'rgb(34, 197, 94)'
    },
    12: { 
      symbol: 'φ₁₂', 
      name: 'Weak scale', 
      value: '8.00e-6', 
      category: 'gauge',
      constants: ['v_H', 'M_W', 'M_Z'],
      color: 'rgb(59, 130, 246)'
    },
    15: { 
      symbol: 'φ₁₅', 
      name: 'Proton', 
      value: '5.49e-17', 
      category: 'hadron',
      constants: ['m_p', 'm_b'],
      color: 'rgb(239, 68, 68)'
    },
    17: { 
      symbol: 'φ₁₇', 
      name: 'Up quark', 
      value: '1.80e-47', 
      category: 'quark',
      constants: ['m_u'],
      color: 'rgb(236, 72, 153)'
    },
    20: { 
      symbol: 'φ₂₀', 
      name: 'Cosmic ray', 
      value: '~10⁻⁶⁰', 
      category: 'cosmology',
      constants: ['E_knee'],
      color: 'rgb(14, 165, 233)'
    },
    25: { 
      symbol: 'φ₂₅', 
      name: 'CMB', 
      value: '~10⁻⁸⁰', 
      category: 'cosmology',
      constants: ['T_γ₀', 'T_ν'],
      color: 'rgb(99, 102, 241)'
    },
    30: { 
      symbol: 'φ₃₀', 
      name: 'Dark energy', 
      value: '~10⁻⁹⁷', 
      category: 'cosmology',
      constants: ['ρ_Λ', 'τ_★'],
      color: 'rgb(124, 58, 237)'
    }
  }
  
  // Load all data from Theory API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      try {
        // Load cascade levels (0 to 35 for better visualization)
        const cascadeLevels = await theoryApi.getCascadeLevels(35)
        
        // Load special scales
        const scales = await theoryApi.getSpecialScales()
        setSpecialScales(scales)
        
        // Load correction factors
        const corrections = await theoryApi.getCorrectionFactors()
        setCorrectionFactors(corrections)
        
        // Load RG flow data with more points for smoother curves
        const rgFlow = await theoryApi.getRGFlow(91.1876, 1e16, 100)
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
  
  // Enhanced cascade chart with derived constants and labels
  const getCascadeChartData = () => {
    if (!cascadeData) return null
    
    return {
      labels: cascadeData.map(d => d.n),
      datasets: [
        {
          label: 'VEV Value φₙ',
          data: cascadeData.map(d => d.phi_n),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: cascadeData.map(d => 
            cascadeDerivedConstants[d.n] ? cascadeDerivedConstants[d.n].color : 'rgba(147, 51, 234, 0.3)'
          ),
          borderWidth: 2,
          pointRadius: cascadeData.map(d => cascadeDerivedConstants[d.n] ? 10 : 4),
          pointHoverRadius: cascadeData.map(d => cascadeDerivedConstants[d.n] ? 12 : 6),
          pointBorderWidth: cascadeData.map(d => cascadeDerivedConstants[d.n] ? 3 : 2),
          pointBorderColor: cascadeData.map(d => 
            cascadeDerivedConstants[d.n] ? cascadeDerivedConstants[d.n].color : 'rgb(147, 51, 234)'
          ),
          tension: 0.4,
          datalabels: {
            display: function(context) {
              const n = context.dataIndex
              return cascadeDerivedConstants[n] !== undefined
            },
            formatter: function(value, context) {
              const n = context.dataIndex
              const info = cascadeDerivedConstants[n]
              if (!info) return ''
              return [`n=${n}`, info.name, info.symbol]
            },
            align: function(context) {
              const n = context.dataIndex
              // Smart positioning to avoid overlaps
              if (n === 0) return 'top'
              if (n === 1) return 'right'
              if (n === 3) return 'top'
              if (n === 5) return 'bottom'
              if (n === 12) return 'top'
              if (n === 15) return 'bottom'
              if (n === 17) return 'left'
              if (n === 20) return 'right'
              if (n === 25) return 'top'
              if (n === 30) return 'bottom'
              return 'top'
            },
            anchor: function(context) {
              const n = context.dataIndex
              // Anchor points for better label positioning
              if (n === 1 || n === 20) return 'start'
              if (n === 17) return 'end'
              return 'center'
            },
            offset: function(context) {
              const n = context.dataIndex
              // Variable offset for better spacing
              if (n === 0 || n === 3) return 15
              if (n === 1 || n === 17) return 8
              return 10
            },
            backgroundColor: function(context) {
              const n = context.dataIndex
              const info = cascadeDerivedConstants[n]
              return info ? `${info.color}22` : 'transparent'
            },
            borderColor: function(context) {
              const n = context.dataIndex
              const info = cascadeDerivedConstants[n]
              return info ? info.color : 'transparent'
            },
            borderRadius: 6,
            borderWidth: 1,
            color: 'white',
            font: {
              size: 10,
              weight: 'bold'
            },
            padding: 4,
            textAlign: 'center'
          }
        },
        {
          label: 'Attenuation γₙ',
          data: cascadeData.map(d => d.gamma_n),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1',
          pointRadius: 3,
          datalabels: {
            display: false
          }
        }
      ]
    }
  }
  
  // Enhanced RG flow chart highlighting c₃ and φ₀ derivation
  const getRGFlowChartData = () => {
    if (!rgData || rgData.length === 0) return null
    
    // Find GUT scale point where couplings unify
    const gutIndex = rgData.findIndex(d => d.scale > 1e14)
    
    return {
      labels: rgData.map(d => d.scale.toExponential(1)),
      datasets: [
        {
          label: 'g₁ (U(1))',
          data: rgData.map(d => d.g1 || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'g₂ (SU(2))',
          data: rgData.map(d => d.g2 || 0),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'g₃ (SU(3))',
          data: rgData.map(d => d.g3 || 0),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        // Highlight unification point
        gutIndex >= 0 && {
          label: 'Unification → c₃, φ₀',
          data: [{ x: gutIndex, y: rgData[gutIndex]?.g1 || 0.55 }],
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgb(251, 191, 36)',
          pointRadius: 12,
          pointHoverRadius: 15,
          showLine: false,
          borderWidth: 3,
        }
      ].filter(Boolean)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg backdrop-blur-sm">
        {[
          { id: 'cascade', label: 'E₈ Cascade Hierarchy', icon: Sparkles },
          { id: 'energy', label: 'Energy Scales', icon: Zap },
          { id: 'rg', label: 'RG Flow', icon: Atom },
          { id: 'corrections', label: 'Correction Factors', icon: Info }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* E₈ Cascade Hierarchy Tab */}
      {activeTab === 'cascade' && cascadeData && (
        <div className="glass rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2 text-purple-300">VEV Cascade Structure</h3>
            <p className="text-gray-400">
              The E₈ cascade generates a hierarchy of vacuum expectation values through the attenuation function γ(n) = 0.834 + 0.108n + 0.0105n²
            </p>
          </div>
          
          <div className="h-[600px] mb-6">
            <Line
              data={getCascadeChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    top: 40,
                    bottom: 20,
                    left: 20,
                    right: 20
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'rgb(209, 213, 219)' }
                  },
                  tooltip: {
                    callbacks: {
                      afterLabel: (context) => {
                        const n = context.parsed.x
                        const derived = cascadeDerivedConstants[n]
                        if (derived) {
                          return `\nCategory: ${derived.category}\nDerives: ${derived.constants.join(', ')}`
                        }
                        return ''
                      }
                    }
                  },
                  datalabels: {
                    display: true,
                    clip: false
                  }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Cascade Level n', color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.3)' },
                    ticks: { color: 'rgb(156, 163, 175)' },
                    min: -1,
                    max: 36
                  },
                  y: {
                    type: 'logarithmic',
                    title: { display: true, text: 'VEV Value φₙ', color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.3)' },
                    ticks: { 
                      color: 'rgb(156, 163, 175)',
                      callback: function(value) {
                        if (value === 1) return '1'
                        if (value === 0.1) return '10⁻¹'
                        if (value === 0.01) return '10⁻²'
                        if (value === 0.001) return '10⁻³'
                        if (value === 1e-4) return '10⁻⁴'
                        if (value === 1e-5) return '10⁻⁵'
                        if (value === 1e-10) return '10⁻¹⁰'
                        if (value === 1e-15) return '10⁻¹⁵'
                        if (value === 1e-20) return '10⁻²⁰'
                        if (value === 1e-30) return '10⁻³⁰'
                        if (value === 1e-40) return '10⁻⁴⁰'
                        if (value === 1e-50) return '10⁻⁵⁰'
                        if (value === 1e-60) return '10⁻⁶⁰'
                        if (value === 1e-80) return '10⁻⁸⁰'
                        if (value === 1e-100) return '10⁻¹⁰⁰'
                        const exp = Math.log10(value)
                        if (exp % 5 === 0 || exp % 10 === 0) {
                          return `10^${exp.toFixed(0)}`
                        }
                        return ''
                      }
                    },
                    position: 'left',
                  },
                  y1: {
                    title: { display: true, text: 'Attenuation γₙ', color: 'rgb(156, 163, 175)' },
                    grid: { display: false },
                    ticks: { color: 'rgb(156, 163, 175)' },
                    position: 'right',
                  }
                }
              }}
            />
          </div>
          
          {/* Key cascade levels with derived constants - organized by category */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-300">Constants Derived from Cascade Levels</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(cascadeDerivedConstants).map(([n, info]) => {
                const cascadeLevel = cascadeData.find(d => d.n === parseInt(n))
                return (
                  <div 
                    key={n} 
                    className="relative overflow-hidden rounded-lg border backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${info.color}20 0%, ${info.color}10 100%)`,
                      borderColor: `${info.color}40`
                    }}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-bold" style={{ color: info.color }}>
                          {info.symbol}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400">
                          n={n}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{info.category}</div>
                      <div className="text-sm font-semibold text-gray-200 mb-1">{info.name}</div>
                      <div className="text-xl font-mono mb-2" style={{ color: info.color }}>
                        {cascadeLevel ? cascadeLevel.phi_n.toExponential(2) : info.value}
                      </div>
                      <div className="text-xs text-gray-400">
                        → {info.constants.join(', ')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* RG Flow Tab with highlighted unification */}
      {activeTab === 'rg' && rgData && (
        <div className="glass rounded-xl p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2 text-blue-300">2-Loop RG Running</h3>
            <p className="text-gray-400 mb-2">
              Gauge coupling evolution showing approximate unification at the GUT scale
            </p>
            <div className="flex items-center gap-2 p-3 bg-amber-500/20 rounded-lg border border-amber-500/50">
              <Info className="h-5 w-5 text-amber-400" />
              <p className="text-sm text-amber-200">
                <strong>Key Result:</strong> The unification point determines c₃ and φ₀ backwards from RG running!
                The crossing point of the gauge couplings constrains our fundamental parameters.
              </p>
            </div>
          </div>
          
          <div className="h-96 mb-6">
            <Line
              data={getRGFlowChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'rgb(209, 213, 219)' }
                  },
                  datalabels: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Energy Scale (GeV)', color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.3)' },
                    ticks: { 
                      color: 'rgb(156, 163, 175)',
                      callback: function(value) {
                        const exp = Math.log10(value)
                        if (exp % 2 === 0) {
                          return `10^${exp.toFixed(0)}`
                        }
                        return ''
                      }
                    }
                  },
                  y: {
                    title: { display: true, text: 'Coupling Strength', color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.3)' },
                    ticks: { color: 'rgb(156, 163, 175)' },
                    min: -1,
                    max: 1
                  }
                }
              }}
            />
          </div>
          
          {/* Special scales display */}
          {specialScales && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/30">
                <div className="text-sm text-gray-400 mb-1">GUT Scale</div>
                <div className="text-2xl font-mono text-blue-300">
                  {specialScales.M_GUT?.toExponential(2)} GeV
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/30">
                <div className="text-sm text-gray-400 mb-1">φ₀ Matching</div>
                <div className="text-2xl font-mono text-amber-300">
                  {specialScales.phi0_matching?.toExponential(2) || '2.40e+16 GeV'}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                <div className="text-sm text-gray-400 mb-1">c₃ Matching</div>
                <div className="text-2xl font-mono text-purple-300">
                  {specialScales.c3_matching?.toExponential(2) || '7.70e+17 GeV'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Energy Scales Tab */}
      {activeTab === 'energy' && cascadeData && (
        <div className="glass rounded-xl p-6 bg-gradient-to-br from-green-900/20 to-blue-900/20">
          <h3 className="text-2xl font-bold mb-4 text-green-300">Energy Scale Hierarchy</h3>
          <div className="h-96">
            <Scatter
              data={{
                datasets: [{
                  label: 'Cascade Energy Scales',
                  data: cascadeData.map(d => ({
                    x: d.n,
                    y: d.energy_scale_GeV || (1.2209e19 * Math.pow(d.phi_n, d.n))
                  })),
                  borderColor: 'rgb(168, 85, 247)',
                  backgroundColor: cascadeData.map(d => 
                    cascadeDerivedConstants[d.n] ? cascadeDerivedConstants[d.n].color : 'rgba(168, 85, 247, 0.5)'
                  ),
                  pointRadius: cascadeData.map(d => cascadeDerivedConstants[d.n] ? 8 : 5),
                  showLine: true,
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    labels: { color: 'rgb(209, 213, 219)' }
                  },
                  datalabels: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Cascade Level n', color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.3)' },
                    ticks: { color: 'rgb(156, 163, 175)' }
                  },
                  y: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Energy Scale (GeV)', color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.3)' },
                    ticks: { 
                      color: 'rgb(156, 163, 175)',
                      callback: function(value) {
                        return value.toExponential(0)
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      
      {/* Correction Factors Tab - Fixed */}
      {activeTab === 'corrections' && (
        <div className="glass rounded-xl p-6 bg-gradient-to-br from-amber-900/20 to-red-900/20">
          <h3 className="text-2xl font-bold mb-4 text-amber-300">Universal Correction Factors</h3>
          
          {correctionFactors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(correctionFactors).map(([key, factor]) => (
                <div 
                  key={key} 
                  className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-amber-200">{key.replace(/_/g, '-')}</h4>
                    <span className="text-xl font-mono text-amber-400">
                      {typeof factor.value === 'number' ? factor.value.toFixed(4) : factor.value}
                    </span>
                  </div>
                  {factor.formula && (
                    <div className="text-sm text-gray-300 mb-2">
                      <KaTeXFormula formula={factor.formula} />
                    </div>
                  )}
                  <p className="text-xs text-gray-400">{factor.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No correction factors data available</p>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <h4 className="font-semibold text-purple-300 mb-2">Key Insight</h4>
            <p className="text-sm text-gray-300">
              These universal correction factors emerge naturally from the topological structure:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• <strong className="text-blue-300">4D-Loop:</strong> One-loop quantum corrections in 4 dimensions</li>
              <li>• <strong className="text-purple-300">KK-Geometry:</strong> First Kaluza-Klein mode on S¹</li>
              <li>• <strong className="text-green-300">VEV-Backreaction:</strong> Radion self-coupling effects</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default CascadeVisualization