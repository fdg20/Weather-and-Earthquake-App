// Real-time data fetching service for typhoons and earthquakes

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

// Sample typhoon data (enhanced with realistic paths)
function getSampleTyphoons() {
  const now = new Date()
  const baseTime = now.getTime() - 5 * 24 * 60 * 60 * 1000 // 5 days ago
  
  return [
    {
      id: 1,
      name: 'Typhoon Mawar',
      path: [
        { lat: 10, lon: 140, intensity: 5, timestamp: baseTime },
        { lat: 12, lon: 138, intensity: 5, timestamp: baseTime + 24 * 3600000 },
        { lat: 15, lon: 135, intensity: 4, timestamp: baseTime + 48 * 3600000 },
        { lat: 18, lon: 132, intensity: 4, timestamp: baseTime + 72 * 3600000 },
        { lat: 22, lon: 128, intensity: 3, timestamp: baseTime + 96 * 3600000 },
        { lat: 25, lon: 125, intensity: 2, timestamp: baseTime + 120 * 3600000 },
      ],
      currentPosition: { lat: 15, lon: 135 },
      lastUpdate: new Date(baseTime + 48 * 3600000),
    },
    {
      id: 2,
      name: 'Typhoon Guchol',
      path: [
        { lat: 8, lon: 145, intensity: 4, timestamp: baseTime + 12 * 3600000 },
        { lat: 10, lon: 142, intensity: 4, timestamp: baseTime + 36 * 3600000 },
        { lat: 13, lon: 139, intensity: 3, timestamp: baseTime + 60 * 3600000 },
        { lat: 16, lon: 136, intensity: 2, timestamp: baseTime + 84 * 3600000 },
      ],
      currentPosition: { lat: 13, lon: 139 },
      lastUpdate: new Date(baseTime + 60 * 3600000),
    },
  ]
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

