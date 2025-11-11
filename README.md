# Typhoon & Earthquake 3D Visualization App

A modern web application for visualizing typhoon paths with line-of-sight tracing and earthquake magnitudes on an interactive 3D globe with Google Maps integration.

## Features

- **3D Globe Visualization**: Interactive Earth globe with realistic Google Earth-style textures
- **Typhoon Path Tracing**: Visualize typhoon trajectories with historical paths
- **Line of Sight Projection**: See projected typhoon paths based on current trajectory
- **Earthquake Magnitude Display**: View earthquake locations with magnitude-based color coding
- **Google Maps Integration**: Click on typhoon paths to view them on an interactive Google Maps satellite view
- **Interactive Controls**: Click markers to view detailed information
- **Toggle Visibility**: Show/hide typhoons and earthquakes independently

## Installation

1. Install dependencies:
```bash
npm install
```

2. **Set up Google Maps API Key** (required for map view feature):
   - Get a free API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a `.env` file in the root directory
   - Add your API key:
     ```
     VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
     ```
   - Make sure to enable "Maps JavaScript API" in your Google Cloud project

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Technologies Used

- **React**: UI framework
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for react-three-fiber
- **Google Maps JavaScript API**: For interactive map view
- **Vite**: Build tool and dev server

## Usage

- **Rotate Globe**: Click and drag to rotate
- **Zoom**: Scroll to zoom in/out
- **Select Typhoon**: Click on a typhoon marker or name in the control panel
- **View on Google Maps**: Click on a typhoon path (the colored line) or use the "🗺️ View Map" button in the control panel to see the typhoon path on Google Maps satellite view
- **Select Earthquake**: Click on an earthquake marker or entry in the control panel
- **Toggle Layers**: Use checkboxes in the control panel to show/hide typhoons or earthquakes

## Data Sources

Currently uses sample data. In a production environment, you would integrate with:
- Weather APIs for real-time typhoon data
- Seismic APIs for earthquake data (e.g., USGS, EMSC)

## Customization

You can modify the sample data in `src/App.jsx` or integrate with real APIs to fetch live data.

