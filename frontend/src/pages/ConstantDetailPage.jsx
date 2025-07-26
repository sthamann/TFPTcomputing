import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { constantsApi } from '../lib/api'
import KaTeXFormula from '../components/KaTeXFormula'
import { 
  ArrowLeft, 
  Calculator, 
  Code, 
  Loader2, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const ConstantDetailPage = () => {
  const { id } = useParams()
  const [constant, setConstant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    formula: true,
    sources: true,
    calculation: false,
    code: false,
  })

  useEffect(() => {
    loadConstant()
  }, [id])

  const loadConstant = async () => {
    try {
      setLoading(true)
      const data = await constantsApi.getById(id)
      setConstant(data)
    } catch (error) {
      console.error('Error loading constant:', error)
      toast.error('Failed to load constant')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async (forceRecalculate = false) => {
    try {
      setCalculating(true)
      const result = await constantsApi.calculate(id, { forceRecalculate })
      
      // Handle different response types
      if (result.status === 'calculating') {
        toast.success('Calculation started. Results will update automatically.')
        // TODO: Connect to WebSocket for live updates
      } else if (result.status === 'error') {
        // Show error message
        toast.error(`Calculation failed: ${result.error || 'Unknown error'}`)
        // Still update the constant to show error state
        setConstant(prev => ({
          ...prev,
          lastCalculation: result
        }))
      } else if (result.status === 'completed') {
        toast.success('Calculation completed successfully')
        // Update the constant with the new calculation result
        setConstant(prev => ({
          ...prev,
          lastCalculation: result
        }))
      } else {
        // Direct result format (for backward compatibility)
        toast.success('Calculation completed')
        setConstant(prev => ({
          ...prev,
          lastCalculation: result
        }))
      }
    } catch (error) {
      console.error('Error calculating:', error)
      toast.error(`API Error: ${error.response?.data?.detail || error.message || 'Failed to calculate'}`)
    } finally {
      setCalculating(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!constant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Constant not found</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Back to constants
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to constants
        </Link>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{constant.name}</h1>
            <p className="text-4xl font-bold text-primary mt-2">{constant.symbol}</p>
            <p className="text-muted-foreground mt-2">{constant.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCalculate(false)}
              disabled={calculating}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                calculating && "opacity-50 cursor-not-allowed"
              )}
            >
              {calculating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              Calculate
            </button>
            <button
              onClick={() => handleCalculate(true)}
              disabled={calculating}
              className={cn(
                "inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "border hover:bg-secondary",
                calculating && "opacity-50 cursor-not-allowed"
              )}
              title="Force recalculation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium">{constant.category}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Unit</p>
            <p className="font-medium">{constant.unit}</p>
          </div>
        </div>

        {/* Formula Section */}
        <div className="border-t pt-6">
          <button
            onClick={() => toggleSection('formula')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold">Formula</h2>
            {expandedSections.formula ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSections.formula && (
            <div className="mt-4">
              <KaTeXFormula formula={constant.formula} block />
            </div>
          )}
        </div>

        {/* Sources Section */}
        <div className="border-t pt-6">
          <button
            onClick={() => toggleSection('sources')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold">Reference Sources</h2>
            {expandedSections.sources ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSections.sources && (
            <div className="mt-4 space-y-3">
              {constant.sources.map((source, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">Year: {source.year}</p>
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {source.value && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Reference value</p>
                      <p className="font-mono">{source.value}</p>
                      {source.uncertainty && (
                        <p className="text-sm text-muted-foreground">
                          ± {source.uncertainty}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Calculation Section */}
        {constant.lastCalculation && (
          <div className="border-t pt-6">
            <button
              onClick={() => toggleSection('calculation')}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-semibold">Last Calculation</h2>
              {expandedSections.calculation ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.calculation && (
              <div className="mt-4 space-y-4">
                {constant.lastCalculation.status === 'error' ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Calculation Error
                    </p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                      {constant.lastCalculation.error || 'Unknown error occurred'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Calculated Value</p>
                        <p className="font-mono text-lg">
                          {constant.lastCalculation.calculated_value} {constant.lastCalculation.unit}
                        </p>
                      </div>
                      {constant.lastCalculation.reference_value && (
                        <div>
                          <p className="text-sm text-muted-foreground">Reference Value</p>
                          <p className="font-mono text-lg">
                            {constant.lastCalculation.reference_value} {constant.lastCalculation.unit}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {constant.lastCalculation.relative_error !== null && (
                      <div>
                        <p className="text-sm text-muted-foreground">Relative Error</p>
                        <p className="font-mono text-lg">
                          {(constant.lastCalculation.relative_error * 100).toFixed(4)}%
                        </p>
                      </div>
                    )}
                    
                    {constant.lastCalculation.formula && (
                      <div>
                        <p className="text-sm text-muted-foreground">Formula Used</p>
                        <div className="mt-2">
                          <KaTeXFormula formula={constant.lastCalculation.formula} />
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Calculated at: {new Date(constant.lastCalculation.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Section */}
        <div className="border-t pt-6">
          <button
            onClick={() => toggleSection('code')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold">Python Code</h2>
            {expandedSections.code ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSections.code && (
            <div className="mt-4">
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>{`# Calculate ${constant.name}
from sympy import symbols, pi, sqrt, acos
import numpy as np

# Define symbols
${constant.dependencies.map(dep => `${dep} = symbols('${dep}', real=True, positive=True)`).join('\n')}

# Define formula
formula = ${constant.formula.split('=')[1]?.trim() || constant.formula}

# Calculate value
# ... (load dependency values and evaluate)`}</code>
                </pre>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="text-sm text-primary hover:underline">
                  Open Notebook
                </button>
                <button className="text-sm text-primary hover:underline">
                  Copy Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConstantDetailPage 