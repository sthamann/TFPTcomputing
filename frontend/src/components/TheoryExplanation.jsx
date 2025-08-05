import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KaTeXFormula from './KaTeXFormula'
import { ChevronRight, Activity, Circle, Hexagon } from 'lucide-react'

const TheoryExplanation = () => {
  const [activeSection, setActiveSection] = useState(0)
  
  // Auto-advance through sections
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const mechanisms = [
    {
      id: 'loop',
      symbol: '4D-Loop',
      name: 'One-Loop Renormalization',
      description: 'Ordinary one-loop renormalization in 4 dimensions',
      formula: '1 - \\frac{1}{4\\pi} = 1 - 2c_3',
      value: '0.9204',
      color: 'from-blue-500 to-blue-600',
      icon: <Circle className="w-6 h-6" />,
      diagram: (
        <svg viewBox="0 0 200 100" className="w-full h-20">
          <motion.circle
            cx="50" cy="50" r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M 80 50 Q 120 20, 150 50 T 200 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
          />
        </svg>
      )
    },
    {
      id: 'kk',
      symbol: 'KK-Geometry',
      name: 'Kaluza-Klein Shell',
      description: 'First Kaluza-Klein shell on S¹',
      formula: '1 - \\frac{1}{2\\pi} = 1 - 4c_3',
      value: '0.8410',
      color: 'from-purple-500 to-purple-600',
      icon: <Hexagon className="w-6 h-6" />,
      diagram: (
        <svg viewBox="0 0 200 100" className="w-full h-20">
          <motion.ellipse
            cx="100" cy="50" rx="80" ry="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.ellipse
            cx="100" cy="50" rx="60" ry="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3,3"
            initial={{ scale: 1.2, opacity: 0.3 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      )
    },
    {
      id: 'vev',
      symbol: 'VEV-Backreaction',
      name: 'Radion Self-Coupling',
      description: 'Self-coupling or level mixing of the radion',
      formula: '1 \\pm k\\varphi_0',
      value: 'k = 1, 2',
      color: 'from-emerald-500 to-emerald-600',
      icon: <Activity className="w-6 h-6" />,
      diagram: (
        <svg viewBox="0 0 200 100" className="w-full h-20">
          <motion.path
            d="M 20 50 Q 50 20, 80 50 T 140 50 T 180 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ d: "M 20 50 Q 50 50, 80 50 T 140 50 T 180 50" }}
            animate={{ d: "M 20 50 Q 50 20, 80 50 T 140 80 T 180 50" }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.circle
            cx="100" cy="50" r="5"
            fill="currentColor"
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      )
    }
  ]

  const correctionExamples = [
    { observable: '\\Omega_b', tree: '\\varphi_0 = 0.053171', factor: '(1-2c_3) \\rightarrow 0.04894', measured: '0.04897', deviation: '-0.06', type: '4D-Loop' },
    { observable: 'm_\\mu \\text{ (MeV)}', tree: '\\frac{v}{\\sqrt{2}}\\varphi_0^{2.5} = 113.50', factor: '(1-2c_3) \\rightarrow 104.47', measured: '105.66', deviation: '-1.1', type: '4D-Loop' },
    { observable: 'm_b \\text{ (GeV)}', tree: 'M_{\\text{Pl}}\\varphi_0^{15}/\\sqrt{c_3} = 4.698', factor: '(1-2\\varphi_0) \\rightarrow 4.199', measured: '4.180', deviation: '+0.44', type: 'VEV-Backreaction' },
    { observable: 'm_u \\text{ (MeV)}', tree: 'M_{\\text{Pl}}\\varphi_0^{17} = 2.649', factor: '(1-4c_3) \\rightarrow 2.228', measured: '2.160', deviation: '+3.1', type: 'KK-Geometry' },
    { observable: '\\epsilon_K', tree: '\\varphi_0^2/2 = 1.414 \\times 10^{-3}', factor: '(1+2\\varphi_0) \\rightarrow 1.56 \\times 10^{-3}', measured: '2.23 \\times 10^{-3}', deviation: '-30', type: 'needs more' }
  ]

  return (
    <div className="mb-16">
      {/* Main Theory Section */}
      <div className="theory-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative z-10"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Topological Fixed Point Theory
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            All mysterious correction factors reduce to just three fundamental mechanisms
          </p>
        </motion.div>

        {/* Animated Flow Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 relative z-10">
          {mechanisms.map((mech, index) => (
            <motion.div
              key={mech.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              onClick={() => setActiveSection(index)}
              className={`mechanism-card card p-6 cursor-pointer transition-all ${
                activeSection === index ? 'ring-2 ring-primary shadow-xl' : ''
              }`}
            >
              <div className={`flex items-center gap-3 mb-4`}>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${mech.color} text-white`}>
                  {mech.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{mech.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{mech.name}</p>
                </div>
              </div>
              
              {/* Animated Diagram */}
              <div className="mb-4 h-20 flex items-center justify-center">
                {mech.diagram}
              </div>

              <div className="space-y-3">
                <p className="text-sm">{mech.description}</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <KaTeXFormula 
                    formula={mech.formula} 
                    displayMode={true}
                    className="text-sm"
                  />
                  <p className="text-center font-mono text-lg font-bold mt-2">{mech.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Central Flow Animation */}
        <div className="relative h-32 mb-12 z-10">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 100">
            {/* Connecting Lines */}
            <motion.path
              d="M 100 50 L 400 50 L 700 50"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flow-line text-muted-foreground/50"
            />
            
            {/* Central Node */}
            <motion.circle
              cx="400" cy="50" r="30"
              className="fill-primary/20 stroke-primary"
              strokeWidth="2"
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <text x="400" y="55" textAnchor="middle" className="fill-primary font-bold">
              c₃, φ₀
            </text>

            {/* Input/Output Arrows */}
            <motion.path
              d="M 50 50 L 100 50 M 700 50 L 750 50"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="text-accent"
            />
            
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-accent" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Correction Examples Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card overflow-hidden relative z-10"
        >
          <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <h3 className="text-2xl font-bold mb-2">Five Concrete Constants – Tree vs. Correction</h3>
            <p className="text-muted-foreground">
              See how the three universal factors bring tree-level predictions in line with measurements
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">Observable</th>
                  <th className="px-4 py-3 text-left">Tree-Level</th>
                  <th className="px-4 py-3 text-left">+ Factor</th>
                  <th className="px-4 py-3 text-center">Measured</th>
                  <th className="px-4 py-3 text-center">Dev %</th>
                  <th className="px-4 py-3 text-center">Factor Type</th>
                </tr>
              </thead>
              <tbody>
                {correctionExamples.map((example, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <KaTeXFormula formula={example.observable} />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      <KaTeXFormula formula={example.tree} />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      <KaTeXFormula formula={example.factor} />
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{example.measured}</td>
                    <td className={`px-4 py-3 text-center font-bold ${
                      Math.abs(parseFloat(example.deviation)) < 3 ? 'text-green-500' : 
                      Math.abs(parseFloat(example.deviation)) < 10 ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {example.deviation}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        example.type === '4D-Loop' ? 'bg-blue-500/20 text-blue-400' :
                        example.type === 'KK-Geometry' ? 'bg-purple-500/20 text-purple-400' :
                        example.type === 'VEV-Backreaction' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {example.type}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border relative z-10"
        >
          <p className="text-center text-lg">
            <span className="font-semibold">Key insight:</span> A handful of fixed numbers (c₃, φ₀) plus small integers k 
            suffice to obtain next-to-leading-order corrections <span className="font-bold text-primary">parameter-free</span>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default TheoryExplanation