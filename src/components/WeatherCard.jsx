import React, { useState, useEffect } from 'react'
import { fetchWeatherData, fetchWeatherForecast } from '../services/dataService'
import './WeatherCard.css'

function WeatherCard({ lat, lon, cityName }) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let timeoutId = null
    
    const loadWeather = async () => {
      setLoading(true)
      setError(null)
      
      // Add timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        setLoading(false)
        setError('Weather data request timed out')
      }, 10000) // 10 second timeout
      
      try {
        const [currentWeather, forecastData] = await Promise.all([
          fetchWeatherData(lat, lon),
          fetchWeatherForecast(lat, lon)
        ])
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        // Check if API key is configured
        if (currentWeather === null && !import.meta.env.VITE_OPENWEATHER_API_KEY) {
          setError('OpenWeather API key not configured')
          setLoading(false)
          return
        }
        
        setWeather(currentWeather)
        setForecast(forecastData)
      } catch (err) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        setError('Failed to load weather data')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (lat && lon) {
      loadWeather()
    } else {
      setLoading(false)
    }
    
    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      setLoading(false)
    }
  }, [lat, lon])

  if (loading) {
    return (
      <div className="weather-card">
        <div className="weather-loading">Loading weather data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="weather-card">
        <div className="weather-error">
          <p>⚠️ {error}</p>
          {error.includes('API key') && (
            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
              Please configure VITE_OPENWEATHER_API_KEY in your .env file
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!weather) {
    return null // Don't show card if no weather data
  }

  const getWeatherIconUrl = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h3>🌤️ Weather Conditions</h3>
        <div className="weather-location">
          {weather.city || cityName || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`}
        </div>
      </div>

      <div className="weather-main">
        <div className="weather-icon-temp">
          <img 
            src={getWeatherIconUrl(weather.icon)} 
            alt={weather.description}
            className="weather-icon"
          />
          <div className="weather-temp">
            <span className="temp-value">{weather.temperature}°</span>
            <span className="temp-unit">C</span>
          </div>
        </div>
        <div className="weather-description">
          {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
        </div>
        <div className="weather-feels-like">
          Feels like {weather.feelsLike}°C
        </div>
      </div>

      <div className="weather-details">
        <div className="weather-detail-item">
          <span className="detail-label">💨 Wind</span>
          <span className="detail-value">
            {weather.windSpeed} km/h {getWindDirection(weather.windDirection)}
          </span>
        </div>
        <div className="weather-detail-item">
          <span className="detail-label">💧 Humidity</span>
          <span className="detail-value">{weather.humidity}%</span>
        </div>
        <div className="weather-detail-item">
          <span className="detail-label">📊 Pressure</span>
          <span className="detail-value">{weather.pressure} hPa</span>
        </div>
        {weather.visibility && (
          <div className="weather-detail-item">
            <span className="detail-label">👁️ Visibility</span>
            <span className="detail-value">{weather.visibility} km</span>
          </div>
        )}
        <div className="weather-detail-item">
          <span className="detail-label">☁️ Cloudiness</span>
          <span className="detail-value">{weather.cloudiness}%</span>
        </div>
      </div>

      {forecast && forecast.length > 0 && (
        <div className="weather-forecast">
          <h4>5-Hour Forecast</h4>
          <div className="forecast-list">
            {forecast.map((item, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-time">
                  {item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <img 
                  src={getWeatherIconUrl(item.icon)} 
                  alt={item.description}
                  className="forecast-icon"
                />
                <div className="forecast-temp">{item.temperature}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherCard

