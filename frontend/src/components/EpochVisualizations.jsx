import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Torus, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// Planck Era - Quantum Foam
const QuantumFoam = () => {
  const groupRef = useRef()
  const particlesRef = useRef()
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 500; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ],
        size: Math.random() * 0.1
      })
    }
    return temp
  }, [])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
      groupRef.current.rotation.x += 0.0005
    }
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        child.position.x += Math.sin(state.clock.elapsedTime + i) * 0.01
        child.position.y += Math.cos(state.clock.elapsedTime + i) * 0.01
        child.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.5)
      })
    }
  })
  
  return (
    <group ref={groupRef}>
      <group ref={particlesRef}>
        {particles.map((particle, i) => (
          <Sphere key={i} args={[particle.size, 8, 8]} position={particle.position}>
            <meshBasicMaterial color={new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5)} />
          </Sphere>
        ))}
      </group>
    </group>
  )
}

// Inflation - Exponential Expansion
const InflationExpansion = () => {
  const sphereRef = useRef()
  const ringsRef = useRef([])
  
  useFrame((state) => {
    if (sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.5
      sphereRef.current.scale.setScalar(scale)
    }
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x += 0.01 * (i + 1)
        ring.rotation.y += 0.005 * (i + 1)
        ring.scale.setScalar(1 + Math.sin(state.clock.elapsedTime + i) * 0.2)
      }
    })
  })
  
  return (
    <group>
      <Sphere ref={sphereRef} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#4169E1"
          speed={5}
          distort={0.3}
          radius={1}
          emissive="#1E90FF"
          emissiveIntensity={0.5}
        />
      </Sphere>
      {[1.5, 2, 2.5].map((radius, i) => (
        <Torus
          key={i}
          ref={el => ringsRef.current[i] = el}
          args={[radius, 0.05, 16, 100]}
        >
          <meshBasicMaterial color="#00BFFF" opacity={0.3} transparent />
        </Torus>
      ))}
    </group>
  )
}

// Symmetry Breaking - Crystal Formation
const SymmetryBreaking = () => {
  const groupRef = useRef()
  const crystalsRef = useRef([])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
    crystalsRef.current.forEach((crystal, i) => {
      if (crystal) {
        crystal.rotation.x += 0.01 * Math.sin(state.clock.elapsedTime + i)
        crystal.rotation.z += 0.01 * Math.cos(state.clock.elapsedTime + i)
      }
    })
  })
  
  const crystalPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      positions.push([
        Math.cos(angle) * 2,
        Math.sin(angle) * 2,
        0
      ])
    }
    return positions
  }, [])
  
  return (
    <group ref={groupRef}>
      <Box args={[1, 1, 1]}>
        <meshPhysicalMaterial
          color="#9370DB"
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </Box>
      {crystalPositions.map((pos, i) => (
        <Box
          key={i}
          ref={el => crystalsRef.current[i] = el}
          args={[0.3, 0.3, 0.3]}
          position={pos}
        >
          <meshPhysicalMaterial
            color={new THREE.Color().setHSL(0.8, 1, 0.5)}
            metalness={0.9}
            roughness={0.1}
          />
        </Box>
      ))}
    </group>
  )
}

// Particle Soup - Matter Creation
const ParticleSoup = () => {
  const particlesRef = useRef()
  
  const particleData = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    const colors = new Float32Array(1000 * 3)
    
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      
      const color = new THREE.Color().setHSL(Math.random(), 1, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.01
        positions[i + 1] += Math.cos(state.clock.elapsedTime + i) * 0.01
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={1000}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors />
    </points>
  )
}

// Hadron Formation - Quark Confinement
const HadronFormation = () => {
  const nucleusRef = useRef()
  const quarksRef = useRef([])
  
  useFrame((state) => {
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += 0.01
      nucleusRef.current.rotation.x += 0.005
    }
    
    quarksRef.current.forEach((quark, i) => {
      if (quark) {
        const angle = state.clock.elapsedTime * 2 + (i * Math.PI * 2 / 3)
        quark.position.x = Math.cos(angle) * 1.5
        quark.position.z = Math.sin(angle) * 1.5
        quark.position.y = Math.sin(angle * 2) * 0.5
      }
    })
  })
  
  return (
    <group>
      <Sphere ref={nucleusRef} args={[0.5, 32, 32]}>
        <meshPhysicalMaterial
          color="#FF4500"
          metalness={0.7}
          roughness={0.3}
          emissive="#FF6347"
          emissiveIntensity={0.3}
        />
      </Sphere>
      {[0, 1, 2].map(i => (
        <Sphere
          key={i}
          ref={el => quarksRef.current[i] = el}
          args={[0.2, 16, 16]}
        >
          <meshBasicMaterial color={i === 0 ? "#FF0000" : i === 1 ? "#00FF00" : "#0000FF"} />
        </Sphere>
      ))}
    </group>
  )
}

// First Atoms - Recombination
const FirstAtoms = () => {
  const atomRef = useRef()
  const electronsRef = useRef([])
  
  useFrame((state) => {
    if (atomRef.current) {
      atomRef.current.rotation.y += 0.005
    }
    
    electronsRef.current.forEach((electron, i) => {
      if (electron) {
        const angle = state.clock.elapsedTime * 3 + (i * Math.PI)
        const radius = 1.5 + i * 0.5
        electron.position.x = Math.cos(angle) * radius
        electron.position.z = Math.sin(angle) * radius
        electron.position.y = Math.sin(angle * 2) * 0.3
      }
    })
  })
  
  return (
    <group ref={atomRef}>
      {/* Nucleus */}
      <Sphere args={[0.3, 32, 32]}>
        <meshPhysicalMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#FFA500"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Electron orbits */}
      {[1.5, 2].map((radius, i) => (
        <Torus
          key={i}
          args={[radius, 0.01, 16, 100]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#87CEEB" opacity={0.3} transparent />
        </Torus>
      ))}
      
      {/* Electrons */}
      {[0, 1].map(i => (
        <Sphere
          key={i}
          ref={el => electronsRef.current[i] = el}
          args={[0.1, 16, 16]}
        >
          <meshBasicMaterial color="#00FFFF" />
        </Sphere>
      ))}
    </group>
  )
}

// Dark Energy - Expanding Space
const DarkEnergyExpansion = () => {
  const gridRef = useRef()
  const galaxiesRef = useRef([])
  
  const galaxyPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < 20; i++) {
      positions.push([
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ])
    }
    return positions
  }, [])
  
  useFrame((state) => {
    galaxiesRef.current.forEach((galaxy, i) => {
      if (galaxy) {
        // Galaxies moving apart
        const expansion = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
        galaxy.position.x = galaxyPositions[i][0] * expansion
        galaxy.position.y = galaxyPositions[i][1] * expansion
        galaxy.position.z = galaxyPositions[i][2] * expansion
        galaxy.rotation.z += 0.001
      }
    })
  })
  
  return (
    <group>
      {/* Grid representing spacetime */}
      <gridHelper ref={gridRef} args={[10, 20, "#4B0082", "#4B0082"]} />
      
      {/* Galaxies */}
      {galaxyPositions.map((pos, i) => (
        <group key={i} ref={el => galaxiesRef.current[i] = el} position={pos}>
          <Sphere args={[0.1, 16, 16]}>
            <meshBasicMaterial color="#9370DB" />
          </Sphere>
          <pointLight color="#9370DB" intensity={0.5} distance={2} />
        </group>
      ))}
    </group>
  )
}

// Main component that selects the right visualization
const EpochVisualization = ({ epochId }) => {
  const visualizations = {
    planck: <QuantumFoam />,
    gut: <SymmetryBreaking />,
    inflation: <InflationExpansion />,
    reheating: <ParticleSoup />,
    electroweak: <SymmetryBreaking />,
    ewsb: <SymmetryBreaking />,
    qcd: <HadronFormation />,
    lepton: <ParticleSoup />,
    recombination: <FirstAtoms />,
    darkenergy: <DarkEnergyExpansion />,
    present: <DarkEnergyExpansion />
  }
  
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          {visualizations[epochId] || <QuantumFoam />}
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

export default EpochVisualization
