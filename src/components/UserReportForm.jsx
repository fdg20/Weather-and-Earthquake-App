import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './UserReportForm.css'

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

function UserReportForm({ onClose, onSubmit, onLocationSelect }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    provider: '',
    issueType: '',
    description: '',
    image: null,
    imagePreview: null,
    lat: null,
    lon: null,
  })

  const [mapCenter, setMapCenter] = useState([12.8797, 121.7740]) // Default to Philippines center
  const [locationError, setLocationError] = useState(null)

  const providers = [
    'PLDT',
    'Globe',
    'Smart',
    'Converge',
    'DITO',
    'Other'
  ]

  const issueTypes = [
    'No Electricity',
    'No Internet',
    'Both No Electricity & Internet',
    'Damaged Infrastructure',
    'Flooding',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setMapCenter([lat, lon])
          setLocationError(null)
          // Auto-select current location if not already set
          setFormData(prev => {
            if (!prev.lat || !prev.lon) {
              return {
                ...prev,
                lat,
                lon
              }
            }
            return prev
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('Unable to get your location. Please select manually on the map.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
    }
  }, [])

  const handleMapLocationSelect = (lat, lon) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lon
    }))
    setLocationError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.address || !formData.issueType) {
      alert('Please fill in all required fields')
      return
    }
    if (onSubmit) {
      onSubmit(formData)
      // Reset form
      setFormData({
        name: '',
        address: '',
        provider: '',
        issueType: '',
        description: '',
        image: null,
        imagePreview: null,
        lat: null,
        lon: null,
      })
      onClose()
    }
  }

  return (
    <div className="report-form-overlay" onClick={onClose}>
      <div className="report-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="report-form-header">
          <h2>📋 Report Issue (Philippines)</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Full address in Philippines"
            />
          </div>

          <div className="form-group">
            <label htmlFor="issueType">Issue Type *</label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select issue type</option>
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="provider">Service Provider</label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
            >
              <option value="">Select provider (if applicable)</option>
              {providers.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Additional details about the issue..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            {formData.imagePreview && (
              <div className="image-preview">
                <img src={formData.imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                  className="remove-image-btn"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>📍 Pin Location on Map</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Click on the map below to select your precise location
            </p>
            {locationError && (
              <div style={{ 
                padding: '8px', 
                background: '#fff3cd', 
                color: '#856404',
                fontSize: '12px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                ⚠️ {locationError}
              </div>
            )}
            {formData.lat && formData.lon && (
              <div style={{ 
                padding: '8px', 
                background: '#d4edda', 
                color: '#155724',
                fontSize: '12px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                ✓ Selected: {formData.lat.toFixed(6)}°N, {formData.lon.toFixed(6)}°E
              </div>
            )}
            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #ddd' }}>
              <MapContainer
                center={formData.lat && formData.lon ? [formData.lat, formData.lon] : mapCenter}
                zoom={formData.lat && formData.lon ? 15 : 6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                
                {formData.lat && formData.lon && (
                  <Marker
                    position={[formData.lat, formData.lon]}
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
                        cursor: pointer;
                      ">📍</div>`,
                      iconSize: [40, 40],
                      iconAnchor: [20, 40],
                    })}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserReportForm

