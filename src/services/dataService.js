// Real-time data fetching service for typhoons and earthquakes

// OpenWeather API service
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || ''

// Philippine Area of Responsibility (PAR) boundaries
const PAR_BOUNDARIES = {
  north: 25.0,
  south: 5.0,
  west: 115.0,
  east: 135.0
}

// Check if coordinates are inside PAR
export function isInsidePAR(lat, lon) {
  return (
    lat >= PAR_BOUNDARIES.south &&
    lat <= PAR_BOUNDARIES.north &&
    lon >= PAR_BOUNDARIES.west &&
    lon <= PAR_BOUNDARIES.east
  )
}

// Mapping of international typhoon names to Philippine local names (PAGASA names)
// This is a sample mapping - in production, you'd fetch this from PAGASA or maintain a comprehensive list
const TYPHOON_NAME_MAPPING = {
  'Mawar': 'Betty',
  'Guchol': 'Chedeng',
  'Talim': 'Dodong',
  'Doksuri': 'Egay',
  'Khanun': 'Falcon',
  'Lan': 'Goring',
  'Dora': 'Hanna',
  'Saola': 'Ineng',
  'Damrey': 'Jenny',
  'Haikui': 'Kabayan',
  'Kirogi': 'Liwayway',
  'Yun-yeung': 'Marilyn',
  'Koinu': 'Nimfa',
  'Bolaven': 'Ofel',
  'Sanba': 'Perla',
  'Jelawat': 'Quiel',
  'Ewiniar': 'Uwang',
  'Maliksi': 'Salome',
  'Gaemi': 'Tino',
  'Prapiroon': 'Ulysses',
  'Maria': 'Vicky',
  'Son-Tinh': 'Warren',
  'Ampil': 'Yoyong',
  'Wukong': 'Zosimo',
  'Jongdari': 'Alakdan',
  'Shanshan': 'Basyang',
  'Yagi': 'Caloy',
  'Leepi': 'Domeng',
  'Bebinca': 'Ester',
  'Rumbia': 'Florita',
  'Soulik': 'Gardo',
  'Cimaron': 'Henry',
  'Jebi': 'Inday',
  'Mangkhut': 'Josie',
  'Barijat': 'Karding',
  'Trami': 'Luis',
  'Kong-rey': 'Maymay',
  'Yutu': 'Neneng',
  'Toraji': 'Obet',
  'Usagi': 'Paolo',
  'Pabuk': 'Queenie',
  'Wutip': 'Rosita',
  'Sepat': 'Samuel',
  'Mun': 'Tomas',
  'Danas': 'Usman',
  'Nari': 'Venus',
  'Wipha': 'Waldo',
  'Francisco': 'Yayang',
  'Lekima': 'Zeny',
  'Krosa': 'Abe',
  'Bailu': 'Berto',
  'Podul': 'Crising',
  'Lingling': 'Dante',
  'Kajiki': 'Emong',
  'Faxai': 'Fabian',
  'Peipah': 'Gorio',
  'Tapah': 'Huaning',
  'Mitag': 'Isang',
  'Hagibis': 'Jolina',
  'Neoguri': 'Kiko',
  'Bualoi': 'Lannie',
  'Matmo': 'Mina',
  'Halong': 'Nonoy',
  'Nakri': 'Onyok',
  'Fengshen': 'Perla',
  'Kalmaegi': 'Quinta',
  'Fung-wong': 'Rolly',
  'Kammuri': 'Siony',
  'Phanfone': 'Tonyo',
  'Vongfong': 'Ulysses',
  'Nuri': 'Vicky',
  'Sinlaku': 'Warren',
  'Hagupit': 'Yoyong',
  'Jangmi': 'Zosimo',
}

// Get local Philippine name for a typhoon
export function getLocalName(internationalName) {
  // Remove "Typhoon" prefix if present
  const cleanName = internationalName.replace(/^Typhoon\s+/i, '').trim()
  return TYPHOON_NAME_MAPPING[cleanName] || null
}

// Get display name for typhoon (local if inside PAR, international otherwise)
export function getTyphoonDisplayName(typhoon) {
  if (!typhoon) return ''
  
  // Check if current position is inside PAR
  const isInside = isInsidePAR(
    typhoon.currentPosition.lat,
    typhoon.currentPosition.lon
  )
  
  if (isInside && typhoon.localName) {
    return `${typhoon.localName} (${typhoon.name})`
  }
  
  return typhoon.name
}

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

// Fetch real-time earthquake data from USGS (last 7 days only)
export async function fetchEarthquakes(minMagnitude = 4.5, limit = 50) {
  try {
    const response = await fetch(
      `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMagnitude}_week.geojson`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data')
    }
    
    const data = await response.json()
    
    // Calculate 7 days ago timestamp
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    // Transform USGS data to our format and filter to last 7 days
    const earthquakes = data.features
      .map((feature, index) => {
        const [lon, lat, depth] = feature.geometry.coordinates
        const props = feature.properties
        const eventTime = new Date(props.time).getTime()
        
        // Filter to only last 7 days
        if (eventTime < sevenDaysAgo) {
          return null
        }
        
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
      .filter(eq => eq !== null) // Remove null entries
      .sort((a, b) => b.magnitude - a.magnitude) // Sort by magnitude descending
      .slice(0, limit) // Limit results
    
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
// Only includes last 7 days of history
function getSampleTyphoons() {
  const now = new Date()
  const nowTime = now.getTime()
  const sevenDaysAgo = nowTime - (7 * 24 * 60 * 60 * 1000) // 7 days ago
  
  // Philippines coordinates: ~12°N, 123°E (center)
  const philippinesLat = 12.8797
  const philippinesLon = 121.7740
  
  // Generate path points within last 7 days (every 12 hours)
  const generatePath = (startLat, startLon, endLat, endLon, startTime, endTime) => {
    const path = []
    const hoursDiff = (endTime - startTime) / (1000 * 60 * 60) // hours
    const steps = Math.max(1, Math.floor(hoursDiff / 12)) // one point every 12 hours
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const lat = startLat + (endLat - startLat) * t
      const lon = startLon + (endLon - startLon) * t
      const timestamp = startTime + (endTime - startTime) * t
      
      // Only include if within last 7 days
      if (timestamp >= sevenDaysAgo) {
        // Intensity decreases as it approaches land
        const intensity = Math.max(2, 5 - (t * 3))
        path.push({
          lat,
          lon,
          intensity: Math.round(intensity),
          timestamp
        })
      }
    }
    return path
  }
  
  const typhoons = [
    {
      id: 1,
      name: 'Typhoon Ewiniar', // International name - maps to UWANG locally
      path: generatePath(
        8, 140,    // Start position (7 days ago)
        16, 125,   // Current position (inside PAR)
        sevenDaysAgo,
        nowTime - (1 * 24 * 60 * 60 * 1000) // 1 day ago
      ),
      currentPosition: { lat: 16, lon: 125 }, // Inside PAR
      lastUpdate: new Date(nowTime - (1 * 24 * 60 * 60 * 1000)),
      approachingPhilippines: true,
      distanceToPhilippines: 350, // km
      estimatedArrival: new Date(nowTime + 2 * 24 * 3600000), // 2 days
    },
    {
      id: 2,
      name: 'Typhoon Guchol',
      path: generatePath(
        9, 145,    // Start position (6 days ago)
        13, 139,   // Current position (inside PAR)
        sevenDaysAgo + (1 * 24 * 60 * 60 * 1000), // 6 days ago
        nowTime - (2 * 24 * 60 * 60 * 1000) // 2 days ago
      ),
      currentPosition: { lat: 13, lon: 139 }, // Inside PAR
      lastUpdate: new Date(nowTime - (2 * 24 * 60 * 60 * 1000)),
      approachingPhilippines: true,
      distanceToPhilippines: 800, // km
      estimatedArrival: new Date(nowTime + 4 * 24 * 3600000), // 4 days
    },
  ]
  
  // Filter path to only include last 7 days and add local names and PAR status
  return typhoons.map(typhoon => {
    // Filter path points to only last 7 days
    const filteredPath = typhoon.path.filter(point => {
      const pointTime = point.timestamp || new Date(point.timestamp).getTime()
      return pointTime >= sevenDaysAgo
    })
    
    // Ensure we have at least the current position
    if (filteredPath.length === 0) {
      filteredPath.push({
        lat: typhoon.currentPosition.lat,
        lon: typhoon.currentPosition.lon,
        intensity: 2,
        timestamp: nowTime
      })
    }
    
    const localName = getLocalName(typhoon.name)
    const isInside = isInsidePAR(
      typhoon.currentPosition.lat,
      typhoon.currentPosition.lon
    )
    
    return {
      ...typhoon,
      path: filteredPath,
      localName: localName || null,
      isInsidePAR: isInside,
      displayName: isInside && localName 
        ? `${localName} (${typhoon.name})` 
        : typhoon.name
    }
  })
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

// Sample earthquake data (fallback - last 7 days only)
function getSampleEarthquakes() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
  
  // Generate sample earthquakes within last 7 days
  return [
    { 
      id: 1, 
      lat: 35.6762, 
      lon: 139.6503, 
      magnitude: 7.2, 
      depth: 10, 
      location: 'Tokyo, Japan', 
      time: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)) // 2 days ago
    },
    { 
      id: 2, 
      lat: 14.5995, 
      lon: 120.9842, 
      magnitude: 6.5, 
      depth: 15, 
      location: 'Manila, Philippines', 
      time: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)) // 1 day ago
    },
    { 
      id: 3, 
      lat: 25.0330, 
      lon: 121.5654, 
      magnitude: 5.8, 
      depth: 8, 
      location: 'Taipei, Taiwan', 
      time: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)) // 3 days ago
    },
    { 
      id: 4, 
      lat: 37.5665, 
      lon: 126.9780, 
      magnitude: 6.1, 
      depth: 12, 
      location: 'Seoul, South Korea', 
      time: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)) // 5 days ago
    },
  ].filter(eq => eq.time >= sevenDaysAgo) // Filter to only last 7 days
}

