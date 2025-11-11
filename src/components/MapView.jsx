import React, { useEffect, useRef } from 'react'
import './MapView.css'

function MapView({ typhoon, onClose }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    let script = null
    let timeoutId = null
    
    // Define functions first
    function handleMapError() {
      console.error('Failed to load Google Maps. Please check your API key.')
      // Show error message to user
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; color: #fff;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h3 style="margin: 0 0 10px 0;">Google Maps Failed to Load</h3>
            <p style="margin: 0 0 20px 0; color: #ccc;">
              Please check your API key in the .env file.<br/>
              Make sure VITE_GOOGLE_MAPS_API_KEY is set correctly.
            </p>
            <p style="margin: 0; font-size: 12px; color: #888;">
              Get your API key at: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" style="color: #4ecdc4;">Google Cloud Console</a>
            </p>
          </div>
        `
      }
    }

    function initializeMap() {
      if (!mapRef.current || !typhoon) return

      // Center map on typhoon's current position
      const center = {
        lat: typhoon.currentPosition.lat,
        lng: typhoon.currentPosition.lon
      }

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: center,
        mapTypeId: 'satellite', // Use satellite view like Google Earth
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      mapInstanceRef.current = map

      // Draw typhoon path
      const pathCoordinates = typhoon.path.map(point => ({
        lat: point.lat,
        lng: point.lon
      }))

      // Create polyline for typhoon path
      const pathPolyline = new window.google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: '#FF0000'
          },
          offset: '100%',
          repeat: '100px'
        }]
      })

      pathPolyline.setMap(map)

      // Add markers for each point in the path
      typhoon.path.forEach((point, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lon },
          map: map,
          title: `${typhoon.name} - Point ${index + 1} (Intensity: ${point.intensity})`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 5 + point.intensity,
            fillColor: point.intensity >= 4 ? '#FF0000' : point.intensity >= 3 ? '#FF8800' : '#FFFF00',
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0;">${typhoon.name}</h3>
              <p style="margin: 5px 0;"><strong>Point ${index + 1}</strong></p>
              <p style="margin: 5px 0;">Lat: ${point.lat.toFixed(2)}°</p>
              <p style="margin: 5px 0;">Lon: ${point.lon.toFixed(2)}°</p>
              <p style="margin: 5px 0;">Intensity: Category ${point.intensity}</p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      })

      // Add current position marker
      const currentMarker = new window.google.maps.Marker({
        position: {
          lat: typhoon.currentPosition.lat,
          lng: typhoon.currentPosition.lon
        },
        map: map,
        title: `${typhoon.name} - Current Position`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        animation: window.google.maps.Animation.BOUNCE
      })

      // Fit bounds to show entire path
      const bounds = new window.google.maps.LatLngBounds()
      pathCoordinates.forEach(coord => bounds.extend(coord))
      map.fitBounds(bounds)
    }

    // Initialize Google Maps
    if (!window.google || !window.google.maps) {
      // Load Google Maps script if not already loaded
      // IMPORTANT: Replace with your own Google Maps API key
      // Get one at: https://console.cloud.google.com/google/maps-apis
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.addEventListener('load', initializeMap)
        existingScript.addEventListener('error', handleMapError)
        return () => {
          existingScript.removeEventListener('load', initializeMap)
          existingScript.removeEventListener('error', handleMapError)
        }
      }
      
      script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        clearTimeout(timeoutId)
        initializeMap()
      }
      
      script.onerror = () => {
        clearTimeout(timeoutId)
        handleMapError()
      }
      
      document.head.appendChild(script)
      
      // Timeout after 10 seconds
      timeoutId = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          handleMapError()
        }
      }, 10000)
    } else {
      // Maps already loaded
      initializeMap()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (script) {
        script.onload = null
        script.onerror = null
      }
      // Cleanup map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [typhoon])

  if (!typhoon) return null

  return (
    <div className="map-view-overlay" onClick={onClose}>
      <div className="map-view-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-view-header">
          <h2>{typhoon.name} - Path Visualization</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div ref={mapRef} className="map-view-content" />
        <div className="map-view-footer">
          <p>Click on markers to see details. Use controls to switch between map and satellite view.</p>
        </div>
      </div>
    </div>
  )
}

export default MapView

