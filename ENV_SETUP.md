# Environment Variables Setup

Create a `.env` file in the root directory of this project with the following variables:

```env
# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/google/maps-apis
# Make sure to enable "Maps JavaScript API" in your Google Cloud project
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenWeather API Key
# Get your free API key from: https://home.openweathermap.org/users/sign_up
# The free tier includes 60 calls/minute and 1,000,000 calls/month
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Getting API Keys

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to your domain for security

### OpenWeather API Key
1. Go to [OpenWeather Sign Up](https://home.openweathermap.org/users/sign_up)
2. Create a free account
3. Navigate to "API keys" in your account dashboard
4. Copy your default API key or create a new one
5. The free tier is sufficient for most use cases

## Notes
- The `.env` file should be in the root directory (same level as `package.json`)
- Never commit your `.env` file to version control (it should be in `.gitignore`)
- Restart your development server after creating or modifying the `.env` file

