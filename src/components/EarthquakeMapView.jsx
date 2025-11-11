import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function EarthquakeMapView({ earthquake, onClose }) {
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (!map || !earthquake) return

    // Fit bounds to show earthquake area
    const radius = (earthquake.magnitude / 5) * 150000 // Scale radius based on magnitude
    const bounds = L.latLngBounds([
      [earthquake.lat - radius / 111000, earthquake.lon - radius / (111000 * Math.cos(earthquake.lat * Math.PI / 180))],
      [earthquake.lat + radius / 111000, earthquake.lon + radius / (111000 * Math.cos(earthquake.lat * Math.PI / 180))]
    ])
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, earthquake])

  if (!earthquake) return null

  const center = [earthquake.lat, earthquake.lon]
  const zoom = earthquake.magnitude >= 7 ? 8 : earthquake.magnitude >= 6 ? 9 : 10

  // Create custom earthquake icon
  const iconSize = Math.min(30 + earthquake.magnitude * 5, 80)
  const iconColor = earthquake.magnitude >= 7 ? '#FF0000' : 
                   earthquake.magnitude >= 6 ? '#FF6600' : 
                   earthquake.magnitude >= 5 ? '#FFAA00' : '#FFFF00'

  const earthquakeIcon = L.divIcon({
    className: 'custom-earthquake-marker',
    html: `<div style="
      width: ${iconSize}px;
      height: ${iconSize}px;
      background: ${iconColor};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${iconSize * 0.4}px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    ">🌍</div>`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  })

  // Create concentric circles for earthquake effect
  const circleData = [
    { color: iconColor, opacity: 0.3, radius: 50000 },
    { color: iconColor, opacity: 0.2, radius: 100000 },
    { color: iconColor, opacity: 0.1, radius: 150000 },
  ]

  // Fault line coordinates
  const faultLineCoordinates = earthquake.magnitude >= 6 ? [
    [earthquake.lat - 0.1, earthquake.lon - 0.1],
    [earthquake.lat, earthquake.lon],
    [earthquake.lat + 0.1, earthquake.lon + 0.1],
  ] : []

  return (
    <div className="map-view-overlay" onClick={onClose}>
      <div className="map-view-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-view-header">
          <h2>🌍 {earthquake.location} - Earthquake M{earthquake.magnitude.toFixed(1)}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="map-view-content">
          <MapContainer
            center={center}
            zoom={zoom}
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

            {/* Concentric circles for earthquake effect */}
            {circleData.map((circle, index) => (
              <Circle
                key={`circle-${index}`}
                center={center}
                radius={circle.radius * (earthquake.magnitude / 5)}
                pathOptions={{
                  color: circle.color,
                  fillColor: circle.color,
                  fillOpacity: circle.opacity,
                  weight: 2,
                  opacity: 0.5,
                }}
              />
            ))}

            {/* Fault line visualization */}
            {faultLineCoordinates.length > 0 && (
              <Polyline
                positions={faultLineCoordinates}
                pathOptions={{
                  color: '#FF0000',
                  weight: 3,
                  opacity: 0.6,
                }}
              />
            )}

            {/* Volcanic activity visualization for high magnitude earthquakes */}
            {earthquake.magnitude >= 6.5 && (
              <Polyline
                positions={[
                  [earthquake.lat + 0.05, earthquake.lon],
                  [earthquake.lat + 0.02, earthquake.lon + 0.03],
                  [earthquake.lat, earthquake.lon],
                  [earthquake.lat + 0.02, earthquake.lon - 0.03],
                  [earthquake.lat + 0.05, earthquake.lon],
                ]}
                pathOptions={{
                  color: '#8B4513',
                  fillColor: '#8B4513',
                  fillOpacity: 0.3,
                  weight: 2,
                  opacity: 0.8,
                }}
              />
            )}

            {/* Epicenter marker */}
            <Marker
              position={center}
              icon={earthquakeIcon}
            >
              <Popup>
                <div style={{ padding: '15px', minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: iconColor, fontSize: '18px' }}>
                    🌍 Earthquake Details
                  </h3>
                  <div style={{ lineHeight: '1.8' }}>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Magnitude:</strong> <span style={{ color: iconColor, fontSize: '16px', fontWeight: 'bold' }}>
                        M{earthquake.magnitude.toFixed(1)}
                      </span>
                    </p>
                    <p style={{ margin: '8px 0' }}><strong>Location:</strong> {earthquake.location}</p>
                    <p style={{ margin: '8px 0' }}><strong>Depth:</strong> {earthquake.depth} km</p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Coordinates:</strong><br/>
                      {earthquake.lat.toFixed(4)}°N, {earthquake.lon.toFixed(4)}°E
                    </p>
                    {earthquake.time && (
                      <p style={{ margin: '8px 0' }}>
                        <strong>Time:</strong> {new Date(earthquake.time).toLocaleString()}
                      </p>
                    )}
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        {earthquake.magnitude >= 7 ? '⚠️ Major earthquake - Significant damage possible' :
                         earthquake.magnitude >= 6 ? '⚠️ Strong earthquake - Damage possible' :
                         earthquake.magnitude >= 5 ? 'Moderate earthquake' : 'Minor earthquake'}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="map-view-footer">
          <p>Epicenter marked with concentric circles showing impact radius. Click marker for details.</p>
        </div>
      </div>
    </div>
  )
}

export default EarthquakeMapView
