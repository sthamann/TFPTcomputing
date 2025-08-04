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
  FileJson,
  FileText,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Download
} from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'
import { Highlight, themes } from 'prism-react-renderer'

const ConstantDetailPage = () => {
  const { id } = useParams()
  const [constant, setConstant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState('json')
  const [notebookContent, setNotebookContent] = useState(null)
  const [executedNotebook, setExecutedNotebook] = useState(null)
  const [jsonSource, setJsonSource] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    loadConstant()
    loadNotebookContent()
    loadJsonSource()
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

  const loadNotebookContent = async () => {
    try {
      // Load the generated notebook
      const response = await fetch(`/constants/notebooks/${id}.ipynb`)
      if (response.ok) {
        const notebook = await response.json()
        setNotebookContent(notebook)
      }

      // Load the executed notebook
      const executedResponse = await fetch(`/compute/results/${id}_executed.ipynb`)
      if (executedResponse.ok) {
        const executedNotebook = await executedResponse.json()
        setExecutedNotebook(executedNotebook)
      }
    } catch (error) {
      console.error('Error loading notebook:', error)
    }
  }

  const loadJsonSource = async () => {
    try {
      const response = await fetch(`/constants/data/${id}.json`)
      if (response.ok) {
        const json = await response.json()
        setJsonSource(json)
      }
    } catch (error) {
      console.error('Error loading JSON source:', error)
    }
  }

  const handleCalculate = async (forceRecalculate = false) => {
    try {
      setCalculating(true)
      const result = await constantsApi.calculate(id, { forceRecalculate })
      setConstant(prev => ({ ...prev, lastCalculation: result }))
      toast.success('Calculation completed')
      await loadNotebookContent() // Reload to get updated executed notebook
    } catch (error) {
      console.error('Error calculating:', error)
      toast.error('Calculation failed')
    } finally {
      setCalculating(false)
    }
  }

  const extractPythonCode = (notebook) => {
    if (!notebook || !notebook.cells) return ''
    
    return notebook.cells
      .filter(cell => cell.cell_type === 'code')
      .map(cell => {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
        return source
      })
      .join('\n\n')
  }

  const extractPythonWithOutput = (notebook) => {
    if (!notebook || !notebook.cells) return []
    
    return notebook.cells.map((cell, index) => {
      if (cell.cell_type === 'code') {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
        const outputs = cell.outputs || []
        
        return {
          type: 'code',
          source,
          outputs: outputs.map(output => {
            if (output.output_type === 'stream') {
              return {
                type: 'stream',
                text: Array.isArray(output.text) ? output.text.join('') : output.text
              }
            } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
              return {
                type: 'result',
                text: output.data?.['text/plain'] || ''
              }
            } else if (output.output_type === 'error') {
              return {
                type: 'error',
                text: output.traceback ? output.traceback.join('\n') : output.evalue || ''
              }
            }
            return null
          }).filter(Boolean)
        }
      } else if (cell.cell_type === 'markdown') {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
        return {
          type: 'markdown',
          source
        }
      }
      return null
    }).filter(Boolean)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
    toast.success('Code copied to clipboard')
  }

  const downloadNotebook = (content, filename) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const downloadPythonCode = (code, filename) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const formatValue = (value, unit) => {
    if (!value && value !== 0) return '—'
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return value
    
    let formatted
    if (Math.abs(numValue) < 1e-3 || Math.abs(numValue) > 1e6) {
      formatted = numValue.toExponential(6)
    } else {
      formatted = numValue.toPrecision(8)
    }
    
    return unit && unit !== 'dimensionless' ? `${formatted} ${unit}` : formatted
  }

  const formatDeviation = (deviation) => {
    if (!deviation && deviation !== 0) return '—'
    const sign = deviation > 0 ? '+' : ''
    return `${sign}${deviation.toFixed(2)}%`
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

  const tabs = [
    { id: 'json', label: 'JSON Source', icon: FileJson },
    { id: 'python', label: 'Python Notebook', icon: FileCode },
    { id: 'executed', label: 'Python Notebook with Execution Details', icon: FileText }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to constants
        </Link>
      </div>

      {/* Header Card */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{constant.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-primary">
                <KaTeXFormula formula={constant.symbol} />
              </span>
              <span className="text-sm text-muted-foreground">
                Source: <code className="bg-muted px-2 py-1 rounded">constants/data/{id}.json</code>
              </span>
            </div>
            {constant.description && (
              <p className="text-muted-foreground">{constant.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCalculate(false)}
              disabled={calculating}
              className={cn(
                "btn btn-primary",
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
                "btn btn-secondary",
                calculating && "opacity-50 cursor-not-allowed"
              )}
              title="Force recalculation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Constant Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{constant.category}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unit</p>
            <p className="font-medium">{constant.unit || 'dimensionless'}</p>
          </div>
          {constant.lastCalculation && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Theory Value</p>
                <p className="font-medium font-mono text-sm">
                  {formatValue(
                    constant.lastCalculation.calculated_value || constant.lastCalculation.result,
                    constant.unit
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Measured Value</p>
                <p className="font-medium font-mono text-sm">
                  {formatValue(constant.sources?.[0]?.value, constant.unit)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Accuracy Stats */}
        {constant.lastCalculation && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Accuracy Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-card p-4">
                <div className="text-2xl font-bold text-primary">
                  {constant.lastCalculation.accuracy_met ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Target: {((jsonSource?.accuracyTarget || constant.accuracyTarget || 0.001) * 100).toFixed(3)}%
                </div>
              </div>
              <div className="stat-card p-4">
                <div className="text-2xl font-bold">
                  {Math.abs(parseFloat(constant.lastCalculation.relative_error) * 100).toFixed(6)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Relative Error</div>
              </div>
              <div className="stat-card p-4">
                <div className="text-2xl font-bold text-accent">
                  {(() => {
                    const theoryVal = constant.lastCalculation.calculated_value || constant.lastCalculation.result
                    const measuredVal = constant.sources?.[0]?.value
                    if (!theoryVal || !measuredVal) return '—'
                    
                    // Calculate matching digits
                    const theoryStr = theoryVal.toExponential(15)
                    const measuredStr = measuredVal.toExponential(15)
                    let matchingDigits = 0
                    
                    for (let i = 0; i < Math.min(theoryStr.length, measuredStr.length); i++) {
                      if (theoryStr[i] === measuredStr[i]) {
                        if (theoryStr[i] >= '0' && theoryStr[i] <= '9') matchingDigits++
                      } else break
                    }
                    
                    return matchingDigits
                  })()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Matching Digits</div>
              </div>
            </div>
          </div>
        )}

        {/* Formula Display */}
        {constant.formula && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Mathematical Formula</h3>
            <div className="formula-display-large p-6 text-center">
              <KaTeXFormula formula={constant.formula} block />
            </div>
          </div>
        )}
      </div>

      {/* Code Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === tab.id
                      ? "text-primary border-primary bg-muted/30"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'json' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">JSON Source</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(jsonSource, null, 2))}
                  className="btn btn-secondary text-xs"
                >
                  {copiedCode ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  Copy
                </button>
              </div>
              {jsonSource ? (
                <Highlight
                  theme={themes.vsDark}
                  code={JSON.stringify(jsonSource, null, 2)}
                  language="json"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={cn(className, "p-4 rounded-lg overflow-auto text-sm")} style={style}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              ) : (
                <p className="text-muted-foreground">Loading JSON source...</p>
              )}
            </div>
          )}

          {activeTab === 'python' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Python Notebook Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadPythonCode(extractPythonCode(notebookContent), `${id}.py`)}
                    className="btn btn-secondary text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download .py
                  </button>
                  <button
                    onClick={() => downloadNotebook(notebookContent, `${id}.ipynb`)}
                    className="btn btn-secondary text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download .ipynb
                  </button>
                  <button
                    onClick={() => copyToClipboard(extractPythonCode(notebookContent))}
                    className="btn btn-secondary text-xs"
                  >
                    {copiedCode ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    Copy
                  </button>
                </div>
              </div>
              {notebookContent ? (
                <Highlight
                  theme={themes.vsDark}
                  code={extractPythonCode(notebookContent)}
                  language="python"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={cn(className, "p-4 rounded-lg overflow-auto text-sm")} style={style}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="select-none text-muted-foreground mr-4">{i + 1}</span>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              ) : (
                <p className="text-muted-foreground">Loading notebook...</p>
              )}
            </div>
          )}

          {activeTab === 'executed' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Executed Notebook with Output</h3>
                {executedNotebook && (
                  <button
                    onClick={() => downloadNotebook(executedNotebook, `${id}_executed.ipynb`)}
                    className="btn btn-secondary text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download Executed
                  </button>
                )}
              </div>
              {executedNotebook ? (
                <div className="space-y-4">
                  {extractPythonWithOutput(executedNotebook).map((cell, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {cell.type === 'code' ? (
                        <>
                          <div className="bg-muted/30 px-4 py-2 text-xs font-mono text-muted-foreground">
                            In [{index + 1}]:
                          </div>
                          <Highlight
                            theme={themes.vsDark}
                            code={cell.source}
                            language="python"
                          >
                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                              <pre className={cn(className, "p-4 text-sm")} style={style}>
                                {tokens.map((line, i) => (
                                  <div key={i} {...getLineProps({ line })}>
                                    {line.map((token, key) => (
                                      <span key={key} {...getTokenProps({ token })} />
                                    ))}
                                  </div>
                                ))}
                              </pre>
                            )}
                          </Highlight>
                          {cell.outputs.length > 0 && (
                            <div className="border-t">
                              {cell.outputs.map((output, outputIndex) => (
                                <div key={outputIndex} className="px-4 py-2">
                                  <div className="text-xs font-mono text-muted-foreground mb-1">
                                    Out[{index + 1}]:
                                  </div>
                                  <pre className={cn(
                                    "text-sm font-mono whitespace-pre-wrap",
                                    output.type === 'error' && "text-destructive"
                                  )}>
                                    {output.text}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
                          {cell.source}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No executed notebook available. Click "Calculate" to generate one.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sources */}
      {constant.sources && constant.sources.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Measurement Sources</h2>
          <div className="space-y-3">
            {constant.sources.map((source, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{source.name}</p>
                    {source.description && (
                      <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                    )}
                    <p className="text-sm font-mono mt-2">
                      Value: {formatValue(source.value, constant.unit)}
                    </p>
                    {source.uncertainty && (
                      <p className="text-sm text-muted-foreground">
                        Uncertainty: ±{source.uncertainty}
                      </p>
                    )}
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConstantDetailPage