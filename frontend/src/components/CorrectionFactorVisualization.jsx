import React, { useState, useEffect } from 'react'
import { Info, Sparkles } from 'lucide-react'
import KaTeXFormula from './KaTeXFormula'

const CorrectionFactorVisualization = ({ constants, constantDetails }) => {
  const [correctionFactorMap, setCorrectionFactorMap] = useState({})

  // Define correction factors with their formulas and descriptions
  const correctionFactors = {
    '4D-Loop': {
      name: '4D-Loop',
      formula: '1 - 2c_3',
      value: 0.9204,
      description: 'One-loop renormalization in 4 dimensions',
      color: 'blue',
      explanation: 'Ordinary one-loop renormalization',
      mathFormula: '1 - \\frac{1}{4\\pi} = 1 - 2c_3',
      bgGradient: 'from-blue-600/20 to-blue-500/10',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    'KK-Geometry': {
      name: 'KK-Geometry',
      formula: '1 - 4c_3',
      value: 0.8410,
      description: 'First Kaluza-Klein shell on S¹',
      color: 'purple',
      explanation: 'Kaluza-Klein Shell',
      mathFormula: '1 - \\frac{1}{2\\pi} = 1 - 4c_3',
      bgGradient: 'from-purple-600/20 to-purple-500/10',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-300',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    'VEV-Backreaction-minus': {
      name: 'VEV-Backreaction',
      formula: '1 - 2\\phi_0',
      value: 0.8937,
      description: 'VEV backreaction with k=-2',
      color: 'green',
      explanation: 'Radion Self-Coupling',
      mathFormula: '1 - 2\\varphi_0',
      bgGradient: 'from-green-600/20 to-green-500/10',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-300',
      badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
    'VEV-Backreaction-plus': {
      name: 'VEV-Backreaction+',
      formula: '1 + 2\\phi_0',
      value: 1.1063,
      description: 'VEV backreaction with k=+2',
      color: 'amber',
      explanation: 'Radion Self-Coupling',
      mathFormula: '1 + 2\\varphi_0',
      bgGradient: 'from-amber-600/20 to-amber-500/10',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }
  }

  useEffect(() => {
    // Build a map of correction factors to constants
    const factorMap = {}
    
    Object.entries(constantDetails).forEach(([constantId, detail]) => {
      const factors = detail?.metadata?.correction_factors || []
      factors.forEach(factor => {
        if (!factorMap[factor.name]) {
          factorMap[factor.name] = []
        }
        factorMap[factor.name].push({
          id: constantId,
          symbol: detail.symbol,
          name: detail.name,
          formula: detail.formula
        })
      })
    })
    
    setCorrectionFactorMap(factorMap)
  }, [constantDetails])

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="glass rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20">
        <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Universal Correction Factors
        </h3>
        <p className="text-gray-400 mb-4">
          Three universal factors explain systematic deviations from tree-level predictions
        </p>
        
        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(correctionFactors).slice(0, 3).map(([key, factor]) => {
            const appliedTo = correctionFactorMap[key] || []
            
            return (
              <div 
                key={key} 
                className={`p-4 rounded-lg bg-gradient-to-br ${factor.bgGradient} border ${factor.borderColor} backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-semibold ${factor.textColor}`}>{factor.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full border ${factor.badgeColor}`}>
                    {factor.value.toFixed(3)}
                  </span>
                </div>
                <div className="mb-2">
                  <KaTeXFormula formula={factor.mathFormula} />
                </div>
                <p className="text-sm text-gray-400 mb-2">{factor.explanation}</p>
                {appliedTo.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Applied to {appliedTo.length} constant{appliedTo.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Breakdown - Always Visible */}
      <div className="glass rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50">
        <h3 className="text-xl font-bold mb-4 text-gray-200">Constants with Corrections</h3>
        
        <div className="space-y-4">
          {Object.entries(correctionFactorMap).map(([factorName, constants]) => {
            const factor = Object.values(correctionFactors).find(f => 
              f.name === factorName || factorName.includes(f.name.split('-')[0])
            )
            if (!factor) return null
            
            return (
              <div 
                key={factorName} 
                className={`rounded-lg bg-gradient-to-br ${factor.bgGradient} border ${factor.borderColor} overflow-hidden`}
              >
                <div className={`p-4 bg-gray-900/30`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${factor.badgeColor}`}>
                      {factorName}
                    </span>
                    <span className="text-sm text-gray-400">
                      Formula: <KaTeXFormula formula={factor.formula} />
                    </span>
                    <span className="text-sm text-gray-500">
                      = {factor.value.toFixed(4)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {constants.map(constant => (
                      <div 
                        key={constant.id} 
                        className="flex items-center gap-2 p-2 rounded bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="font-mono text-sm text-gray-300">
                          <KaTeXFormula formula={constant.symbol} />
                        </span>
                        <span className="text-sm text-gray-400">
                          {constant.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Constants without corrections */}
        {(() => {
          const constantsWithoutCorrections = Object.entries(constantDetails).filter(([id, detail]) => 
            !detail?.metadata?.correction_factors || detail.metadata.correction_factors.length === 0
          )
          
          if (constantsWithoutCorrections.length === 0) return null
          
          return (
            <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">
                  Tree-Level Constants (no corrections needed)
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {constantsWithoutCorrections.length} constants
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {constantsWithoutCorrections.slice(0, 24).map(([id, detail]) => (
                  <div key={id} className="text-xs p-1.5 rounded bg-gray-900/50 text-gray-400">
                    <KaTeXFormula formula={detail.symbol} /> 
                    <span className="ml-1 text-gray-500">{detail.name}</span>
                  </div>
                ))}
                {constantsWithoutCorrections.length > 24 && (
                  <div className="text-xs text-gray-500 p-1.5">
                    +{constantsWithoutCorrections.length - 24} more
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Key Insight Box */}
      <div className="glass rounded-xl p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Key Insight</h4>
            <p className="text-sm text-gray-300">
              A handful of fixed numbers (c₃, φ₀) plus small integers k suffice to obtain 
              next-to-leading-order corrections parameter-free. The correction factors emerge 
              naturally from the topological structure of the theory.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-2 rounded bg-purple-900/20 border border-purple-500/20">
                <span className="text-xs text-purple-400">Fundamental Parameters</span>
                <div className="text-sm font-mono text-purple-300 mt-1">
                  c₃ = 1/(8π) = 0.03979
                </div>
              </div>
              <div className="p-2 rounded bg-blue-900/20 border border-blue-500/20">
                <span className="text-xs text-blue-400">VEV Scale</span>
                <div className="text-sm font-mono text-blue-300 mt-1">
                  φ₀ = 0.053171
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CorrectionFactorVisualization