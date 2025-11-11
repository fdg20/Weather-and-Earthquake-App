import React, { useEffect, useRef } from 'react'
import './MapView.css'

function EarthquakeMapView({ earthquake, onClose }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    let script = null
    let timeoutId = null
    
    // Define functions first
    function handleMapError() {
      console.error('Failed to load Google Maps. Please check your API key.')
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; color: #fff;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h3 style="margin: 0 0 10px 0;">Google Maps Failed to Load</h3>
            <p style="margin: 0 0 20px 0; color: #ccc;">
              Please check your API key in the .env file.<br/>
              Make sure VITE_GOOGLE_MAPS_API_KEY is set correctly.
            </p>
          </div>
        `
      }
    }

    function initializeMap() {
      if (!mapRef.current || !earthquake) return

      // Center map on earthquake location
      const center = {
        lat: earthquake.lat,
        lng: earthquake.lon
      }

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: earthquake.magnitude >= 7 ? 8 : earthquake.magnitude >= 6 ? 9 : 10,
        center: center,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      mapInstanceRef.current = map

      // Create earthquake epicenter marker with custom icon
      const epicenterMarker = new window.google.maps.Marker({
        position: center,
        map: map,
        title: `Earthquake M${earthquake.magnitude.toFixed(1)} - ${earthquake.location}`,
        animation: window.google.maps.Animation.DROP,
      })

      // Create custom earthquake icon (red circle with pulsing effect)
      const iconSize = Math.min(30 + earthquake.magnitude * 5, 80)
      const iconColor = earthquake.magnitude >= 7 ? '#FF0000' : 
                       earthquake.magnitude >= 6 ? '#FF6600' : 
                       earthquake.magnitude >= 5 ? '#FFAA00' : '#FFFF00'
      
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: iconSize / 2,
        fillColor: iconColor,
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      }
      
      epicenterMarker.setIcon(icon)

      // Create concentric circles for earthquake/volcanic effect
      const circleColors = [
        { color: iconColor, opacity: 0.3, radius: 50000 },
        { color: iconColor, opacity: 0.2, radius: 100000 },
        { color: iconColor, opacity: 0.1, radius: 150000 },
      ]

      circleColors.forEach((circleData, index) => {
        const circle = new window.google.maps.Circle({
          strokeColor: circleData.color,
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: circleData.color,
          fillOpacity: circleData.opacity,
          map: map,
          center: center,
          radius: circleData.radius * (earthquake.magnitude / 5), // Scale based on magnitude
        })
      })

      // Add fault line visualization (if it's a tectonic earthquake)
      if (earthquake.magnitude >= 6) {
        const faultLine = new window.google.maps.Polyline({
          path: [
            { lat: earthquake.lat - 0.1, lng: earthquake.lon - 0.1 },
            { lat: earthquake.lat, lng: earthquake.lon },
            { lat: earthquake.lat + 0.1, lng: earthquake.lon + 0.1 },
          ],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 0.6,
          strokeWeight: 3,
        })
        faultLine.setMap(map)
      }

      // Info window with earthquake details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 15px; min-width: 250px;">
            <h3 style="margin: 0 0 15px 0; color: ${iconColor}; font-size: 18px;">
              🌍 Earthquake Details
            </h3>
            <div style="line-height: 1.8;">
              <p style="margin: 8px 0;"><strong>Magnitude:</strong> <span style="color: ${iconColor}; font-size: 16px; font-weight: bold;">M${earthquake.magnitude.toFixed(1)}</span></p>
              <p style="margin: 8px 0;"><strong>Location:</strong> ${earthquake.location}</p>
              <p style="margin: 8px 0;"><strong>Depth:</strong> ${earthquake.depth} km</p>
              <p style="margin: 8px 0;"><strong>Coordinates:</strong><br/>
                ${earthquake.lat.toFixed(4)}°N, ${earthquake.lon.toFixed(4)}°E</p>
              ${earthquake.time ? `<p style="margin: 8px 0;"><strong>Time:</strong> ${new Date(earthquake.time).toLocaleString()}</p>` : ''}
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  ${earthquake.magnitude >= 7 ? '⚠️ Major earthquake - Significant damage possible' :
                    earthquake.magnitude >= 6 ? '⚠️ Strong earthquake - Damage possible' :
                    earthquake.magnitude >= 5 ? 'Moderate earthquake' : 'Minor earthquake'}
                </p>
              </div>
            </div>
          </div>
        `
      })

      infoWindow.open(map, epicenterMarker)

      // Add click listener to marker
      epicenterMarker.addListener('click', () => {
        infoWindow.open(map, epicenterMarker)
      })

      // Add volcanic activity visualization if magnitude is high
      if (earthquake.magnitude >= 6.5) {
        // Create a volcanic-like cone visualization using a polygon
        const volcanicCone = new window.google.maps.Polygon({
          paths: [
            { lat: earthquake.lat + 0.05, lng: earthquake.lon },
            { lat: earthquake.lat + 0.02, lng: earthquake.lon + 0.03 },
            { lat: earthquake.lat, lng: earthquake.lon },
            { lat: earthquake.lat + 0.02, lng: earthquake.lon - 0.03 },
          ],
          strokeColor: '#8B4513',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#8B4513',
          fillOpacity: 0.3,
        })
        volcanicCone.setMap(map)
      }
    }

    // Initialize Google Maps
    if (!window.google || !window.google.maps) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'
      
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
      
      timeoutId = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          handleMapError()
        }
      }, 10000)
    } else {
      initializeMap()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (script) {
        script.onload = null
        script.onerror = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [earthquake])

  if (!earthquake) return null

  return (
    <div className="map-view-overlay" onClick={onClose}>
      <div className="map-view-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-view-header">
          <h2>🌍 {earthquake.location} - Earthquake M{earthquake.magnitude.toFixed(1)}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div ref={mapRef} className="map-view-content" />
        <div className="map-view-footer">
          <p>Epicenter marked with concentric circles showing impact radius. Click marker for details.</p>
        </div>
      </div>
    </div>
  )
}

export default EarthquakeMapView

