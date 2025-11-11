import React, { useState } from 'react'
import './UserReportForm.css'

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

  const [showMapPicker, setShowMapPicker] = useState(false)

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

  const handleMapClick = () => {
    if (onLocationSelect) {
      onLocationSelect((lat, lon) => {
        setFormData(prev => ({
          ...prev,
          lat,
          lon
        }))
      })
    }
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
            <label>Pin Location on Map</label>
            <button
              type="button"
              onClick={handleMapClick}
              className="map-picker-button"
            >
              📍 {formData.lat && formData.lon 
                ? `Location: ${formData.lat.toFixed(4)}°N, ${formData.lon.toFixed(4)}°E`
                : 'Click to Select Location on Map'}
            </button>
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

