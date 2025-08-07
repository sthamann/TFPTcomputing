import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  Loader2, Sparkles, Zap, Atom, Star, Globe, 
  ChevronDown, Play, Pause, Volume2, VolumeX,
  ArrowDown
} from 'lucide-react'
import KaTeXFormula from '../components/KaTeXFormula'
import CosmicBackground3D from '../components/CosmicBackground3D'
import EpochVisualization from '../components/EpochVisualizations'

// Particle effect component
const ParticleField = ({ intensity = 100 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(intensity)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-50"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  )
}

// Cosmic background gradient
const CosmicBackground = ({ epoch }) => {
  const gradients = {
    planck: 'from-yellow-900 via-orange-900 to-red-900',
    gut: 'from-purple-900 via-indigo-900 to-blue-900',
    inflation: 'from-blue-900 via-cyan-900 to-teal-900',
    reheating: 'from-pink-900 via-purple-900 to-indigo-900',
    electroweak: 'from-green-900 via-emerald-900 to-cyan-900',
    qcd: 'from-red-900 via-orange-900 to-amber-900',
    hadron: 'from-orange-800 via-red-800 to-pink-800',
    lepton: 'from-blue-800 via-indigo-800 to-purple-800',
    recombination: 'from-indigo-900 via-blue-900 to-black',
    darkenergy: 'from-black via-purple-950 to-black',
    present: 'from-black via-gray-900 to-black'
  }
  
  return (
    <motion.div 
      className={`absolute inset-0 bg-gradient-to-b ${gradients[epoch] || gradients.present} opacity-50`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ duration: 2 }}
    />
  )
}

const UniverseBirthPage = () => {
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef(null)
  
  // Universe epochs with cinematic descriptions
  const universeStory = [
    {
      n: 0,
      id: 'planck',
      title: 'The Planck Era',
      subtitle: 'The Birth of Space and Time',
      time: '10⁻⁴³ seconds',
      temperature: '10³² K',
      energy: '10¹⁹ GeV',
      scale: 'φ₀ = 5.3 × 10⁻²',
      description: 'In the beginning, there was nothing but quantum foam. Space and time themselves are born from the void. At this incomprehensible temperature, all forces are unified into a single primordial force. The universe is smaller than a Planck length, where the very concepts of distance and duration lose meaning.',
      physics: 'Quantum gravity dominates. The fundamental constants c₃ and φ₀ emerge from the topological structure of spacetime itself.',
      constants: ['c₃', 'φ₀', 'M_Planck'],
      color: 'rgb(251, 191, 36)',
      icon: '🌟'
    },
    {
      n: 1,
      id: 'gut',
      title: 'Grand Unification',
      subtitle: 'The First Symmetry Breaking',
      time: '10⁻³⁶ seconds',
      temperature: '10²⁸ K',
      energy: '10¹⁶ GeV',
      scale: 'φ₁ = 2.3 × 10⁻²',
      description: 'The strong nuclear force separates from the electroweak force in the first great symmetry breaking. This cosmic phase transition releases enormous energy, setting the stage for inflation. Neutrino mixing angles are determined, establishing the blueprint for matter\'s future evolution.',
      physics: 'GUT symmetry breaks. The universe prepares for its greatest expansion.',
      constants: ['Neutrino mixing angles', 'θ₁₂', 'θ₂₃', 'θ₁₃'],
      color: 'rgb(147, 51, 234)',
      icon: '⚛️'
    },
    {
      n: 2,
      id: 'inflation',
      title: 'Cosmic Inflation',
      subtitle: 'The Universe Explodes',
      time: '10⁻³⁵ to 10⁻³² seconds',
      temperature: '10²⁷ K',
      energy: '10¹⁵ GeV',
      scale: 'φ₂ = 1.2 × 10⁻²',
      description: 'Space itself expands faster than light, growing by a factor of 10²⁶ in a fraction of a second. Quantum fluctuations are stretched to cosmic scales, seeding the future structure of galaxies. The universe becomes smooth and flat, solving the horizon and flatness problems.',
      physics: 'Exponential expansion driven by vacuum energy. Quantum fluctuations become classical.',
      constants: [],
      color: 'rgb(59, 130, 246)',
      icon: '💫'
    },
    {
      n: 3,
      id: 'reheating',
      title: 'Reheating',
      subtitle: 'Matter is Born',
      time: '10⁻³² seconds',
      temperature: '10²⁵ K',
      energy: '10¹³ GeV',
      scale: 'φ₃ = 3.0 × 10⁻³',
      description: 'Inflation ends catastrophically, dumping its energy into a hot soup of particles. The universe reheats, creating matter and antimatter in nearly equal amounts. Neutrino masses are set, determining the lightest massive particles that will pervade the cosmos.',
      physics: 'Particle production from vacuum decay. The cosmic neutrino background forms.',
      constants: ['m_ν', 'Δm²₂₁', 'Δm²₃₂'],
      color: 'rgb(168, 85, 247)',
      icon: '🔥'
    },
    {
      n: 5,
      id: 'electroweak',
      title: 'Electroweak Era',
      subtitle: 'Forces Divide',
      time: '10⁻¹⁰ seconds',
      temperature: '10¹⁵ K',
      energy: '100 GeV',
      scale: 'φ₅ = 2.0 × 10⁻⁴',
      description: 'The electromagnetic and weak forces are still unified. Electrons gain their mass, establishing the scale for atomic physics. The fine structure constant α is born, determining the strength of electromagnetic interactions for all time.',
      physics: 'Electromagnetic and weak forces unified. Quantum electrodynamics takes shape.',
      constants: ['m_e', 'α', 'y_e'],
      color: 'rgb(34, 197, 94)',
      icon: '⚡'
    },
    {
      n: 12,
      id: 'ewsb',
      title: 'Electroweak Symmetry Breaking',
      subtitle: 'The Higgs Mechanism',
      time: '10⁻¹² seconds',
      temperature: '10¹⁵ K',
      energy: '246 GeV',
      scale: 'φ₁₂ = 9.5 × 10⁻¹²',
      description: 'The Higgs field condenses throughout space, giving mass to the W and Z bosons. This breaks the electroweak symmetry, separating electromagnetism from the weak force forever. The vacuum expectation value v_H sets the scale for all massive particles.',
      physics: 'The Higgs mechanism gives particles their mass. The Standard Model is complete.',
      constants: ['v_H', 'M_W', 'M_Z', 'm_H'],
      color: 'rgb(59, 130, 246)',
      icon: '🎯'
    },
    {
      n: 15,
      id: 'qcd',
      title: 'QCD Phase Transition',
      subtitle: 'Quarks Confined',
      time: '10⁻⁶ seconds',
      temperature: '10¹³ K',
      energy: '200 MeV',
      scale: 'φ₁₅ = 5.5 × 10⁻¹⁷',
      description: 'The universe cools below the QCD scale. Free quarks and gluons condense into protons and neutrons. The strong force becomes confining, trapping quarks forever inside hadrons. The proton mass emerges from the dynamics of quantum chromodynamics.',
      physics: 'Quark confinement. Hadrons form from the quark-gluon plasma.',
      constants: ['m_p', 'm_n', 'Λ_QCD'],
      color: 'rgb(239, 68, 68)',
      icon: '🔴'
    },
    {
      n: 20,
      id: 'lepton',
      title: 'Lepton Era',
      subtitle: 'Matter Dominates',
      time: '1 second',
      temperature: '10¹⁰ K',
      energy: '1 MeV',
      scale: 'φ₂₀ = 2.0 × 10⁻²⁹',
      description: 'Neutrinos decouple from matter, streaming freely through space. Electrons and positrons annihilate, leaving a slight excess of electrons. The cosmic ray knee energy is set, determining the highest energy particles the universe will naturally produce.',
      physics: 'Neutrino decoupling. Electron-positron annihilation.',
      constants: ['E_knee'],
      color: 'rgb(14, 165, 233)',
      icon: '✨'
    },
    {
      n: 25,
      id: 'recombination',
      title: 'Recombination',
      subtitle: 'First Light',
      time: '380,000 years',
      temperature: '3,000 K',
      energy: '0.3 eV',
      scale: 'φ₂₅ = 1.8 × 10⁻⁴⁷',
      description: 'The universe becomes transparent for the first time. Electrons combine with nuclei to form the first atoms. The cosmic microwave background is released, carrying a snapshot of the universe at this moment that we still observe today.',
      physics: 'Atoms form. The CMB is released. The universe becomes transparent.',
      constants: ['T_γ₀', 'T_ν', 'n_s'],
      color: 'rgb(99, 102, 241)',
      icon: '💡'
    },
    {
      n: 30,
      id: 'darkenergy',
      title: 'Dark Energy Domination',
      subtitle: 'Accelerated Expansion',
      time: '9.8 billion years',
      temperature: '2.7 K',
      energy: '10⁻³ eV',
      scale: 'φ₃₀ = 2.8 × 10⁻⁷²',
      description: 'Dark energy begins to dominate the universe\'s energy density. Space itself accelerates its expansion, pushing galaxies apart ever faster. The cosmological constant Λ reveals itself, determining the ultimate fate of the cosmos.',
      physics: 'Accelerated expansion begins. The universe enters its final phase.',
      constants: ['ρ_Λ', 'w₀', 'Ω_Λ'],
      color: 'rgb(124, 58, 237)',
      icon: '🌌'
    },
    {
      n: 35,
      id: 'present',
      title: 'The Present Universe',
      subtitle: 'Here and Now',
      time: '13.8 billion years',
      temperature: '2.725 K',
      energy: '10⁻⁴ eV',
      scale: 'φ₃₅ ≈ 10⁻¹⁰⁰',
      description: 'You are here. In a universe filled with billions of galaxies, on a small planet orbiting an ordinary star. The VEV cascade has run its course, from the Planck scale to the cosmological horizon. Every constant, every force, every particle - all emerged from this mathematical ladder inscribed in the fabric of reality.',
      physics: 'Complex structures, life, and consciousness have emerged.',
      constants: ['H₀', 'Ω_m', 'Ω_b'],
      color: 'rgb(75, 85, 99)',
      icon: '🌍'
    }
  ]
  
  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollHeight = containerRef.current.scrollHeight - window.innerHeight
        const currentScroll = window.scrollY
        const scrollProgress = Math.min(currentScroll / scrollHeight, 1)
        setScrollY(scrollProgress)
        
        const epochIndex = Math.min(
          Math.floor(scrollProgress * universeStory.length),
          universeStory.length - 1
        )
        setCurrentEpoch(epochIndex)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Auto-play through epochs
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      if (currentEpoch < universeStory.length - 1) {
        setCurrentEpoch(prev => prev + 1)
        // Smooth scroll to next epoch
        const nextSection = document.getElementById(`epoch-${universeStory[currentEpoch + 1].id}`)
        nextSection?.scrollIntoView({ behavior: 'smooth' })
      } else {
        setIsPlaying(false)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isPlaying, currentEpoch])
  
  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* WebGL Cosmic background */}
      <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
        <CosmicBackground3D epoch={currentEpoch} />
      </Suspense>
      
      {/* Particle overlay for extra effect */}
      <ParticleField intensity={30} />
      
      {/* Fixed header with controls */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Birth of the Universe
              </h1>
              <p className="text-sm text-gray-400">
                A journey through {universeStory.length} cosmic epochs
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Play/Pause button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Epoch</span>
                <span className="text-xl font-bold text-purple-400">
                  {currentEpoch + 1}/{universeStory.length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              style={{
                width: `${((currentEpoch + 1) / universeStory.length) * 100}%`
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Hero section */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="text-center z-10 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-sm uppercase tracking-wider text-purple-400 mb-4 block">
              The VEV Cascade Story
            </span>
          </motion.div>
          
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              From Nothing
            </span>
          </motion.h1>
          
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              To Everything
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Witness how the universe unfolds through 35 cascade levels,
            each step revealing new physics, new constants, and new possibilities.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="space-y-4"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 max-w-md mx-auto">
              <KaTeXFormula 
                formula="\\phi_{n+1} = \\phi_n \\cdot e^{-\\gamma_n}" 
                className="text-xl"
              />
              <p className="text-sm text-gray-400 mt-2">
                where γₙ = 0.834 + 0.108n + 0.0105n²
              </p>
            </div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="pt-8"
            >
              <p className="text-sm text-gray-400 mb-2">Scroll to begin your journey</p>
              <ArrowDown className="h-6 w-6 mx-auto text-purple-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Timeline sections */}
      <div ref={containerRef} className="relative">
        {universeStory.map((epoch, index) => (
          <section
            key={epoch.id}
            id={`epoch-${epoch.id}`}
            className="min-h-screen flex items-center justify-center relative py-20"
          >
            <AnimatePresence mode="wait">
              {currentEpoch >= index && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 1 }}
                  className="container mx-auto px-4 z-10"
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-7xl mb-4 block">{epoch.icon}</span>
                        <span className="text-sm uppercase tracking-wider text-gray-400">
                          Level n = {epoch.n}
                        </span>
                        <h2 className="text-5xl font-bold mt-2" style={{ color: epoch.color }}>
                          {epoch.title}
                        </h2>
                        <p className="text-2xl text-gray-300 mt-2">{epoch.subtitle}</p>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                          <p className="text-xs text-gray-400">Time</p>
                          <p className="text-lg font-mono">{epoch.time}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                          <p className="text-xs text-gray-400">Temperature</p>
                          <p className="text-lg font-mono">{epoch.temperature}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                          <p className="text-xs text-gray-400">Energy</p>
                          <p className="text-lg font-mono">{epoch.energy}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-4"
                      >
                        <p className="text-lg text-gray-200 leading-relaxed">
                          {epoch.description}
                        </p>
                        
                        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-gray-400 mb-2">Physics:</p>
                          <p className="text-gray-200">{epoch.physics}</p>
                        </div>
                        
                        {epoch.constants.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Constants born:</p>
                            <div className="flex flex-wrap gap-2">
                              {epoch.constants.map(c => (
                                <span
                                  key={c}
                                  className="px-3 py-1 rounded-full text-sm font-mono bg-white/10 backdrop-blur-lg"
                                  style={{ 
                                    borderColor: epoch.color,
                                    borderWidth: '1px',
                                    color: epoch.color
                                  }}
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Right: 3D Visualization */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="relative"
                    >
                      <div className="aspect-square relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                        {/* 3D WebGL Visualization for each epoch */}
                        <Suspense fallback={
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                          </div>
                        }>
                          <EpochVisualization epochId={epoch.id} />
                        </Suspense>
                        
                        {/* Overlay info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="text-center">
                            <p className="text-2xl font-bold" style={{ color: epoch.color }}>
                              n={epoch.n}
                            </p>
                            <p className="text-sm font-mono text-gray-300">{epoch.scale}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* VEV scale indicator */}
                      <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">VEV Scale</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - (epoch.n / 35) * 100}%` }}
                            transition={{ duration: 1, delay: 1 }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {35 - epoch.n} levels until cosmological horizon
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ))}
      </div>
      
      {/* Final summary section */}
      <section className="min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-b from-black to-purple-950">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Sparkles className="h-16 w-16 mx-auto mb-6 text-purple-400" />
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              The Complete Cascade
            </h2>
            
            <p className="text-xl text-gray-300 mb-8">
              From the Planck scale to the cosmological horizon, the VEV cascade creates a 
              logarithmically spaced ladder through cosmic history. Each level—whether producing 
              observable constants or providing structural support—is essential for the universe we observe.
            </p>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-purple-300">The Mathematics of Creation</h3>
              <div className="space-y-4">
                <KaTeXFormula 
                  formula="\\phi_{n+1} = \\phi_n \\cdot e^{-\\gamma_n}" 
                  className="text-xl"
                />
                <KaTeXFormula 
                  formula="\\gamma_n = 0.834 + 0.108n + 0.0105n^2" 
                  className="text-lg text-gray-300"
                />
                <p className="text-sm text-gray-400">
                  This cascade emerges from the nilpotent orbit dimensions of E₈, 
                  encoding the structure of reality in pure mathematics.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-6 border border-blue-500/30"
              >
                <Star className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-300 mb-2">Observable Levels</h4>
                <p className="text-sm text-gray-300">
                  11 cascade levels directly produce measurable physical constants
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg p-6 border border-purple-500/30"
              >
                <Atom className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-300 mb-2">Structural Levels</h4>
                <p className="text-sm text-gray-300">
                  25 "silent" levels maintain the geometric integrity of spacetime
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-6 border border-green-500/30"
              >
                <Globe className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-green-300 mb-2">Universal Pattern</h4>
                <p className="text-sm text-gray-300">
                  One equation governs evolution from quantum to cosmic scales
                </p>
              </motion.div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              Journey Again
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default UniverseBirthPage