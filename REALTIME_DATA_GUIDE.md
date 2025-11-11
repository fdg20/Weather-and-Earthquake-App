# Real-Time Typhoon and Earthquake Data Guide

## Current Implementation Status

### ✅ Earthquakes - WORKING
The app currently uses **USGS (United States Geological Survey)** API which is **FREE and reliable**:
- **API Endpoint**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{magnitude}_week.geojson`
- **Status**: ✅ Already implemented and working
- **Data**: Last 7 days of earthquakes worldwide
- **No API Key Required**: Free public API

### ❌ Typhoons - NEEDS SETUP
Typhoon data is more challenging because:
1. Most official sources (JTWC, JMA, PAGASA) don't provide public JSON APIs
2. They require scraping or special access
3. CORS restrictions prevent direct browser access

## Recommended Solutions for Real-Time Typhoon Data

### Option 1: Use a Third-Party Weather API (Recommended)

#### A. OpenWeatherMap (Requires Free API Key)
- **Website**: https://openweathermap.org/api
- **Cost**: Free tier available (1,000 calls/day)
- **Setup**:
  1. Sign up at https://openweathermap.org/api
  2. Get your free API key
  3. Add to `.env` file: `VITE_OPENWEATHER_API_KEY=your_key_here`
  4. They have tropical cyclone data in their API

#### B. WeatherAPI.com (Requires Free API Key)
- **Website**: https://www.weatherapi.com/
- **Cost**: Free tier available (1 million calls/month)
- **Setup**:
  1. Sign up at https://www.weatherapi.com/signup.aspx
  2. Get your free API key
  3. Add to `.env` file: `VITE_WEATHERAPI_KEY=your_key_here`
  4. Has tropical cyclone/hurricane data

#### C. AccuWeather (Requires Free API Key)
- **Website**: https://developer.accuweather.com/
- **Cost**: Free tier available (50 calls/day)
- **Setup**:
  1. Sign up at https://developer.accuweather.com/
  2. Get your free API key
  3. Add to `.env` file: `VITE_ACCUWEATHER_API_KEY=your_key_here`
  4. Has tropical cyclone tracking API

### Option 2: Use a Backend Proxy Server

Since official sources (JTWC, JMA, PAGASA) block direct browser access, you can:

1. **Create a simple backend server** (Node.js/Express) that:
   - Fetches data from official sources
   - Converts it to JSON
   - Serves it to your frontend
   - Handles CORS properly

2. **Example Backend Endpoint**:
```javascript
// server.js (Node.js/Express)
app.get('/api/typhoons', async (req, res) => {
  // Fetch from JTWC/JMA/PAGASA
  // Parse and return JSON
  res.json(typhoonData);
});
```

### Option 3: Use a Public Typhoon Tracking Service

Some services aggregate typhoon data:
- **Tropical Tidbits**: https://www.tropicaltidbits.com/
- **Tropical Storm Risk**: https://www.tropicalstormrisk.com/
- **Windy.com API**: https://api.windy.com/ (may require API key)

## Quick Setup Instructions

### For Earthquakes (Already Working):
✅ No setup needed - USGS API is already configured and working!

### For Typhoons (Choose One):

#### Quick Start with OpenWeatherMap:
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Get your API key
4. Create `.env` file in project root:
   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```
5. Restart your dev server

#### Quick Start with WeatherAPI:
1. Go to https://www.weatherapi.com/signup.aspx
2. Sign up for free account
3. Get your API key
4. Create `.env` file in project root:
   ```
   VITE_WEATHERAPI_KEY=your_api_key_here
   ```
5. Restart your dev server

## Current Code Status

- ✅ **Earthquake data**: Working with USGS (no API key needed)
- ⚠️ **Typhoon data**: Currently tries multiple sources but may fail due to CORS/API restrictions
- 💡 **Recommendation**: Use OpenWeatherMap or WeatherAPI for reliable typhoon data

## Testing Your Setup

1. Open browser console (F12)
2. Check for error messages
3. Look for "Fetched X earthquakes" message (should work)
4. Look for "Fetched X typhoons" message (may show 0 if no active typhoons or API issues)

## Need Help?

If you're still having issues:
1. Check browser console for specific error messages
2. Verify API keys are set correctly in `.env` file
3. Make sure `.env` file is in the project root (not in `src/`)
4. Restart your development server after adding API keys

