import React, { useMemo } from 'react'
import { Line, Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'
import CycloneEffect from './CycloneEffect'

// Convert lat/lon to 3D coordinates on sphere
function latLonToVector3(lat, lon, radius = 1.01) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  
  return [x, y, z]
}

function TyphoonPath({ typhoon, selected, onSelect, onPathClick }) {
  // Convert path points to 3D coordinates
  const pathPoints = useMemo(() => {
    return typhoon.path.map(point => latLonToVector3(point.lat, point.lon))
  }, [typhoon.path])

  // Create line segments for the path - convert to Vector3 array
  const linePoints = useMemo(() => {
    const points = []
    for (let i = 0; i < pathPoints.length; i++) {
      points.push(new THREE.Vector3(...pathPoints[i]))
    }
    return points
  }, [pathPoints])

  // Current position
  const currentPos = useMemo(() => {
    return latLonToVector3(
      typhoon.currentPosition.lat,
      typhoon.currentPosition.lon
    )
  }, [typhoon.currentPosition])

  // Line of sight visualization - create a cone/trajectory
  const lineOfSightPoints = useMemo(() => {
    const points = []
    const current = latLonToVector3(
      typhoon.currentPosition.lat,
      typhoon.currentPosition.lon,
      1.01
    )
    
    // Project forward trajectory - need at least 2 points to calculate direction
    if (pathPoints.length < 2) {
      return points
    }
    
    const lastPoint = pathPoints[pathPoints.length - 1]
    const secondLastPoint = pathPoints[pathPoints.length - 2]
    const direction = new THREE.Vector3(
      lastPoint[0] - secondLastPoint[0],
      lastPoint[1] - secondLastPoint[1],
      lastPoint[2] - secondLastPoint[2]
    ).normalize()
    
    // Extend the line of sight
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const distance = 0.3 * t
      const point = new THREE.Vector3(
        current[0] + direction.x * distance,
        current[1] + direction.y * distance,
        current[2] + direction.z * distance
      )
      point.normalize().multiplyScalar(1.01 + distance * 0.5)
      points.push(point)
    }
    
    return points
  }, [typhoon, pathPoints])

  return (
    <group>
      {/* Historical path */}
      {linePoints.length > 1 && (
        <Line
          points={linePoints}
          color={selected ? "#ff6b6b" : "#4ecdc4"}
          onClick={(e) => {
            e.stopPropagation()
            if (onPathClick) onPathClick()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        />
      )}
      
      {/* Line of sight trajectory */}
      {lineOfSightPoints.length > 1 && (
        <Line
          points={lineOfSightPoints}
          color="#ffd93d"
          dashed
        />
      )}
      
      {/* Path points */}
      {typhoon.path.map((point, index) => {
        const pos = latLonToVector3(point.lat, point.lon)
        return (
          <Sphere
            key={index}
            position={pos}
            args={[0.01, 8, 8]}
          >
            <meshStandardMaterial
              color={point.intensity >= 4 ? "#ff0000" : point.intensity >= 3 ? "#ff8800" : "#ffff00"}
              emissive={point.intensity >= 4 ? "#ff0000" : point.intensity >= 3 ? "#ff8800" : "#ffff00"}
              emissiveIntensity={0.5}
            />
          </Sphere>
        )
      })}
      
      {/* Current position marker with cyclone effect */}
      <CycloneEffect
        position={currentPos}
        intensity={typhoon.path[typhoon.path.length - 1]?.intensity || 3}
        rotationSpeed={0.02}
      />
      <Sphere
        position={currentPos}
        args={[0.02, 16, 16]}
        onClick={onSelect}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={1}
        />
      </Sphere>
      
      {/* Typhoon name label */}
      <Text
        position={[currentPos[0] + 0.1, currentPos[1] + 0.1, currentPos[2]]}
        fontSize={0.05}
        color={selected ? "#ff6b6b" : "#ffffff"}
        anchorX="left"
        anchorY="middle"
      >
        {typhoon.name}
      </Text>
    </group>
  )
}

export default TyphoonPath

