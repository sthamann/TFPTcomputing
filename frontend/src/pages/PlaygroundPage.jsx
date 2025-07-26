import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { playgroundApi } from '../lib/api'
import KaTeXFormula from '../components/KaTeXFormula'
import { Play, Loader2, Settings, Code } from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const defaultFormula = `(pi * phi_0**3) / (2 * acos(phi_0 / 2))`

const defaultParameters = {
  phi_0: 0.9045568943023813,
  phi: 1.6180339887498948,
  c_3: 1.0,
}

const PlaygroundPage = () => {
  const [formula, setFormula] = useState(defaultFormula)
  const [parameters, setParameters] = useState(defaultParameters)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(true)

  const handleRun = async () => {
    try {
      setRunning(true)
      const response = await playgroundApi.run(formula, parameters)
      setResult(response)
      toast.success('Formula evaluated successfully')
    } catch (error) {
      console.error('Error running formula:', error)
      toast.error(error.response?.data?.error || 'Failed to evaluate formula')
    } finally {
      setRunning(false)
    }
  }

  const handleParameterChange = (name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }))
  }

  const addParameter = () => {
    const name = prompt('Enter parameter name:')
    if (name && !parameters[name]) {
      setParameters(prev => ({
        ...prev,
        [name]: 1.0
      }))
    }
  }

  const removeParameter = (name) => {
    setParameters(prev => {
      const newParams = { ...prev }
      delete newParams[name]
      return newParams
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Formula Playground</h1>
        <p className="text-muted-foreground mt-2">
          Experiment with formulas and parameters in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-secondary px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Formula Editor</span>
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  running && "opacity-50 cursor-not-allowed"
                )}
              >
                {running ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Run
              </button>
            </div>
            <div className="h-64">
              <Editor
                defaultLanguage="python"
                value={formula}
                onChange={(value) => setFormula(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          {/* Parameters Section */}
          <div className="border rounded-lg">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Parameters</span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {showSettings ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showSettings && (
              <div className="p-4 space-y-4">
                {Object.entries(parameters).map(([name, value]) => (
                  <div key={name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{name}</label>
                      <button
                        onClick={() => removeParameter(name)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.0001"
                        value={value}
                        onChange={(e) => handleParameterChange(name, e.target.value)}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleParameterChange(name, e.target.value)}
                        className="w-24 px-2 py-1 text-sm border rounded"
                        step="0.0001"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addParameter}
                  className="w-full py-2 border border-dashed rounded text-sm text-muted-foreground hover:text-foreground hover:border-foreground"
                >
                  + Add Parameter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-4">
          {result && (
            <>
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Result</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Calculated Value</p>
                    <p className="text-3xl font-bold text-primary">
                      {result.result}
                    </p>
                    {result.unit !== 'dimensionless' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.unit}
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">LaTeX Formula</p>
                    <div className="bg-muted rounded p-4">
                      <KaTeXFormula formula={result.latex} block />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Parameters Used</h3>
                <div className="space-y-2">
                  {Object.entries(result.parameters).map(([name, value]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!result && (
            <div className="border rounded-lg p-12 text-center">
              <p className="text-muted-foreground">
                Enter a formula and click Run to see results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Examples Section */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Example Formulas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setFormula(`(pi * phi_0**3) / (2 * acos(phi_0 / 2))`)}
            className="text-left p-4 border rounded hover:border-primary transition-colors"
          >
            <p className="font-medium">Fine Structure Constant</p>
            <p className="text-sm text-muted-foreground mt-1">α calculation</p>
          </button>
          <button
            onClick={() => setFormula(`sqrt(1 + sqrt(5)) / 2`)}
            className="text-left p-4 border rounded hover:border-primary transition-colors"
          >
            <p className="font-medium">Golden Ratio</p>
            <p className="text-sm text-muted-foreground mt-1">φ calculation</p>
          </button>
          <button
            onClick={() => setFormula(`exp(-1 / (2 * alpha))`)}
            className="text-left p-4 border rounded hover:border-primary transition-colors"
          >
            <p className="font-medium">Exponential Form</p>
            <p className="text-sm text-muted-foreground mt-1">e^(-1/2α)</p>
          </button>
          <button
            onClick={() => setFormula(`sin(phi_0) * cos(phi_0) * pi`)}
            className="text-left p-4 border rounded hover:border-primary transition-colors"
          >
            <p className="font-medium">Trigonometric</p>
            <p className="text-sm text-muted-foreground mt-1">sin(φ₀)cos(φ₀)π</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaygroundPage 