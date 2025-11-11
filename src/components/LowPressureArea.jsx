import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Ring } from '@react-three/drei'
import * as THREE from 'three'

// Convert lat/lon to 3D coordinates on sphere
function latLonToVector3(lat, lon, radius = 1.01) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  
  return [x, y, z]
}

function LowPressureArea({ position, intensity = 0.5 }) {
  const groupRef = useRef()
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta
      // Gentle pulsing animation
      const scale = 1 + Math.sin(timeRef.current * 1.5) * 0.15
      groupRef.current.scale.set(scale, scale, 1)
    }
  })

  const [x, y, z] = position
  const size = 0.08 * (1 + intensity)

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {/* Outer pressure rings */}
      {[0, 1, 2, 3].map((i) => (
        <Ring
          key={`pressure-ring-${i}`}
          args={[size * (1 + i * 0.25), size * (1.05 + i * 0.25), 32]}
          rotation={[Math.PI / 2, 0, (i * Math.PI) / 4]}
        >
          <meshStandardMaterial
            color="#4a90e2"
            transparent
            opacity={0.4 - i * 0.08}
            emissive="#4a90e2"
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </Ring>
      ))}
      
      {/* Central low pressure indicator */}
      <mesh>
        <sphereGeometry args={[size * 0.6, 16, 16]} />
        <meshStandardMaterial
          color="#2e5c8a"
          transparent
          opacity={0.5}
          emissive="#4a90e2"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  )
}

export default LowPressureArea

