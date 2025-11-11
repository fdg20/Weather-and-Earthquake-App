import React, { useMemo } from 'react'
import { Sphere, Text, Ring } from '@react-three/drei'
import * as THREE from 'three'

// Convert lat/lon to 3D coordinates on sphere
function latLonToVector3(lat, lon, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  
  return [x, y, z]
}

// Get color based on magnitude
function getMagnitudeColor(magnitude) {
  if (magnitude >= 7) return "#ff0000" // Red - Major
  if (magnitude >= 6) return "#ff6600" // Orange - Strong
  if (magnitude >= 5) return "#ffaa00" // Yellow - Moderate
  return "#ffff00" // Light yellow - Minor
}

function EarthquakeMarkers({ earthquakes, selected, onSelect, onMapClick }) {
  return (
    <group>
      {earthquakes.map((eq) => {
        const position = latLonToVector3(eq.lat, eq.lon)
        const isSelected = selected?.id === eq.id
        const size = Math.min(0.03 + (eq.magnitude - 4) * 0.01, 0.08)
        const color = getMagnitudeColor(eq.magnitude)
        
        return (
          <group key={eq.id} position={position}>
            {/* Ripple effect rings */}
            <Ring
              args={[size * 1.5, size * 1.6, 32]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.3}
                emissive={color}
                emissiveIntensity={0.2}
              />
            </Ring>
            <Ring
              args={[size * 2, size * 2.1, 32]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.15}
                emissive={color}
                emissiveIntensity={0.1}
              />
            </Ring>
            
            {/* Main earthquake marker */}
            <Sphere
              args={[size, 16, 16]}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(eq)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (onMapClick) onMapClick(eq)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto'
              }}
            >
              <meshStandardMaterial
                color={isSelected ? "#ffffff" : color}
                emissive={color}
                emissiveIntensity={isSelected ? 1 : 0.8}
              />
            </Sphere>
            
            {/* Magnitude label */}
            <Text
              position={[0.1, 0.1, 0]}
              fontSize={0.04}
              color={isSelected ? "#ffffff" : "#ffffff"}
              anchorX="left"
              anchorY="middle"
              outlineWidth={0.002}
              outlineColor="#000000"
            >
              M{eq.magnitude.toFixed(1)}
            </Text>
            
            {/* Location label if selected */}
            {isSelected && (
              <Text
                position={[0.1, 0.05, 0]}
                fontSize={0.03}
                color="#cccccc"
                anchorX="left"
                anchorY="middle"
                outlineWidth={0.002}
                outlineColor="#000000"
              >
                {eq.location}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default EarthquakeMarkers

