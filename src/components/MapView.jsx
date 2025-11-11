import React, { useEffect, useRef, useState } from 'react'
import WeatherCard from './WeatherCard'
import './MapView.css'

function MapView({ typhoon, onClose }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [showWeather, setShowWeather] = useState(true)

  useEffect(() => {
    if (!typhoon) return

    let script = null
    let timeoutId = null
    let isMounted = true
    
    // Define functions first
    function handleMapError() {
      console.error('Failed to load Google Maps. Please check your API key.')
      if (!isMounted || !mapRef.current) return
      
      // Show error message to user
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

    function initializeMap() {
      if (!isMounted || !mapRef.current || !typhoon || !window.google?.maps) return

      try {
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
            url: 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png',
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          },
          animation: window.google.maps.Animation.DROP
        })

        // Add InfoWindow for current position marker
        const currentInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 15px; min-width: 250px;">
              <h3 style="margin: 0 0 15px 0; color: #d32f2f; font-size: 18px;">
                🌀 ${typhoon.name}
              </h3>
              <div style="line-height: 1.8;">
                <p style="margin: 8px 0;"><strong>Current Position:</strong></p>
                <p style="margin: 8px 0;">Lat: ${typhoon.currentPosition.lat.toFixed(4)}°</p>
                <p style="margin: 8px 0;">Lon: ${typhoon.currentPosition.lon.toFixed(4)}°</p>
                <p style="margin: 8px 0;"><strong>Intensity:</strong> Category ${typhoon.currentPosition.intensity || typhoon.path[typhoon.path.length - 1]?.intensity || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Wind Speed:</strong> ${typhoon.currentPosition.windSpeed || 'N/A'} km/h</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #d32f2f;">Active</span></p>
              </div>
            </div>
          `
        })

        // Open InfoWindow automatically for current position
        currentInfoWindow.open(map, currentMarker)

        // Add click listener to reopen InfoWindow
        currentMarker.addListener('click', () => {
          currentInfoWindow.open(map, currentMarker)
        })

        // Fit bounds to show entire path
        const bounds = new window.google.maps.LatLngBounds()
        pathCoordinates.forEach(coord => bounds.extend(coord))
        bounds.extend({ lat: typhoon.currentPosition.lat, lng: typhoon.currentPosition.lon })
        map.fitBounds(bounds)
      } catch (error) {
        console.error('Error initializing map:', error)
        if (isMounted) handleMapError()
      }
    }

    // Initialize Google Maps
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Google Maps API key not configured')
      handleMapError()
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      // Maps already loaded, initialize immediately
      initializeMap()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Script exists, wait for it to load
      const onLoad = () => {
        if (isMounted) initializeMap()
      }
      const onError = () => {
        if (isMounted) handleMapError()
      }
      
      if (existingScript.dataset.loaded === 'true') {
        // Script already loaded
        initializeMap()
      } else {
        existingScript.addEventListener('load', onLoad)
        existingScript.addEventListener('error', onError)
      }
      
      return () => {
        existingScript.removeEventListener('load', onLoad)
        existingScript.removeEventListener('error', onError)
      }
    }
    
    // Create and load script
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
      if (isMounted) handleMapError()
    }
    
    document.head.appendChild(script)
    
    // Timeout after 10 seconds
    timeoutId = setTimeout(() => {
      if (isMounted && (!window.google || !window.google.maps)) {
        handleMapError()
      }
    }, 10000)

    return () => {
      isMounted = false
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
        {showWeather && typhoon && (
          <div className="map-weather-container">
            <WeatherCard 
              lat={typhoon.currentPosition.lat} 
              lon={typhoon.currentPosition.lon}
              cityName={`${typhoon.name} Location`}
            />
          </div>
        )}
        <div className="map-view-footer">
          <p>Click on markers to see details. Use controls to switch between map and satellite view.</p>
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

