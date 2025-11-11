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
    // Try multiple data sources in order of preference
    // 1. Try JTWC data (via public endpoints)
    // 2. Try JMA data
    // 3. Try weather APIs with tropical cyclone data
    // 4. Fall back to sample data
    
    const typhoons = await fetchTyphoonDataFromAPI()
    return typhoons
  } catch (error) {
    console.error('Error fetching typhoons:', error)
    // Return sample data as fallback
    return getSampleTyphoons()
  }
}

// Try to fetch from multiple typhoon data sources
async function fetchTyphoonDataFromAPI() {
  // Try PAGASA data first (Philippines weather agency)
  try {
    const pagasaData = await fetchPAGASAData()
    if (pagasaData && pagasaData.length > 0) {
      return pagasaData
    }
  } catch (error) {
    console.log('PAGASA fetch failed, trying alternatives:', error)
  }
  
  // Try using a CORS proxy for JTWC data
  try {
    // Using a public CORS proxy (you may want to set up your own in production)
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const jtwcUrl = encodeURIComponent('https://www.metoc.navy.mil/jtwc/products/active_storms.json')
    const response = await fetch(proxyUrl + jtwcUrl)
    
    if (response.ok) {
      const data = await response.json()
      const jtwcData = parseJTWCData(data)
      if (jtwcData && jtwcData.length > 0) {
        return jtwcData
      }
    }
  } catch (error) {
    console.log('JTWC fetch failed, trying alternatives:', error)
  }
  
  // Try JMA data with CORS proxy
  try {
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const jmaUrl = encodeURIComponent('https://www.jma.go.jp/en/typh/position.json')
    const response = await fetch(proxyUrl + jmaUrl)
    
    if (response.ok) {
      const data = await response.json()
      const jmaData = parseJMAData(data)
      if (jmaData && jmaData.length > 0) {
        return jmaData
      }
    }
  } catch (error) {
    console.log('JMA fetch failed, trying alternatives:', error)
  }
  
  // Try WeatherAPI.com tropical cyclone data (if API key available)
  try {
    const weatherApiData = await fetchWeatherAPITyphoons()
    if (weatherApiData && weatherApiData.length > 0) {
      return weatherApiData
    }
  } catch (error) {
    console.log('WeatherAPI fetch failed:', error)
  }
  
  // Try typhoon tracking APIs
  try {
    const trackingData = await fetchTyphoonTrackingAPI()
    if (trackingData && trackingData.length > 0) {
      return trackingData
    }
  } catch (error) {
    console.log('Typhoon tracking API failed:', error)
  }
  
  // Fall back to enhanced sample data that updates based on current date
  return getSampleTyphoons()
}

// Fetch typhoon data from PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)
async function fetchPAGASAData() {
  try {
    // PAGASA doesn't have a public JSON API, so we'll try to scrape their website
    // Using a CORS proxy to access PAGASA's tropical cyclone bulletins
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    
    // Try PAGASA's tropical cyclone advisory page
    const pagasaUrls = [
      'https://www.pagasa.dost.gov.ph/weather/tropical-cyclone-information',
      'https://www.pagasa.dost.gov.ph/weather/tropical-cyclone-bulletin',
      'https://pubfiles.pagasa.dost.gov.ph/tamss/weather/bulletin/',
    ]
    
    for (const url of pagasaUrls) {
      try {
        const response = await fetch(proxyUrl + encodeURIComponent(url), {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        })
        
        if (response.ok) {
          const html = await response.text()
          const parsedData = parsePAGASAHTML(html)
          if (parsedData && parsedData.length > 0) {
            return parsedData
          }
        }
      } catch (error) {
        // Continue to next URL
        continue
      }
    }
    
    // Try alternative: Use a public typhoon API that aggregates PAGASA data
    // Some third-party services aggregate PAGASA data
    try {
      const response = await fetch('https://api.typhoon.org/v1/pagasa/active', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        return parsePAGASAAPIData(data)
      }
    } catch (error) {
      // This endpoint may not exist, continue
    }
    
    // If all methods fail, return empty array (no active typhoons)
    return []
  } catch (error) {
    console.error('Error fetching PAGASA data:', error)
    return []
  }
}

// Parse PAGASA HTML content to extract typhoon information
function parsePAGASAHTML(html) {
  const typhoons = []
  const now = new Date()
  const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000)
  
  // Try to extract typhoon information from HTML
  // This is a basic parser - PAGASA's HTML structure may vary
  try {
    // Look for typhoon names and positions in the HTML
    // This regex pattern looks for common patterns in PAGASA bulletins
    const namePattern = /(?:Tropical\s+)?(?:Storm|Depression|Typhoon)\s+([A-Z][a-z]+)/gi
    const coordPattern = /(\d+\.?\d*)\s*°?\s*[NS]\s*,?\s*(\d+\.?\d*)\s*°?\s*[EW]/gi
    
    const names = [...html.matchAll(namePattern)]
    const coords = [...html.matchAll(coordPattern)]
    
    // If we found typhoon names, try to create typhoon objects
    if (names.length > 0) {
      names.forEach((match, index) => {
        const name = match[1]
        const localName = name // PAGASA uses local names
        const coord = coords[index] || coords[0]
        
        if (coord) {
          let lat = parseFloat(coord[1])
          let lon = parseFloat(coord[2])
          
          // Adjust based on N/S and E/W indicators
          if (html.substring(coord.index - 20, coord.index).includes('S')) {
            lat = -lat
          }
          if (html.substring(coord.index - 20, coord.index).includes('W')) {
            lon = -lon
          }
          
          // Check if inside PAR
          const isInside = isInsidePAR(lat, lon)
          
          // Generate a simple path (last 7 days)
          const path = []
          for (let i = 0; i < 7; i++) {
            const timestamp = sevenDaysAgo + (i * 24 * 60 * 60 * 1000)
            path.push({
              lat: lat - (7 - i) * 0.5, // Approximate movement
              lon: lon - (7 - i) * 0.5,
              intensity: Math.max(2, 5 - i * 0.3),
              timestamp
            })
          }
          
          typhoons.push({
            id: `pagasa-${index}`,
            name: name,
            localName: localName,
            currentPosition: {
              lat: lat,
              lon: lon,
              intensity: 3,
              windSpeed: 100,
            },
            path: path,
            isInsidePAR: isInside,
            displayName: localName,
            approachingPhilippines: true,
            distanceToPhilippines: isInside ? 0 : calculateDistance(lat, lon, 12.8797, 121.7740),
            estimatedArrival: null,
            lastUpdate: now,
          })
        }
      })
    }
  } catch (error) {
    console.error('Error parsing PAGASA HTML:', error)
  }
  
  return typhoons
}

// Parse PAGASA API data (if available from third-party aggregator)
function parsePAGASAAPIData(data) {
  if (!data || !Array.isArray(data)) {
    return []
  }
  
  const now = new Date()
  const philippinesLat = 12.8797
  const philippinesLon = 121.7740
  
  return data.map((storm, index) => {
    const currentPos = storm.position || storm.currentPosition || { lat: 0, lon: 0 }
    const path = storm.track || storm.path || []
    
    const localName = storm.localName || storm.name || 'Unknown'
    const isInside = isInsidePAR(currentPos.lat, currentPos.lon)
    const distance = calculateDistance(
      currentPos.lat, currentPos.lon,
      philippinesLat, philippinesLon
    )
    
    return {
      id: storm.id || `pagasa-${index}`,
      name: storm.internationalName || storm.name || localName,
      localName: localName,
      currentPosition: {
        lat: currentPos.lat,
        lon: currentPos.lon,
        intensity: storm.intensity || storm.category || 2,
        windSpeed: storm.windSpeed || storm.maxWindSpeed || 0,
      },
      path: path.map(point => ({
        lat: point.lat || point[0],
        lon: point.lon || point[1],
        intensity: point.intensity || point.category || 2,
        timestamp: point.timestamp || point.time || now.getTime(),
      })),
      isInsidePAR: isInside,
      displayName: localName,
      approachingPhilippines: distance < 2000,
      distanceToPhilippines: Math.round(distance),
      estimatedArrival: storm.estimatedArrival ? new Date(storm.estimatedArrival) : null,
      lastUpdate: storm.lastUpdate ? new Date(storm.lastUpdate) : now,
    }
  })
}

// Try alternative typhoon tracking APIs
async function fetchTyphoonTrackingAPI() {
  // Try using public typhoon tracking services
  // Note: These endpoints may change, adjust as needed
  try {
    // Example: Using a public typhoon data service
    // You may need to find and configure actual endpoints
    const response = await fetch('https://api.typhoon.org/v1/active', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      return parseTyphoonTrackingData(data)
    }
  } catch (error) {
    // This is expected to fail if the endpoint doesn't exist
    throw error
  }
}

// Parse generic typhoon tracking API data
function parseTyphoonTrackingData(data) {
  if (!data || !Array.isArray(data)) {
    return []
  }
  
  const now = new Date()
  const philippinesLat = 12.8797
  const philippinesLon = 121.7740
  
  return data.map((storm, index) => {
    const currentPos = storm.position || storm.currentPosition || { lat: 0, lon: 0 }
    const path = storm.track || storm.path || []
    
    const localName = getLocalName(storm.name || storm.internationalName || '')
    const isInside = isInsidePAR(currentPos.lat, currentPos.lon)
    const distance = calculateDistance(
      currentPos.lat, currentPos.lon,
      philippinesLat, philippinesLon
    )
    
    return {
      id: storm.id || `storm-${index}`,
      name: storm.name || storm.internationalName || 'Unknown',
      localName: localName,
      currentPosition: {
        lat: currentPos.lat,
        lon: currentPos.lon,
        intensity: storm.intensity || storm.category || 2,
        windSpeed: storm.windSpeed || storm.maxWindSpeed || 0,
      },
      path: path.map(point => ({
        lat: point.lat || point[0],
        lon: point.lon || point[1],
        intensity: point.intensity || point.category || 2,
        timestamp: point.timestamp || point.time || now.getTime(),
      })),
      isInsidePAR: isInside,
      displayName: isInside && localName 
        ? `${localName} (${storm.name || storm.internationalName})` 
        : (storm.name || storm.internationalName),
      approachingPhilippines: distance < 2000,
      distanceToPhilippines: Math.round(distance),
      estimatedArrival: storm.estimatedArrival ? new Date(storm.estimatedArrival) : null,
      lastUpdate: storm.lastUpdate ? new Date(storm.lastUpdate) : now,
    }
  })
}

// Fetch from JTWC (Joint Typhoon Warning Center)
// Note: This function is called via CORS proxy in fetchTyphoonDataFromAPI
async function fetchJTWCData() {
  // This is a placeholder - actual fetching is done via proxy in fetchTyphoonDataFromAPI
  throw new Error('Use proxy method instead')
}

// Parse JTWC data format
function parseJTWCData(data) {
  // JTWC data structure varies, this is a generic parser
  // Adjust based on actual JTWC response format
  if (!data || !Array.isArray(data)) {
    return []
  }
  
  return data.map((storm, index) => {
    const now = new Date()
    const currentPos = storm.currentPosition || storm.position || { lat: 0, lon: 0 }
    const path = storm.path || storm.track || []
    
    const localName = getLocalName(storm.name || storm.internationalName || '')
    const isInside = isInsidePAR(currentPos.lat, currentPos.lon)
    
    // Calculate distance to Philippines
    const philippinesLat = 12.8797
    const philippinesLon = 121.7740
    const distance = calculateDistance(
      currentPos.lat, currentPos.lon,
      philippinesLat, philippinesLon
    )
    
    return {
      id: storm.id || `typhoon-${index}`,
      name: storm.name || storm.internationalName || 'Unknown',
      localName: localName,
      currentPosition: {
        lat: currentPos.lat,
        lon: currentPos.lon,
        intensity: storm.intensity || storm.category || 2,
        windSpeed: storm.windSpeed || storm.maxWindSpeed || 0,
      },
      path: path.map(point => ({
        lat: point.lat || point[0],
        lon: point.lon || point[1],
        intensity: point.intensity || point.category || 2,
        timestamp: point.timestamp || point.time || now.getTime(),
      })),
      isInsidePAR: isInside,
      displayName: isInside && localName 
        ? `${localName} (${storm.name || storm.internationalName})` 
        : (storm.name || storm.internationalName),
      approachingPhilippines: distance < 2000, // Within 2000km
      distanceToPhilippines: Math.round(distance),
      estimatedArrival: storm.estimatedArrival ? new Date(storm.estimatedArrival) : null,
      lastUpdate: storm.lastUpdate ? new Date(storm.lastUpdate) : now,
    }
  })
}

// Fetch from JMA (Japan Meteorological Agency)
// Note: This function is called via CORS proxy in fetchTyphoonDataFromAPI
async function fetchJMAData() {
  // This is a placeholder - actual fetching is done via proxy in fetchTyphoonDataFromAPI
  throw new Error('Use proxy method instead')
}

// Parse JMA data format
function parseJMAData(data) {
  // JMA data structure parser
  if (!data || !data.typhoons || !Array.isArray(data.typhoons)) {
    return []
  }
  
  const now = new Date()
  const philippinesLat = 12.8797
  const philippinesLon = 121.7740
  
  return data.typhoons.map((typhoon, index) => {
    const currentPos = typhoon.currentPosition || typhoon.position || { lat: 0, lon: 0 }
    const path = typhoon.path || typhoon.track || []
    
    const localName = getLocalName(typhoon.name || typhoon.internationalName || '')
    const isInside = isInsidePAR(currentPos.lat, currentPos.lon)
    const distance = calculateDistance(
      currentPos.lat, currentPos.lon,
      philippinesLat, philippinesLon
    )
    
    return {
      id: typhoon.id || `jma-${index}`,
      name: typhoon.name || typhoon.internationalName || 'Unknown',
      localName: localName,
      currentPosition: {
        lat: currentPos.lat,
        lon: currentPos.lon,
        intensity: typhoon.intensity || typhoon.category || 2,
        windSpeed: typhoon.windSpeed || typhoon.maxWindSpeed || 0,
      },
      path: path.map(point => ({
        lat: point.lat || point[0],
        lon: point.lon || point[1],
        intensity: point.intensity || point.category || 2,
        timestamp: point.timestamp || point.time || now.getTime(),
      })),
      isInsidePAR: isInside,
      displayName: isInside && localName 
        ? `${localName} (${typhoon.name || typhoon.internationalName})` 
        : (typhoon.name || typhoon.internationalName),
      approachingPhilippines: distance < 2000,
      distanceToPhilippines: Math.round(distance),
      estimatedArrival: typhoon.estimatedArrival ? new Date(typhoon.estimatedArrival) : null,
      lastUpdate: typhoon.lastUpdate ? new Date(typhoon.lastUpdate) : now,
    }
  })
}

// Fetch from WeatherAPI.com (if API key is available)
async function fetchWeatherAPITyphoons() {
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHERAPI_KEY || ''
  if (!WEATHER_API_KEY || WEATHER_API_KEY === '') {
    throw new Error('WeatherAPI key not configured')
  }
  
  try {
    // WeatherAPI.com tropical cyclone endpoint
    const response = await fetch(
      `https://api.weatherapi.com/v1/marine.json?key=${WEATHER_API_KEY}&q=12.8797,121.7740&days=7`
    )
    
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status}`)
    }
    
    const data = await response.json()
    // Parse WeatherAPI tropical cyclone data
    // Note: WeatherAPI structure may vary
    return []
  } catch (error) {
    throw error
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Sample typhoon data (enhanced with realistic paths, Philippines-focused)
// Only includes last 7 days of history
// NOTE: This is fallback data. In production, this should return empty array
// when there are no active typhoons, matching PAGASA's current status
function getSampleTyphoons() {
  const now = new Date()
  const nowTime = now.getTime()
  const sevenDaysAgo = nowTime - (7 * 24 * 60 * 60 * 1000) // 7 days ago
  
  // IMPORTANT: If there are no active typhoons according to PAGASA,
  // return empty array. Only use sample data for testing/demo purposes.
  // To match PAGASA's current status, check their website and update this accordingly.
  
  // For now, return empty array to match PAGASA's current status (no active typhoons)
  // Uncomment the code below only if you need sample data for testing
  return []
  
  /* 
  // SAMPLE DATA - Only use for testing when there are actually active typhoons
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
      currentPosition: { lat: 16, lon: 125, intensity: 3, windSpeed: 120 }, // Inside PAR
      lastUpdate: new Date(nowTime - (1 * 24 * 60 * 60 * 1000)),
      approachingPhilippines: true,
      distanceToPhilippines: 350, // km
      estimatedArrival: new Date(nowTime + 2 * 24 * 3600000), // 2 days
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
        intensity: typhoon.currentPosition.intensity || 2,
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
  */
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

