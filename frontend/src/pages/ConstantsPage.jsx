import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { constantsApi } from '../lib/api'
import { Loader2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { constantGroups, getConstantGroup, groupOrder, getCorrectionFactor } from '../lib/constantGroups'
import KaTeXFormula from '../components/KaTeXFormula'
import TheoryExplanation from '../components/TheoryExplanation'
import CascadeVisualization from '../components/CascadeVisualization'

const ConstantsPage = () => {
  const [constants, setConstants] = useState([])
  const [constantDetails, setConstantDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [detailsLoaded, setDetailsLoaded] = useState(false)

  useEffect(() => {
    // Prevent double loading in development due to StrictMode
    let mounted = true;
    console.log('ConstantsPage mounted, loading constants...')
    
    if (mounted) {
      loadConstants()
    }
    
    return () => {
      mounted = false;
    }
  }, [])

  // Debug statistics when details are loaded
  useEffect(() => {
    if (detailsLoaded) {
      const stats = {
        total: constants.length,
        perfect: 0,
        good: 0,
        needsImprovement: 0,
        noData: 0
      }
      
      constants.forEach(c => {
        const detail = constantDetails[c.id]
        if (!detail || !detail.lastCalculation) {
          stats.noData++
          stats.needsImprovement++
          return
        }
        
        const theoryValue = detail.lastCalculation.calculated_value || detail.lastCalculation.result
        const measuredValue = detail.sources?.[0]?.value
        
        if (!theoryValue || !measuredValue) {
          stats.noData++
          stats.needsImprovement++
          return
        }
        
        const deviation = Math.abs(calculateDeviation(theoryValue, measuredValue) || 0)
        
        if (deviation <= 0.5) stats.perfect++
        else if (deviation <= 5) stats.good++
        else stats.needsImprovement++
      })
      
      console.log('Constant Statistics:', stats)
      console.log('Sample constant details:', Object.entries(constantDetails).slice(0, 3))
    }
  }, [detailsLoaded, constants, constantDetails])

  const loadConstants = async () => {
    try {
      setLoading(true)
      console.log('Fetching constants from API...')
      const data = await constantsApi.getAll()
      console.log('Constants loaded:', data)
      setConstants(data)
      
      // Load details for each constant to get calculation results
      const detailsPromises = data.map(async (constant) => {
        try {
          const detail = await constantsApi.getById(constant.id)
          return { id: constant.id, detail }
        } catch (error) {
          console.error(`Error loading details for ${constant.id}:`, error)
          return { id: constant.id, detail: null }
        }
      })
      
      const details = await Promise.all(detailsPromises)
      const detailsMap = {}
      details.forEach(({ id, detail }) => {
        if (detail) {
          detailsMap[id] = detail
        }
      })

      setConstantDetails(detailsMap)
      setDetailsLoaded(true)
    } catch (error) {
      console.error('Error loading constants:', error)
      toast.error('Failed to load constants')
    } finally {
      setLoading(false)
    }
  }

  const calculateDeviation = (theoryValue, measuredValue) => {
    if (!theoryValue || !measuredValue) return null
    const deviation = ((theoryValue - measuredValue) / measuredValue) * 100
    return deviation
  }

  const formatValue = (value, unit) => {
    if (!value && value !== 0) return '—'
    
    // Handle special units with scientific notation
    if (unit?.includes('×10')) {
      // For values that should be displayed with their unit multiplier
      if (Math.abs(value) >= 1 && Math.abs(value) < 1000) {
        return value.toPrecision(4)
      }
      return value.toExponential(3)
    }
    
    // For dimensionless very small values
    if (Math.abs(value) < 1e-6) {
      return value.toExponential(3)
    }
    
    // For very small numbers
    if (Math.abs(value) < 0.001) {
      return value.toPrecision(4)
    }
    
    // For large numbers
    if (Math.abs(value) > 10000) {
      return value.toExponential(3)
    }
    
    // For regular numbers
    if (Math.abs(value) < 1) {
      return value.toPrecision(4)
    }
    
    // For values between 1 and 10000
    return parseFloat(value.toPrecision(4))
  }

  const formatDeviation = (deviation) => {
    if (deviation === null || deviation === undefined) return '—'
    const sign = deviation >= 0 ? '+' : ''
    return `${sign}${deviation.toFixed(2)}%`
  }

  const getRowClass = (deviation) => {
    if (deviation === null || deviation === undefined) return ''
    const absDeviation = Math.abs(deviation)
    if (absDeviation > 5) return 'bg-red-50 dark:bg-red-900/20'
    if (absDeviation > 2) return 'bg-yellow-50 dark:bg-yellow-900/20'
    return ''
  }

  const renderConstantRow = (constant) => {
    const detail = constantDetails[constant.id]
    const lastCalculation = detail?.lastCalculation
    const theoryValue = lastCalculation?.calculated_value || lastCalculation?.result
    const measuredValue = detail?.sources?.[0]?.value
    const deviation = calculateDeviation(theoryValue, measuredValue)
    const hasWarning = Math.abs(deviation || 0) > 5
    const hasCalculationError = !lastCalculation || lastCalculation.status === 'error'
    
    const deviationBadgeClass = () => {
      if (hasCalculationError) return ''
      const absDeviation = Math.abs(deviation || 0)
      if (absDeviation <= 0.5) return 'badge-success'
      if (absDeviation <= 5) return 'badge-warning'
      return 'badge-error'
    }
    
    return (
      <tr key={constant.id} className="hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3">
          <Link to={`/constants/${constant.id}`} className="hover:text-primary flex items-center gap-2 transition-colors">
            <span className="font-medium">
              <KaTeXFormula formula={constant.symbol} />
            </span>
            {hasWarning && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </Link>
        </td>
        <td className="px-4 py-3">
          <Link to={`/constants/${constant.id}`} className="hover:text-primary transition-colors">
            {constant.name}
          </Link>
        </td>
        <td className="px-4 py-3">
          <div className="formula-display">
            {detail?.formula && <KaTeXFormula formula={detail.formula} />}
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          {hasCalculationError ? (
            <span className="text-destructive font-medium">
              Calculation failed
            </span>
          ) : (
            <span className="font-mono text-sm">
              {formatValue(theoryValue, constant.unit)}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-right font-mono text-sm">
          {formatValue(measuredValue, constant.unit)}
        </td>
        <td className="px-4 py-3 text-center">
          {hasCalculationError ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span className={`badge ${deviationBadgeClass()}`}>
              {formatDeviation(deviation)}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-center text-sm text-muted-foreground">
          {constant.unit || 'dimensionless'}
        </td>
        <td className="px-4 py-3 text-center text-sm text-muted-foreground">
          {lastCalculation?.timestamp ? 
            new Date(lastCalculation.timestamp).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : '—'}
        </td>
      </tr>
    )
  }

  if (loading || !detailsLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {!loading && !detailsLoaded && (
          <p className="ml-4 text-muted-foreground">Loading calculation results...</p>
        )}
      </div>
    )
  }

  // Group constants
  const groupedConstants = {}
  constants.forEach(constant => {
    const group = getConstantGroup(constant.id)
    if (!groupedConstants[group]) {
      groupedConstants[group] = []
    }
    groupedConstants[group].push(constant)
  })

  return (
    <div className="min-h-screen animate-slide-in">
      {/* Hero Section */}
      <div className="hero-section relative mb-12">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Physics Constants</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Precise calculations and theoretical correlations of fundamental constants
          </p>
          
          {/* Quick Info Section */}
          <div className="mt-8 p-6 glass rounded-xl inline-block">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-6xl font-bold gradient-text">
                  {detailsLoaded && constantDetails.alpha?.lastCalculation?.calculated_value 
                    ? `α⁻¹ = ${(1 / constantDetails.alpha.lastCalculation.calculated_value).toFixed(3)}`
                    : 'α⁻¹ = 137.036'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Fine Structure</div>
                <div className="text-xs">{detailsLoaded ? `${Object.keys(constantDetails).length} Constants Calculated` : '70+ Constants'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theory Explanation */}
      <div className="px-8">
        <TheoryExplanation />
      </div>
      
      {/* Cascade Visualization */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">
          <span className="gradient-text">Theory Structure & Predictions</span>
        </h2>
        <CascadeVisualization />
      </div>

      {/* Stats Section */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">
          <span>Physics Constants from Theory</span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          All fundamental constants calculated from topological fixed point theory. Each constant uses 
          executable formulas with a single source of truth - no duplicate calculations or manual 
          synchronization needed.
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="stat-card">
            <div className="relative z-10">
              <div className="text-2xl font-semibold mb-1">Total Constants</div>
              <div className="text-4xl font-bold text-primary">{constants.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="relative z-10">
              <div className="text-sm text-muted-foreground mb-1">Perfect (≤0.5%)</div>
              <div className="text-3xl font-bold text-accent">
                {detailsLoaded ? constants.filter(c => {
                  const detail = constantDetails[c.id]
                  if (!detail || !detail.lastCalculation) return false
                  const theoryValue = detail.lastCalculation.calculated_value || detail.lastCalculation.result
                  const measuredValue = detail.sources?.[0]?.value
                  if (!theoryValue || !measuredValue) return false
                  const deviation = calculateDeviation(theoryValue, measuredValue)
                  return Math.abs(deviation || 0) <= 0.5
                }).length : <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="relative z-10">
              <div className="text-sm text-muted-foreground mb-1">Good (0.5%-5%)</div>
              <div className="text-3xl font-bold text-yellow-500">
                {detailsLoaded ? constants.filter(c => {
                  const detail = constantDetails[c.id]
                  if (!detail || !detail.lastCalculation) return false
                  const theoryValue = detail.lastCalculation.calculated_value || detail.lastCalculation.result
                  const measuredValue = detail.sources?.[0]?.value
                  if (!theoryValue || !measuredValue) return false
                  const deviation = calculateDeviation(theoryValue, measuredValue)
                  return Math.abs(deviation || 0) > 0.5 && Math.abs(deviation || 0) <= 5
                }).length : <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="relative z-10">
              <div className="text-sm text-muted-foreground mb-1">Needs Improvement (&gt;5%)</div>
              <div className="text-3xl font-bold text-destructive">
                {detailsLoaded ? constants.filter(c => {
                  const detail = constantDetails[c.id]
                  if (!detail) return true // No detail loaded
                  const lastCalc = detail.lastCalculation
                  if (!lastCalc || lastCalc.status === 'error') return true
                  const theoryValue = lastCalc.calculated_value || lastCalc.result
                  const measuredValue = detail.sources?.[0]?.value
                  if (!theoryValue || !measuredValue) return true
                  const deviation = calculateDeviation(theoryValue, measuredValue)
                  return Math.abs(deviation || 0) > 5
                }).length : <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground italic text-center">
          Note: Many constants still missing potential RG loop effects and higher-order corrections
        </p>
      </div>

      {/* Main Table */}
      <div className="px-8 pb-12">
        <div className="section-header">
          <h2 className="section-title">Theory Constants Overview</h2>
        </div>
        
        <div className="card p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Formula</th>
                <th className="text-center">Theory Value</th>
                <th className="text-center">Measured Value</th>
                <th className="text-center">Deviation</th>
                <th className="text-center">Unit</th>
                <th className="text-center">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {groupOrder.map(group => {
                const groupConstants = groupedConstants[group]
                if (!groupConstants || groupConstants.length === 0) return null
                
                return (
                  <React.Fragment key={group}>
                    <tr className="bg-muted/30">
                      <td colSpan="8" className="px-4 py-3 font-semibold uppercase text-xs tracking-wider text-primary">
                        {group}
                      </td>
                    </tr>
                    {groupConstants.map(constant => renderConstantRow(constant))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ConstantsPage