import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Custom shader material for cosmic background
const CosmicShaderMaterial = shaderMaterial(
  {
    time: 0,
    epoch: 0,
    resolution: new THREE.Vector2(1, 1),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float epoch;
    uniform vec2 resolution;
    varying vec2 vUv;
    
    // Noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 st = vUv;
      float t = time * 0.1;
      
      // Different color schemes for different epochs
      vec3 color1, color2, color3;
      
      if (epoch < 1.0) {
        // Planck Era - Intense golden/white
        color1 = vec3(1.0, 0.95, 0.4);
        color2 = vec3(1.0, 0.6, 0.1);
        color3 = vec3(1.0, 0.3, 0.0);
      } else if (epoch < 2.0) {
        // GUT - Purple/violet
        color1 = vec3(0.8, 0.3, 1.0);
        color2 = vec3(0.5, 0.0, 1.0);
        color3 = vec3(0.3, 0.0, 0.8);
      } else if (epoch < 3.0) {
        // Inflation - Deep blue
        color1 = vec3(0.2, 0.4, 1.0);
        color2 = vec3(0.0, 0.2, 0.8);
        color3 = vec3(0.0, 0.1, 0.6);
      } else if (epoch < 4.0) {
        // Reheating - Pink/magenta
        color1 = vec3(1.0, 0.3, 0.6);
        color2 = vec3(0.8, 0.1, 0.4);
        color3 = vec3(0.6, 0.0, 0.3);
      } else if (epoch < 6.0) {
        // Electroweak - Green/cyan
        color1 = vec3(0.2, 1.0, 0.6);
        color2 = vec3(0.0, 0.8, 0.5);
        color3 = vec3(0.0, 0.6, 0.4);
      } else if (epoch < 8.0) {
        // QCD - Red/orange
        color1 = vec3(1.0, 0.3, 0.1);
        color2 = vec3(0.8, 0.2, 0.0);
        color3 = vec3(0.6, 0.1, 0.0);
      } else if (epoch < 10.0) {
        // Recombination - Indigo
        color1 = vec3(0.3, 0.3, 0.8);
        color2 = vec3(0.2, 0.2, 0.6);
        color3 = vec3(0.1, 0.1, 0.4);
      } else {
        // Dark energy/Present - Deep purple to black
        color1 = vec3(0.2, 0.0, 0.3);
        color2 = vec3(0.1, 0.0, 0.2);
        color3 = vec3(0.05, 0.0, 0.1);
      }
      
      // Create flowing noise patterns
      float noise1 = snoise(st * 3.0 + t * 0.5);
      float noise2 = snoise(st * 5.0 - t * 0.3 + 100.0);
      float noise3 = snoise(st * 7.0 + t * 0.2 + 200.0);
      
      // Combine noises for complex patterns
      float finalNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      finalNoise = finalNoise * 0.5 + 0.5; // Normalize to 0-1
      
      // Add radial gradient
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(st, center);
      float radialGradient = 1.0 - smoothstep(0.0, 1.0, dist);
      
      // Mix colors based on noise and radial gradient
      vec3 finalColor = mix(color1, color2, finalNoise);
      finalColor = mix(finalColor, color3, dist);
      
      // Add glow effect
      float glow = pow(radialGradient, 2.0) * (0.5 + 0.5 * sin(t * 2.0));
      finalColor += color1 * glow * 0.3;
      
      // Add sparkles
      float sparkle = pow(snoise(st * 50.0 + t * 5.0), 8.0);
      if (sparkle > 0.8) {
        finalColor += vec3(1.0) * sparkle;
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ CosmicShaderMaterial })

const CosmicBackground = ({ epoch }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime
      meshRef.current.material.uniforms.epoch.value = epoch
    }
  })
  
  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[16, 9]} />
      <cosmicShaderMaterial />
    </mesh>
  )
}

const CosmicBackground3D = ({ epoch }) => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <CosmicBackground epoch={epoch} />
      </Canvas>
    </div>
  )
}

export default CosmicBackground3D
