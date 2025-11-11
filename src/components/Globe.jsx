import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

function Globe() {
  const meshRef = useRef()

  // Create sphere geometry for Earth
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 64, 64), [])
  
  // Use a realistic Earth texture (NASA Blue Marble or similar)
  // Using a free Earth texture from a CDN
  const earthTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg')
  const earthBumpMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg')
  const earthSpecularMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg')
  
  // Configure texture wrapping
  earthTexture.wrapS = THREE.RepeatWrapping
  earthTexture.wrapT = THREE.RepeatWrapping
  
  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: earthBumpMap,
      bumpScale: 0.05,
      specularMap: earthSpecularMap,
      specular: new THREE.Color(0x333333),
      shininess: 5,
    })
  }, [earthTexture, earthBumpMap, earthSpecularMap])

  // Globe rotation stopped - events are pinned to globe
  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.001
  //   }
  // })

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  )
}

export default Globe

