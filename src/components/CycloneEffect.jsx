import React, { useRef, useMemo } from 'react'
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

function CycloneEffect({ position, intensity, rotationSpeed = 0.01 }) {
  const groupRef = useRef()
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta
      groupRef.current.rotation.z += rotationSpeed
      
      // Pulsing effect
      const scale = 1 + Math.sin(timeRef.current * 2) * 0.1
      groupRef.current.scale.set(scale, scale, 1)
    }
  })

  const [x, y, z] = position
  const size = 0.05 + (intensity * 0.01)
  const opacity = 0.6 + (intensity * 0.1)

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {/* Outer rotating rings - cyclone effect */}
      {[0, 1, 2].map((i) => (
        <Ring
          key={`ring-${i}`}
          args={[size * (1.2 + i * 0.3), size * (1.3 + i * 0.3), 32]}
          rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}
        >
          <meshStandardMaterial
            color={intensity >= 4 ? "#ff0000" : intensity >= 3 ? "#ff8800" : "#ffff00"}
            transparent
            opacity={opacity - i * 0.15}
            emissive={intensity >= 4 ? "#ff0000" : intensity >= 3 ? "#ff8800" : "#ffff00"}
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </Ring>
      ))}
      
      {/* Central cloud effect */}
      <mesh>
        <sphereGeometry args={[size * 0.8, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

export default CycloneEffect

