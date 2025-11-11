# Environment Variables Setup

Create a `.env` file in the root directory of this project with the following variables:

```env
# OpenWeather API Key (Optional but recommended for weather data)
# Get your free API key from: https://home.openweathermap.org/users/sign_up
# The free tier includes 60 calls/minute and 1,000,000 calls/month
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Note**: The map functionality works without any API keys! The app uses Leaflet with OpenStreetMap tiles, which are completely free and don't require authentication.

## Getting API Keys

### OpenWeather API Key (Optional)
1. Go to [OpenWeather Sign Up](https://home.openweathermap.org/users/sign_up)
2. Create a free account
3. Navigate to "API keys" in your account dashboard
4. Copy your default API key or create a new one
5. The free tier is sufficient for most use cases

## Notes
- The `.env` file should be in the root directory (same level as `package.json`)
- Never commit your `.env` file to version control (it should be in `.gitignore`)
- Restart your development server after creating or modifying the `.env` file
- **Map functionality works without any API keys** - only add OpenWeather API key if you want weather data

