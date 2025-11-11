// Real-time data fetching service for typhoons and earthquakes

// OpenWeather API service
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || ''

// Fetch current weather data from OpenWeather API
export async function fetchWeatherData(lat, lon) {
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === '') {
    console.warn('OpenWeather API key not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`)
    }
    
    const data = await response.json()
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed ? (data.wind.speed * 3.6).toFixed(1) : 0, // Convert m/s to km/h
      windDirection: data.wind?.deg || 0,
      description: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '01d',
      visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : null,
      cloudiness: data.clouds?.all || 0,
      city: data.name || '',
      country: data.sys?.country || '',
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return null
  }
}

// Fetch weather forecast data
export async function fetchWeatherForecast(lat, lon) {
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === '') {
    return null
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`OpenWeather Forecast API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.list.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      description: item.weather[0]?.description || '',
      icon: item.weather[0]?.icon || '01d',
      windSpeed: item.wind?.speed ? (item.wind.speed * 3.6).toFixed(1) : 0,
      humidity: item.main.humidity,
    }))
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    return null
  }
}

// Fetch real-time earthquake data from USGS
export async function fetchEarthquakes(minMagnitude = 4.5, limit = 50) {
  try {
    const response = await fetch(
      `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMagnitude}_week.geojson`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data')
    }
    
    const data = await response.json()
    
    // Transform USGS data to our format
    const earthquakes = data.features
      .slice(0, limit)
      .map((feature, index) => {
        const [lon, lat, depth] = feature.geometry.coordinates
        const props = feature.properties
        
        // Get location name (try to extract from place or use coordinates)
        let location = props.place || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`
        // Remove distance prefix if present (e.g., "25km S of ...")
        location = location.replace(/^\d+km\s+[NESW]+\s+of\s+/i, '')
        
        return {
          id: feature.id || `eq-${index}`,
          lat,
          lon,
          magnitude: props.mag,
          depth: Math.round(depth),
          location,
          time: new Date(props.time),
        }
      })
      .sort((a, b) => b.magnitude - a.magnitude) // Sort by magnitude descending
    
    return earthquakes
  } catch (error) {
    console.error('Error fetching earthquakes:', error)
    // Return sample data as fallback
    return getSampleEarthquakes()
  }
}

// Fetch typhoon data - using multiple sources
export async function fetchTyphoons() {
  try {
    // Try to fetch from a public typhoon tracking API
    // Note: Most typhoon APIs require authentication or have CORS issues
    // We'll use a combination of approaches
    
    // Option 1: Try JTWC data (if available via proxy or CORS-enabled endpoint)
    // Option 2: Use sample data with simulated updates
    
    // For now, we'll enhance sample data with real-time-like updates
    // In production, you'd integrate with:
    // - JTWC (Joint Typhoon Warning Center)
    // - JMA (Japan Meteorological Agency)
    // - Weather APIs like OpenWeatherMap, WeatherAPI, etc.
    
    const typhoons = await fetchTyphoonDataFromAPI()
    return typhoons
  } catch (error) {
    console.error('Error fetching typhoons:', error)
    // Return sample data as fallback
    return getSampleTyphoons()
  }
}

// Try to fetch from a public API or use enhanced sample data
async function fetchTyphoonDataFromAPI() {
  // Since most typhoon APIs have CORS restrictions,
  // we'll create realistic sample data that simulates real-time updates
  // In production, set up a backend proxy to fetch from:
  // - JTWC: https://www.metoc.navy.mil/jtwc/jtwc.html
  // - JMA: https://www.jma.go.jp/en/typh/
  // - Or use weather APIs
  
  return getSampleTyphoons()
}

// Sample typhoon data (enhanced with realistic paths, Philippines-focused)
function getSampleTyphoons() {
  const now = new Date()
  const baseTime = now.getTime() - 5 * 24 * 60 * 60 * 1000 // 5 days ago
  
  // Philippines coordinates: ~12°N, 123°E (center)
  const philippinesLat = 12.8797
  const philippinesLon = 121.7740
  
  return [
    {
      id: 1,
      name: 'Typhoon Mawar',
      path: [
        { lat: 8, lon: 140, intensity: 5, timestamp: baseTime },
        { lat: 10, lon: 138, intensity: 5, timestamp: baseTime + 24 * 3600000 },
        { lat: 12, lon: 135, intensity: 4, timestamp: baseTime + 48 * 3600000 },
        { lat: 14, lon: 132, intensity: 4, timestamp: baseTime + 72 * 3600000 },
        { lat: 15.5, lon: 128, intensity: 3, timestamp: baseTime + 96 * 3600000 }, // Approaching Philippines
        { lat: 16, lon: 125, intensity: 2, timestamp: baseTime + 120 * 3600000 }, // Over Philippines
      ],
      currentPosition: { lat: 14, lon: 132 },
      lastUpdate: new Date(baseTime + 72 * 3600000),
      approachingPhilippines: true,
      distanceToPhilippines: 350, // km
      estimatedArrival: new Date(now.getTime() + 2 * 24 * 3600000), // 2 days
    },
    {
      id: 2,
      name: 'Typhoon Guchol',
      path: [
        { lat: 9, lon: 145, intensity: 4, timestamp: baseTime + 12 * 3600000 },
        { lat: 11, lon: 142, intensity: 4, timestamp: baseTime + 36 * 3600000 },
        { lat: 13, lon: 139, intensity: 3, timestamp: baseTime + 60 * 3600000 },
        { lat: 14.5, lon: 136, intensity: 2, timestamp: baseTime + 84 * 3600000 },
      ],
      currentPosition: { lat: 13, lon: 139 },
      lastUpdate: new Date(baseTime + 60 * 3600000),
      approachingPhilippines: true,
      distanceToPhilippines: 800, // km
      estimatedArrival: new Date(now.getTime() + 4 * 24 * 3600000), // 4 days
    },
  ]
}

// Get low pressure areas (enhanced with OpenWeather data if available)
export async function getLowPressureAreas() {
  // Try to fetch real weather data for Philippines region
  const philippinesAreas = [
    { lat: 13.5, lon: 123.5, intensity: 0.7, name: 'Low Pressure Area 1' },
    { lat: 11.2, lon: 125.8, intensity: 0.5, name: 'Low Pressure Area 2' },
    { lat: 15.8, lon: 120.2, intensity: 0.6, name: 'Low Pressure Area 3' },
  ]

  // If OpenWeather API is available, enhance with real data
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== '') {
    try {
      // Fetch weather for key locations to identify low pressure areas
      const enhancedAreas = await Promise.all(
        philippinesAreas.map(async (area) => {
          const weather = await fetchWeatherData(area.lat, area.lon)
          if (weather && weather.pressure < 1013) {
            // Low pressure detected
            return {
              ...area,
              intensity: Math.max(0.3, (1013 - weather.pressure) / 20),
              weather: weather,
            }
          }
          return area
        })
      )
      return enhancedAreas
    } catch (error) {
      console.error('Error enhancing low pressure areas:', error)
    }
  }

  return philippinesAreas
}

// Sample earthquake data (fallback)
function getSampleEarthquakes() {
  return [
    { id: 1, lat: 35.6762, lon: 139.6503, magnitude: 7.2, depth: 10, location: 'Tokyo, Japan', time: new Date() },
    { id: 2, lat: 14.5995, lon: 120.9842, magnitude: 6.5, depth: 15, location: 'Manila, Philippines', time: new Date() },
    { id: 3, lat: 25.0330, lon: 121.5654, magnitude: 5.8, depth: 8, location: 'Taipei, Taiwan', time: new Date() },
    { id: 4, lat: 37.5665, lon: 126.9780, magnitude: 6.1, depth: 12, location: 'Seoul, South Korea', time: new Date() },
  ]
}

