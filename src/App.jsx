import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import Globe from './components/Globe'
import TyphoonPath from './components/TyphoonPath'
import EarthquakeMarkers from './components/EarthquakeMarkers'
import ControlPanel from './components/ControlPanel'
import MapView from './components/MapView'
import EarthquakeMapView from './components/EarthquakeMapView'
import { fetchEarthquakes, fetchTyphoons } from './services/dataService'
import './App.css'

function App() {
  const [selectedTyphoon, setSelectedTyphoon] = useState(null)
  const [selectedEarthquake, setSelectedEarthquake] = useState(null)
  const [showTyphoons, setShowTyphoons] = useState(true)
  const [showEarthquakes, setShowEarthquakes] = useState(true)
  const [showMapView, setShowMapView] = useState(false)
  const [mapViewTyphoon, setMapViewTyphoon] = useState(null)
  const [showEarthquakeMapView, setShowEarthquakeMapView] = useState(false)
  const [mapViewEarthquake, setMapViewEarthquake] = useState(null)
  
  // Real-time data states
  const [typhoons, setTyphoons] = useState([])
  const [earthquakes, setEarthquakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 60 seconds default

  // Fetch real-time data
  const loadData = async () => {
    try {
      setLoading(true)
      const [typhoonData, earthquakeData] = await Promise.all([
        fetchTyphoons(),
        fetchEarthquakes(4.5, 50)
      ])
      
      setTyphoons(typhoonData)
      setEarthquakes(earthquakeData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  return (
    <div className="app-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={300} depth={60} count={5000} factor={7} fade speed={1} />
        
        <Globe />
        
        {showTyphoons && typhoons.map(typhoon => (
          <TyphoonPath
            key={typhoon.id}
            typhoon={typhoon}
            selected={selectedTyphoon?.id === typhoon.id}
            onSelect={() => setSelectedTyphoon(typhoon)}
            onPathClick={() => {
              setMapViewTyphoon(typhoon)
              setShowMapView(true)
            }}
          />
        ))}
        
        {showEarthquakes && (
          <EarthquakeMarkers
            earthquakes={earthquakes}
            selected={selectedEarthquake}
            onSelect={setSelectedEarthquake}
            onMapClick={(earthquake) => {
              setMapViewEarthquake(earthquake)
              setShowEarthquakeMapView(true)
            }}
          />
        )}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>

      <ControlPanel
        typhoons={typhoons}
        earthquakes={earthquakes}
        selectedTyphoon={selectedTyphoon}
        selectedEarthquake={selectedEarthquake}
        onTyphoonSelect={setSelectedTyphoon}
        onEarthquakeSelect={setSelectedEarthquake}
        showTyphoons={showTyphoons}
        showEarthquakes={showEarthquakes}
        onToggleTyphoons={setShowTyphoons}
        onToggleEarthquakes={setShowEarthquakes}
        onShowMapView={(typhoon) => {
          setMapViewTyphoon(typhoon)
          setShowMapView(true)
        }}
        onShowEarthquakeMapView={(earthquake) => {
          setMapViewEarthquake(earthquake)
          setShowEarthquakeMapView(true)
        }}
        loading={loading}
        lastUpdate={lastUpdate}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={setAutoRefresh}
        onRefresh={loadData}
      />

      {showMapView && mapViewTyphoon && (
        <MapView
          typhoon={mapViewTyphoon}
          onClose={() => {
            setShowMapView(false)
            setMapViewTyphoon(null)
          }}
        />
      )}

      {showEarthquakeMapView && mapViewEarthquake && (
        <EarthquakeMapView
          earthquake={mapViewEarthquake}
          onClose={() => {
            setShowEarthquakeMapView(false)
            setMapViewEarthquake(null)
          }}
        />
      )}
    </div>
  )
}

export default App

