import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
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
  
  // Calculate cascade VEVs
  useEffect(() => {
    const phi0 = 0.053171
    const gamma = (n) => 0.834 + 0.108 * n + 0.0105 * n * n
    
    const calculatePhi = (n) => {
      let sum = 0
      for (let i = 0; i < n; i++) {
        sum += gamma(i)
      }
      return phi0 * Math.exp(-sum)
    }
    
    // Generate cascade levels
    const levels = []
    const values = []
    const energies = []
    const M_Pl = 1.2209e19 // GeV
    
    for (let n = 0; n <= 30; n++) {
      levels.push(n)
      const phi_n = calculatePhi(n)
      values.push(phi_n)
      energies.push(phi_n * M_Pl / 1e9) // Convert to TeV
    }
    
    setCascadeData({
      levels,
      values,
      energies
    })
  }, [])
  
  // Mock RG running data (would be fetched from backend)
  useEffect(() => {
    const scales = []
    const alpha1 = []
    const alpha2 = []
    const alpha3 = []
    
    // Generate logarithmic scale points
    for (let logMu = 2; logMu <= 19; logMu += 0.5) {
      const mu = Math.pow(10, logMu)
      scales.push(mu)
      
      // Approximate RG running (simplified)
      const t = Math.log(mu / 91.2)
      alpha1.push(59.5 - 41/10 * t / (2 * Math.PI))
      alpha2.push(29.6 + 19/6 * t / (2 * Math.PI))
      alpha3.push(8.5 + 7 * t / (2 * Math.PI))
    }
    
    setRgData({
      scales,
      alpha1,
      alpha2,
      alpha3
    })
  }, [])
  
  const cascadeChartData = cascadeData ? {
    labels: cascadeData.levels,
    datasets: [
      {
        label: 'φₙ VEV',
        data: cascadeData.values,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Energy Scale (TeV)',
        data: cascadeData.energies,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y1'
      }
    ]
  } : null
  
  const rgChartData = rgData ? {
    labels: rgData.scales.map(s => s.toExponential(1)),
    datasets: [
      {
        label: 'α₁⁻¹ (U(1))',
        data: rgData.alpha1,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'α₂⁻¹ (SU(2))',
        data: rgData.alpha2,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      },
      {
        label: 'α₃⁻¹ (SU(3))',
        data: rgData.alpha3,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  } : null
  
  const cascadeOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'E₈ Cascade Structure'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (label.includes('VEV')) {
              return `${label}: ${value.toExponential(2)}`
            } else {
              return `${label}: ${value.toFixed(2)} TeV`
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Cascade Level n'
        }
      },
      y: {
        type: 'logarithmic',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'VEV φₙ'
        },
        ticks: {
          callback: (value) => value.toExponential(0)
        }
      },
      y1: {
        type: 'logarithmic',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Energy Scale (TeV)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }
  
  const rgOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: '2-Loop RG Running of Gauge Couplings'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Energy Scale μ (GeV)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Inverse Coupling αᵢ⁻¹'
        },
        min: 0,
        max: 60
      }
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Cascade Structure */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">E₈ Cascade Hierarchy</h3>
        <p className="text-muted-foreground mb-4">
          The cascade structure generates a hierarchy of VEVs through the attenuation function γ(n) = 0.834 + 0.108n + 0.0105n²
        </p>
        {cascadeChartData && (
          <Line data={cascadeChartData} options={cascadeOptions} />
        )}
        
        {/* Key cascade values */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">φ₀</div>
            <div className="font-mono font-bold">0.0532</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">φ₃</div>
            <div className="font-mono font-bold">8.51×10⁻⁴</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">φ₄</div>
            <div className="font-mono font-bold">8.51×10⁻⁵</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">φ₅</div>
            <div className="font-mono font-bold">8.00×10⁻⁶</div>
          </div>
        </div>
      </div>
      
      {/* RG Running */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Renormalization Group Flow</h3>
        <p className="text-muted-foreground mb-4">
          2-loop RG running shows gauge coupling unification at M_GUT ≈ 10¹⁴ GeV
        </p>
        {rgChartData && (
          <Line data={rgChartData} options={rgOptions} />
        )}
        
        {/* Special scales */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">M_Z</div>
            <div className="font-mono font-bold">91.2 GeV</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">M_GUT</div>
            <div className="font-mono font-bold">1.2×10¹⁴ GeV</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">M_Planck</div>
            <div className="font-mono font-bold">1.2×10¹⁹ GeV</div>
          </div>
        </div>
      </div>
      
      {/* Correction Factors */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Universal Correction Factors</h3>
        <p className="text-muted-foreground mb-4">
          Three universal factors explain systematic deviations from tree-level predictions
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-600/10 to-blue-400/10 rounded-lg border border-blue-500/20">
            <h4 className="font-bold text-blue-400">4D-Loop</h4>
            <div className="font-mono text-lg my-2">1 - 2c₃ = 0.920</div>
            <p className="text-sm text-muted-foreground">
              One-loop renormalization in 4 dimensions
            </p>
            <div className="text-xs mt-2 text-blue-300">
              Applies to: Ω_b, m_μ, m_e
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-600/10 to-green-400/10 rounded-lg border border-green-500/20">
            <h4 className="font-bold text-green-400">KK-Geometry</h4>
            <div className="font-mono text-lg my-2">1 - 4c₃ = 0.841</div>
            <p className="text-sm text-muted-foreground">
              First Kaluza-Klein shell on S¹
            </p>
            <div className="text-xs mt-2 text-green-300">
              Applies to: m_u
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-600/10 to-purple-400/10 rounded-lg border border-purple-500/20">
            <h4 className="font-bold text-purple-400">VEV-Backreaction</h4>
            <div className="font-mono text-lg my-2">1 ± kφ₀</div>
            <p className="text-sm text-muted-foreground">
              Radion self-coupling or level mixing
            </p>
            <div className="text-xs mt-2 text-purple-300">
              Applies to: m_b, ε_K
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CascadeVisualization