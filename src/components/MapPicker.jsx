import React, { useEffect, useRef, useState } from 'react'
import './MapView.css'

function MapPicker({ onLocationSelect, onClose, initialLat = null, initialLon = null }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setCurrentLocation({ lat, lon })
          setLocationError(null)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('Unable to get your location. Please select manually.')
          // Default to Philippines center if location access fails
          setCurrentLocation({ lat: 12.8797, lon: 121.7740 })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
      setCurrentLocation({ lat: initialLat || 12.8797, lon: initialLon || 121.7740 })
    }
  }, [])

  useEffect(() => {
    let script = null
    let timeoutId = null

    function initializeMap() {
      if (!mapRef.current) return

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'

      // Use current location if available, otherwise use initial or default
      const startLat = currentLocation?.lat || initialLat || 12.8797
      const startLon = currentLocation?.lon || initialLon || 121.7740

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15, // Higher zoom for better location visualization
        center: { lat: startLat, lng: startLon },
        mapTypeId: 'satellite', // Satellite view like Google Earth
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // Create draggable marker
      const marker = new window.google.maps.Marker({
        position: { lat: startLat, lng: startLon },
        map: map,
        draggable: true,
        title: 'Drag to select location',
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png',
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        }
      })

      markerRef.current = marker

      // Add current location marker if available
      if (currentLocation && !locationError) {
        const currentLocationMarker = new window.google.maps.Marker({
          position: { lat: currentLocation.lat, lng: currentLocation.lon },
          map: map,
          title: 'Your Current Location',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          },
          animation: window.google.maps.Animation.BOUNCE
        })

        // Show info window for current location
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>Your Current Location</strong><br/>
              ${currentLocation.lat.toFixed(6)}°N, ${currentLocation.lon.toFixed(6)}°E
            </div>
          `
        })
        infoWindow.open(map, currentLocationMarker)
      }

      // Update location when marker is dragged
      marker.addListener('dragend', () => {
        const position = marker.getPosition()
        if (onLocationSelect) {
          onLocationSelect(position.lat(), position.lng())
        }
      })

      // Also allow clicking on map to set location
      map.addListener('click', (e) => {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        marker.setPosition({ lat, lng })
        if (onLocationSelect) {
          onLocationSelect(lat, lng)
        }
      })

      // Initial callback
      if (onLocationSelect) {
        onLocationSelect(startLat, startLon)
      }
    }

    // Only initialize map when we have a location (current or default)
    if (!currentLocation) return

    let isMounted = true
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Google Maps API key not configured')
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      const onLoad = () => {
        if (isMounted) initializeMap()
      }
      
      if (existingScript.dataset.loaded === 'true') {
        initializeMap()
      } else {
        existingScript.addEventListener('load', onLoad)
      }
      
      return () => {
        existingScript.removeEventListener('load', onLoad)
        isMounted = false
      }
    }
    
    script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (script) script.dataset.loaded = 'true'
      clearTimeout(timeoutId)
      if (isMounted) initializeMap()
    }
    
    script.onerror = () => {
      clearTimeout(timeoutId)
      console.error('Failed to load Google Maps')
    }
    
    document.head.appendChild(script)
    
    timeoutId = setTimeout(() => {
      if (isMounted && (!window.google || !window.google.maps)) {
        console.error('Failed to load Google Maps - timeout')
      }
    }, 10000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (script) {
        script.onload = null
        script.onerror = null
      }
    }
  }, [currentLocation, initialLat, initialLon, onLocationSelect, locationError])

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
        {currentLocation && (
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
        <div ref={mapRef} className="map-view-content" style={{ height: '500px' }} />
        <div className="map-view-footer">
          <p>Drag the red marker or click on the map to select your exact location where you need help</p>
        </div>
      </div>
    </div>
  )
}

export default MapPicker

