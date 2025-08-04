import { useEffect, useRef } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'

const TestVisNetwork = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // Create simple test data
      const nodes = new DataSet([
        { id: 1, label: 'Node 1' },
        { id: 2, label: 'Node 2' },
        { id: 3, label: 'Node 3' },
        { id: 4, label: 'Node 4' }
      ])

      const edges = new DataSet([
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 }
      ])

      const data = { nodes, edges }

      const options = {
        nodes: {
          shape: 'box',
          font: {
            color: '#000000',
            size: 20
          }
        }
      }

      const network = new Network(containerRef.current, data, options)
      
      console.log('Test network created')
      console.log('Container:', containerRef.current)
      console.log('Network:', network)

      return () => {
        network.destroy()
      }
    }
  }, [])

  return (
    <div>
      <h1>Vis-Network Test</h1>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '400px', 
          border: '1px solid black',
          backgroundColor: '#ffffff'
        }} 
      />
    </div>
  )
}

export default TestVisNetwork 