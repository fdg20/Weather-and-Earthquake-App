import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import WeatherCard from './WeatherCard'
import './MapView.css'

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapView({ typhoon, onClose }) {
  const [showWeather, setShowWeather] = useState(true)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (!map || !typhoon) return

    // Fit bounds to show entire path
    const pathCoordinates = typhoon.path.map(point => [point.lat, point.lon])
    const allCoordinates = [
      ...pathCoordinates,
      [typhoon.currentPosition.lat, typhoon.currentPosition.lon]
    ]
    
    if (allCoordinates.length > 0) {
      const bounds = L.latLngBounds(allCoordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, typhoon])

  if (!typhoon) return null

  const center = [typhoon.currentPosition.lat, typhoon.currentPosition.lon]
  const pathCoordinates = typhoon.path.map(point => [point.lat, point.lon])

  // Create custom icon for current position
  const currentIcon = L.divIcon({
    className: 'custom-typhoon-marker',
    html: `<div style="
      width: 40px;
      height: 40px;
      background: #d32f2f;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">🌀</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  // Create custom icons for path points
  const getPathIcon = (intensity) => {
    const size = 10 + intensity * 3
    const color = intensity >= 4 ? '#FF0000' : intensity >= 3 ? '#FF8800' : '#FFFF00'
    return L.divIcon({
      className: 'custom-path-marker',
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }

  return (
    <div className="map-view-overlay" onClick={onClose}>
      <div className="map-view-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-view-header">
          <h2>
            {typhoon.displayName || typhoon.name} - Path Visualization
            {typhoon.isInsidePAR && typhoon.localName && (
              <span style={{ fontSize: '0.7em', marginLeft: '10px', opacity: 0.9 }}>
                🇵🇭 Inside PAR
              </span>
            )}
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="map-view-content">
          <MapContainer
            center={center}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            whenCreated={setMap}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Satellite/Imagery layer option */}
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              opacity={0}
              id="satellite-layer"
            />

            {/* Typhoon path polyline */}
            <Polyline
              positions={pathCoordinates}
              pathOptions={{
                color: '#FF0000',
                weight: 3,
                opacity: 0.8,
              }}
            />

            {/* Markers for each point in the path */}
            {typhoon.path.map((point, index) => (
              <Marker
                key={`path-${index}`}
                position={[point.lat, point.lon]}
                icon={getPathIcon(point.intensity)}
              >
              <Popup>
                <div style={{ padding: '10px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{typhoon.displayName || typhoon.name}</h3>
                  <p style={{ margin: '5px 0' }}><strong>Point {index + 1}</strong></p>
                  <p style={{ margin: '5px 0' }}>Lat: {point.lat.toFixed(2)}°</p>
                  <p style={{ margin: '5px 0' }}>Lon: {point.lon.toFixed(2)}°</p>
                  <p style={{ margin: '5px 0' }}>Intensity: Category {point.intensity}</p>
                </div>
              </Popup>
              </Marker>
            ))}

            {/* Current position marker */}
            <Marker
              position={center}
              icon={currentIcon}
            >
              <Popup>
                <div style={{ padding: '15px', minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#d32f2f', fontSize: '18px' }}>
                    🌀 {typhoon.displayName || typhoon.name}
                    {typhoon.isInsidePAR && typhoon.localName && (
                      <span style={{ fontSize: '0.7em', marginLeft: '8px', color: '#4ecdc4' }}>
                        🇵🇭
                      </span>
                    )}
                  </h3>
                  <div style={{ lineHeight: '1.8' }}>
                    {typhoon.localName && (
                      <p style={{ margin: '8px 0' }}>
                        <strong>Local Name (PAGASA):</strong> {typhoon.localName}
                      </p>
                    )}
                    <p style={{ margin: '8px 0' }}><strong>Current Position:</strong></p>
                    <p style={{ margin: '8px 0' }}>Lat: {typhoon.currentPosition.lat.toFixed(4)}°</p>
                    <p style={{ margin: '8px 0' }}>Lon: {typhoon.currentPosition.lon.toFixed(4)}°</p>
                    {typhoon.isInsidePAR && (
                      <p style={{ margin: '8px 0', color: '#4ecdc4' }}>
                        <strong>📍 Inside Philippine Area of Responsibility (PAR)</strong>
                      </p>
                    )}
                    <p style={{ margin: '8px 0' }}>
                      <strong>Intensity:</strong> Category {typhoon.currentPosition.intensity || typhoon.path[typhoon.path.length - 1]?.intensity || 'N/A'}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Wind Speed:</strong> {typhoon.currentPosition.windSpeed || 'N/A'} km/h
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Status:</strong> <span style={{ color: '#d32f2f' }}>Active</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        {showWeather && typhoon && (
          <div className="map-weather-container">
            <WeatherCard 
              lat={typhoon.currentPosition.lat} 
              lon={typhoon.currentPosition.lon}
              cityName={`${typhoon.displayName || typhoon.name} Location`}
            />
          </div>
        )}
        <div className="map-view-footer">
          <p>Click on markers to see details. Right-click and drag to change map layers.</p>
          <button 
            className="weather-toggle-btn"
            onClick={() => setShowWeather(!showWeather)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showWeather ? 'Hide Weather' : 'Show Weather'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapView
