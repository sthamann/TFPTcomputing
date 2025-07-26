import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { dagApi } from '../lib/api'
import { Network, DataSet } from 'vis-network'
import 'vis-network/styles/vis-network.css'
import { Loader2, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import toast from 'react-hot-toast'

const DAGPage = () => {
  const [dagData, setDagData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const networkRef = useRef(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadDAG()
  }, [])

  const loadDAG = async () => {
    try {
      setLoading(true)
      const data = await dagApi.get()
      setDagData(data)
      
      if (!data.is_acyclic) {
        toast.warning('Warning: The dependency graph contains cycles!')
      }
    } catch (error) {
      console.error('Error loading DAG:', error)
      toast.error('Failed to load dependency graph')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dagData && containerRef.current) {
      const nodeArray = dagData.nodes.map(node => {
        // Format values for display
        const theoryStr = node.theory_value ? node.theory_value.toFixed(6) : 'Not calculated'
        const measuredStr = node.measured_value ? node.measured_value.toFixed(6) : 'N/A'
        const accuracyStr = node.accuracy ? `${node.accuracy.toFixed(2)}%` : 'N/A'
        
        // Create multi-line label
        const label = `${node.symbol || node.id}\n${node.name}\n\nTheory: ${theoryStr}\nMeasured: ${measuredStr}\nAccuracy: ${accuracyStr}`
        
        // Create detailed tooltip
        const tooltip = `<div style="padding: 10px; text-align: left;">
          <strong>${node.name}</strong><br/>
          <strong>Symbol:</strong> ${node.symbol}<br/>
          <strong>Unit:</strong> ${node.unit || 'dimensionless'}<br/>
          <br/>
          <strong>Theory Value:</strong> ${theoryStr}<br/>
          <strong>Measured Value:</strong> ${measuredStr}<br/>
          <strong>Accuracy:</strong> ${accuracyStr}<br/>
          <br/>
          <strong>Formula:</strong> ${node.formula || 'N/A'}
        </div>`
        
        return {
          id: node.id,
          label: label,
          title: tooltip,
          group: node.category
        }
      })

      const edgeArray = dagData.edges.map((edge, index) => ({
        id: `edge-${index}`,
        from: edge.source,
        to: edge.target,
        arrows: 'to',
        smooth: {
          type: 'cubicBezier'
        }
      }))

      // Create DataSets
      const nodes = new DataSet(nodeArray)
      const edges = new DataSet(edgeArray)

      // Remove the TEST node line
      // nodes.add({ id: 'test-node', label: 'TEST LABEL', x: 0, y: 0 })

      // Debug log to check node data
      console.log('DAG Nodes:', nodeArray)
      console.log('Sample node:', nodeArray[0])
      console.log('Nodes DataSet:', nodes.get())

      const data = { nodes, edges }

      const options = {
        nodes: {
          shape: 'box',
          font: {
            color: '#000000',
            size: 14,
            face: 'Arial',
            multi: true,
            align: 'center'
          },
          borderWidth: 2,
          margin: 10,
          widthConstraint: {
            minimum: 150,
            maximum: 250
          }
        },
        edges: {
          color: '#848484',
          width: 2
        },
        groups: {
          fundamental: {
            color: { background: '#e3f2fd', border: '#1976d2' }
          },
          derived: {
            color: { background: '#f5f5f5', border: '#757575' }
          },
          composite: {
            color: { background: '#fff3e0', border: '#f57c00' }
          },
          dark_sector: {
            color: { background: '#fce4ec', border: '#c2185b' }
          }
        },
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based'
        },
        layout: {
          improvedLayout: true
        },
        interaction: {
          hover: true,
          tooltipDelay: 200
        }
      }

      const network = new Network(containerRef.current, data, options)
      networkRef.current = network

      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          setSelectedNode(dagData.nodes.find(n => n.id === nodeId))
        } else {
          setSelectedNode(null)
        }
      })

      network.on('doubleClick', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          navigate(`/constants/${nodeId}`)
        }
      })

      return () => {
        network.destroy()
      }
    }
  }, [dagData, navigate])

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale()
      networkRef.current.moveTo({ scale: scale * 1.2 })
    }
  }

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale()
      networkRef.current.moveTo({ scale: scale / 1.2 })
    }
  }

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dependency Graph</h1>
        <p className="text-muted-foreground mt-2">
          Visualize the relationships between physics constants
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-secondary px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                {dagData?.is_acyclic ? 'DAG (Acyclic)' : 'Graph (Contains Cycles)'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-background/50 rounded"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-background/50 rounded"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleFit}
                  className="p-1 hover:bg-background/50 rounded"
                  title="Fit to view"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div 
              ref={containerRef} 
              className="h-[600px] bg-background"
              style={{ cursor: 'grab', backgroundColor: '#f0f0f0', minHeight: '600px' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Legend */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary" />
                <span>Fundamental</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary border-2 border-border" />
                <span>Derived</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent border-2 border-border" />
                <span>Composite</span>
              </div>
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Selected Node</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedNode.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Symbol</p>
                  <p className="font-mono text-lg">{selectedNode.symbol}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="capitalize">{selectedNode.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit</p>
                  <p>{selectedNode.unit || 'dimensionless'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Theory Value</p>
                  <p className="font-mono">
                    {selectedNode.theory_value ? selectedNode.theory_value.toFixed(6) : 'Not calculated'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Measured Value</p>
                  <p className="font-mono">
                    {selectedNode.measured_value ? selectedNode.measured_value.toFixed(6) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Accuracy</p>
                  <p className={`font-medium ${
                    selectedNode.accuracy && selectedNode.accuracy > 99 
                      ? 'text-green-600' 
                      : selectedNode.accuracy && selectedNode.accuracy > 95 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {selectedNode.accuracy ? `${selectedNode.accuracy.toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/constants/${selectedNode.id}`)}
                  className="w-full mt-4 px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Instructions</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Click a node to select it</li>
              <li>• Double-click to view details</li>
              <li>• Drag to pan the graph</li>
              <li>• Scroll to zoom in/out</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DAGPage 