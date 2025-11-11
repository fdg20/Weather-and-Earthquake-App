import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
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

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    },
  })
  return null
}

// Component for draggable marker
function DraggableMarker({ position, onDragEnd }) {
  const [currentPosition, setCurrentPosition] = useState(position)

  const markerRef = React.useRef(null)

  useEffect(() => {
    setCurrentPosition(position)
  }, [position])

  const eventHandlers = {
    dragend: () => {
      const marker = markerRef.current
      if (marker != null) {
        const newPosition = marker.getLatLng()
        setCurrentPosition(newPosition)
        onDragEnd(newPosition.lat, newPosition.lng)
      }
    },
  }

  return (
    <Marker
      draggable={true}
      position={currentPosition}
      ref={markerRef}
      eventHandlers={eventHandlers}
      icon={L.divIcon({
        className: 'custom-draggable-marker',
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
          cursor: move;
        ">📍</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })}
    >
      <Popup>Drag to select location</Popup>
    </Marker>
  )
}

function MapPicker({ onLocationSelect, onClose, initialLat = null, initialLon = null }) {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setCurrentLocation({ lat, lon })
          setLocationError(null)
          const startPos = { lat: lat, lon: lon }
          setSelectedPosition(startPos)
          if (onLocationSelect) {
            onLocationSelect(lat, lon)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('Unable to get your location. Please select manually.')
          // Default to Philippines center if location access fails
          const defaultPos = { lat: initialLat || 12.8797, lon: initialLon || 121.7740 }
          setCurrentLocation(defaultPos)
          setSelectedPosition(defaultPos)
          if (onLocationSelect) {
            onLocationSelect(defaultPos.lat, defaultPos.lon)
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
      const defaultPos = { lat: initialLat || 12.8797, lon: initialLon || 121.7740 }
      setCurrentLocation(defaultPos)
      setSelectedPosition(defaultPos)
      if (onLocationSelect) {
        onLocationSelect(defaultPos.lat, defaultPos.lon)
      }
    }
  }, [initialLat, initialLon, onLocationSelect])

  const handleLocationSelect = (lat, lon) => {
    setSelectedPosition({ lat, lon })
    if (onLocationSelect) {
      onLocationSelect(lat, lon)
    }
  }

  if (!selectedPosition) {
    return <div>Loading map...</div>
  }

  const center = [selectedPosition.lat, selectedPosition.lon]

  return (
    <div className="map-view-overlay" onClick={onClose}>
      <div className="map-view-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="map-view-header">
          <h2>📍 Select Location on Map</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {locationError && (
          <div style={{ 
            padding: '12px 24px', 
            background: '#fff3cd', 
            color: '#856404',
            fontSize: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            ⚠️ {locationError}
          </div>
        )}
        {currentLocation && !locationError && (
          <div style={{ 
            padding: '8px 24px', 
            background: '#d4edda', 
            color: '#155724',
            fontSize: '13px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            📍 Showing your current location. Drag the red pin to adjust if needed.
          </div>
        )}
        <div style={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            
            <DraggableMarker
              position={center}
              onDragEnd={handleLocationSelect}
            />

            {currentLocation && !locationError && (
              <Marker
                position={[currentLocation.lat, currentLocation.lon]}
                icon={L.divIcon({
                  className: 'custom-current-location-marker',
                  html: `<div style="
                    width: 32px;
                    height: 32px;
                    background: #2196F3;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                  "></div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              >
                <Popup>
                  <div style={{ padding: '8px' }}>
                    <strong>Your Current Location</strong><br/>
                    {currentLocation.lat.toFixed(6)}°N, {currentLocation.lon.toFixed(6)}°E
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div className="map-view-footer">
          <p>Drag the red marker or click on the map to select your exact location where you need help</p>
        </div>
      </div>
    </div>
  )
}

export default MapPicker
