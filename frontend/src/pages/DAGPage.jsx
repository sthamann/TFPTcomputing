import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { dagApi } from '../lib/api'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'
import { Loader2, ZoomIn, ZoomOut, Maximize, GitBranch, Network as NetworkIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const DAGPage = () => {
  const [dagData, setDagData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hierarchicalLayout, setHierarchicalLayout] = useState(true)
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
        toast('Warning: The dependency graph contains cycles!', {
          icon: '⚠️',
          style: {
            background: '#fbbf24',
            color: '#000',
          },
        })
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
        const theoryStr = node.theory_value ? node.theory_value.toExponential(3) : 'Not calculated'
        const measuredStr = node.measured_value ? node.measured_value.toExponential(3) : 'N/A'
        const accuracyStr = node.accuracy ? `${node.accuracy.toFixed(2)}%` : 'N/A'
        
        // Create compact label for better readability
        const label = `${node.symbol || node.id}\n${node.name}`
        
        // Determine if this is a root node (no dependencies)
        const isRoot = !dagData.edges.some(edge => edge.target === node.id)
        
        // Create detailed tooltip (plain text for vis-network)
        const tooltip = `${node.name}
Symbol: ${node.symbol}
Unit: ${node.unit || 'dimensionless'}

Theory: ${theoryStr}
Measured: ${measuredStr}
Accuracy: ${accuracyStr}

Formula: ${node.formula || 'N/A'}${isRoot ? '\n\nRoot Node (No Dependencies)' : ''}`
        
        return {
          id: node.id,
          label: label,
          title: tooltip,
          group: node.category
          // Let vis-network calculate levels automatically
        }
      })

      const edgeArray = dagData.edges.map((edge, index) => ({
        id: `edge-${index}`,
        from: edge.source,
        to: edge.target,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5,
            type: 'arrow'
          }
        },
        smooth: {
          type: 'cubicBezier',
          roundness: 0.5
        },
        color: {
          color: 'rgba(107, 114, 128, 0.6)',  // Semi-transparent gray
          highlight: '#4f46e5',
          hover: '#4f46e5',
          opacity: 0.8
        },
        width: 1.5,
        hoverWidth: 2.5,
        selectionWidth: 0  // Don't change width when selected
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
            color: '#e1e1e6',
            size: 14,
            face: 'Inter, system-ui, sans-serif',
            multi: true,
            align: 'center',
            bold: {
              color: '#ffffff',
              size: 16
            },
            vadjust: -5  // Adjust vertical position of text
          },
          borderWidth: 2,
          borderWidthSelected: 3,
          margin: {
            top: 10,
            bottom: 10,
            left: 15,
            right: 15
          },
          widthConstraint: {
            minimum: 180,
            maximum: 280
          },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.5)',
            size: 10,
            x: 2,
            y: 2
          },
          chosen: {
            node: function(values, id, selected, hovering) {
              if (selected) {
                values.borderColor = '#4f46e5';
                values.borderWidth = 3;
              }
            }
          }
        },
        edges: {
          color: { inherit: false },
          width: 2,
          selectionWidth: 3
        },
        groups: {
          fundamental: {
            color: { 
              background: '#4f46e5', 
              border: '#6366f1',
              highlight: {
                background: '#6366f1',
                border: '#818cf8'
              }
            },
            font: { color: '#ffffff' }
          },
          derived: {
            color: { 
              background: '#374151', 
              border: '#4b5563',
              highlight: {
                background: '#4b5563',
                border: '#6b7280'
              }
            },
            font: { color: '#e5e7eb' }
          },
          composite: {
            color: { 
              background: '#10b981', 
              border: '#34d399',
              highlight: {
                background: '#34d399',
                border: '#6ee7b7'
              }
            },
            font: { color: '#ffffff' }
          },
          dark_sector: {
            color: { 
              background: '#8b5cf6', 
              border: '#a78bfa',
              highlight: {
                background: '#a78bfa',
                border: '#c4b5fd'
              }
            },
            font: { color: '#ffffff' }
          }
        },
        physics: hierarchicalLayout ? {
          enabled: false
        } : {
          enabled: true,
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 300,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 1
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50,
            fit: true
          },
          minVelocity: 0.75,
          maxVelocity: 30
        },
        layout: hierarchicalLayout ? {
          hierarchical: {
            enabled: true,
            direction: 'UD',  // Up-Down direction
            sortMethod: 'directed',  // Use directed edges to determine hierarchy
            shakeTowards: 'roots',  // Shake towards root nodes
            levelSeparation: 300,  // Distance between levels (increased from 200)
            nodeSpacing: 250,  // Minimum distance between nodes on the same level (increased from 100)
            treeSpacing: 400,  // Distance between different trees (increased from 200)
            blockShifting: true,  // Shift blocks to compact the layout
            edgeMinimization: true,  // Minimize edge crossings
            parentCentralization: true  // Center parents over children
          }
        } : {
          improvedLayout: true
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          zoomView: true,
          dragView: true,
          navigationButtons: false
        }
      }

      const network = new Network(containerRef.current, data, options)
      networkRef.current = network

      // Fit the network to the viewport after stabilization
      network.once('stabilizationIterationsDone', function () {
        network.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        })
      })

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
  }, [dagData, navigate, hierarchicalLayout])

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
    <div className="min-h-screen animate-slide-in">
      {/* Hero Section */}
      <div className="hero-section relative mb-8">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Dependency Graph</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Visualize the relationships between physics constants
          </p>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="card p-0 overflow-hidden">
            <div className="bg-secondary px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                {dagData?.is_acyclic ? 'DAG (Acyclic)' : 'Graph (Contains Cycles)'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHierarchicalLayout(!hierarchicalLayout)}
                  className={cn(
                    "p-1 rounded transition-colors",
                    hierarchicalLayout 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "hover:bg-background/50"
                  )}
                  title={hierarchicalLayout ? "Switch to Force Layout" : "Switch to Hierarchical Layout"}
                >
                  {hierarchicalLayout ? <GitBranch className="h-4 w-4" /> : <NetworkIcon className="h-4 w-4" />}
                </button>
                <div className="w-px h-4 bg-border" />
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
              className="h-[800px] bg-card relative"
              style={{ cursor: 'grab', minHeight: '800px' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Legend */}
          <div className="card">
            <h3 className="font-semibold mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4f46e5', border: '2px solid #6366f1' }} />
                <span>Fundamental</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#374151', border: '2px solid #4b5563' }} />
                <span>Derived</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981', border: '2px solid #34d399' }} />
                <span>Composite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6', border: '2px solid #a78bfa' }} />
                <span>Dark Sector</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card">
            <h3 className="font-semibold mb-3">Instructions</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Click a node to select it</p>
              <p>• Double-click to view details</p>
              <p>• Drag to pan the graph</p>
              <p>• Scroll to zoom in/out</p>
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="card">
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
                  className="btn btn-primary w-full mt-4 text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          )}


          </div>
        </div>
      </div>
    </div>
  )
}

export default DAGPage 