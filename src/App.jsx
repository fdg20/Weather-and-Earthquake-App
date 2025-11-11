import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import Globe from './components/Globe'
import TyphoonPath from './components/TyphoonPath'
import EarthquakeMarkers from './components/EarthquakeMarkers'
import ControlPanel from './components/ControlPanel'
import MapView from './components/MapView'
import EarthquakeMapView from './components/EarthquakeMapView'
import UserReportForm from './components/UserReportForm'
import MapPicker from './components/MapPicker'
import LowPressureArea from './components/LowPressureArea'
import { fetchEarthquakes, fetchTyphoons, getLowPressureAreas, fetchWeatherData, fetchWeatherForecast } from './services/dataService'
import { saveUserReport, getUserReports } from './services/userReportsService'
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
  const [showReportForm, setShowReportForm] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  
  // Real-time data states
  const [typhoons, setTyphoons] = useState([])
  const [earthquakes, setEarthquakes] = useState([])
  const [lowPressureAreas, setLowPressureAreas] = useState([])
  const [userReports, setUserReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 60 seconds default

  // Fetch real-time data
  const loadData = async () => {
    try {
      setLoading(true)
      const [typhoonData, earthquakeData, lowPressureData] = await Promise.all([
        fetchTyphoons(),
        fetchEarthquakes(4.5, 50),
        getLowPressureAreas()
      ])
      
      setTyphoons(typhoonData)
      setEarthquakes(earthquakeData)
      setLowPressureAreas(lowPressureData)
      setUserReports(getUserReports())
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load user reports on mount
  useEffect(() => {
    setUserReports(getUserReports())
  }, [])

  // Handle user report submission
  const handleReportSubmit = (reportData) => {
    const savedReport = saveUserReport(reportData)
    setUserReports([...userReports, savedReport])
    alert('Report submitted successfully! Thank you for your contribution.')
  }

  // Handle location selection for report form
  const handleLocationSelect = (lat, lon) => {
    // This will be handled by the MapPicker component
    return { lat, lon }
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

  // Handle window resize for mobile
  useEffect(() => {
    const handleResize = () => {
      // Force canvas resize on mobile orientation change
      if (window.innerWidth <= 768) {
        window.dispatchEvent(new Event('resize'))
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return (
    <div className="app-container">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
        }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
      >
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

        {/* Low Pressure Areas */}
        {lowPressureAreas.map((area, index) => {
          const phi = (90 - area.lat) * (Math.PI / 180)
          const theta = (area.lon + 180) * (Math.PI / 180)
          const radius = 1.015
          const x = -(radius * Math.sin(phi) * Math.cos(theta))
          const y = radius * Math.cos(phi)
          const z = radius * Math.sin(phi) * Math.sin(theta)
          
          return (
            <LowPressureArea
              key={`lpa-${index}`}
              position={[x, y, z]}
              intensity={area.intensity}
            />
          )
        })}

        {/* User Report Markers */}
        {userReports.map((report) => {
          if (!report.lat || !report.lon) return null
          const phi = (90 - report.lat) * (Math.PI / 180)
          const theta = (report.lon + 180) * (Math.PI / 180)
          const radius = 1.02
          const x = -(radius * Math.sin(phi) * Math.cos(theta))
          const y = radius * Math.cos(phi)
          const z = radius * Math.sin(phi) * Math.sin(theta)
          
          return (
            <group key={report.id} position={[x, y, z]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedReport(report)
                }}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto'
                }}
              >
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial
                  color="#00ff00"
                  emissive="#00ff00"
                  emissiveIntensity={1.2}
                />
              </mesh>
              {/* Add a label or indicator for reports */}
              <Text
                position={[x * 1.05, y * 1.05, z * 1.05]}
                fontSize={0.03}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
              >
                📍
              </Text>
            </group>
          )
        })}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          zoomSpeed={1.2}
          panSpeed={0.8}
          rotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
          touches={{
            ONE: 2, // Rotate
            TWO: 1  // Zoom
          }}
          mouseButtons={{
            LEFT: 0, // Rotate
            MIDDLE: 1, // Zoom
            RIGHT: 2 // Pan
          }}
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
        onShowReportForm={() => setShowReportForm(true)}
        philippinesTyphoons={typhoons.filter(t => t.approachingPhilippines)}
        userReportsCount={userReports.length}
        userReports={userReports}
        onReportClick={setSelectedReport}
      />

      {showReportForm && (
        <UserReportForm
          onClose={() => setShowReportForm(false)}
          onSubmit={handleReportSubmit}
          onLocationSelect={(callback) => {
            setShowMapPicker(true)
            // Store callback for when map picker closes
            window.mapPickerCallback = callback
          }}
        />
      )}

      {showMapPicker && (
        <MapPicker
          onLocationSelect={(lat, lon) => {
            if (window.mapPickerCallback) {
              window.mapPickerCallback(lat, lon)
              window.mapPickerCallback = null
            }
            setShowMapPicker(false)
          }}
          onClose={() => {
            setShowMapPicker(false)
            window.mapPickerCallback = null
          }}
        />
      )}

      {selectedReport && (
        <div className="report-popup-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedReport(null)}>×</button>
            <h3>📍 {selectedReport.name || 'User Report'}</h3>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <p><strong>📍 Location:</strong></p>
              <p style={{ marginLeft: '16px' }}>
                {selectedReport.address || 'No address provided'}
              </p>
              {selectedReport.lat && selectedReport.lon && (
                <p style={{ marginLeft: '16px', fontSize: '12px', color: '#888' }}>
                  Coordinates: {selectedReport.lat.toFixed(4)}°N, {selectedReport.lon.toFixed(4)}°E
                </p>
              )}
            </div>
            <p><strong>Issue Type:</strong> {selectedReport.issueType || 'Not specified'}</p>
            {selectedReport.provider && <p><strong>Service Provider:</strong> {selectedReport.provider}</p>}
            {selectedReport.description && (
              <div style={{ marginTop: '12px' }}>
                <p><strong>Description:</strong></p>
                <p style={{ marginLeft: '16px', fontStyle: 'italic', color: '#666' }}>
                  {selectedReport.description}
                </p>
              </div>
            )}
            {selectedReport.imagePreview && (
              <div className="report-image" style={{ marginTop: '16px' }}>
                <img src={selectedReport.imagePreview} alt="Report evidence" style={{ maxWidth: '100%', borderRadius: '8px' }} />
              </div>
            )}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
              <p><small style={{ color: '#888' }}>
                📅 Reported: {new Date(selectedReport.timestamp).toLocaleString()}
              </small></p>
            </div>
          </div>
        </div>
      )}

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

