import React from 'react'
import './ControlPanel.css'

function ControlPanel({
  typhoons,
  earthquakes,
  selectedTyphoon,
  selectedEarthquake,
  onTyphoonSelect,
  onEarthquakeSelect,
  showTyphoons,
  showEarthquakes,
  onToggleTyphoons,
  onToggleEarthquakes,
  onShowMapView,
  onShowEarthquakeMapView,
  loading = false,
  lastUpdate = null,
  autoRefresh = true,
  onToggleAutoRefresh,
  onRefresh,
}) {
  return (
    <div className="control-panel">
      <div className="panel-section">
        <h2>Typhoon & Earthquake Visualization</h2>
        
        {/* Real-time status */}
        <div className="status-section">
          {loading && <div className="loading-indicator">🔄 Loading...</div>}
          {lastUpdate && !loading && (
            <div className="last-update">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          {onRefresh && (
            <button 
              className="refresh-button"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data now"
            >
              🔄 Refresh
            </button>
          )}
        </div>
        
        <div className="toggle-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showTyphoons}
              onChange={(e) => onToggleTyphoons(e.target.checked)}
            />
            <span>Show Typhoons ({typhoons.length})</span>
          </label>
          
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showEarthquakes}
              onChange={(e) => onToggleEarthquakes(e.target.checked)}
            />
            <span>Show Earthquakes ({earthquakes.length})</span>
          </label>
          
          {onToggleAutoRefresh && (
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => onToggleAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh (60s)</span>
            </label>
          )}
        </div>
      </div>

      {showTyphoons && (
        <div className="panel-section">
          <h3>Active Typhoons</h3>
          <div className="typhoon-list">
            {typhoons.map((typhoon) => (
              <div
                key={typhoon.id}
                className={`typhoon-item ${selectedTyphoon?.id === typhoon.id ? 'selected' : ''}`}
              >
                <div onClick={() => onTyphoonSelect(typhoon)} style={{ flex: 1 }}>
                  <div className="typhoon-name">{typhoon.name}</div>
                  <div className="typhoon-info">
                    Position: {typhoon.currentPosition.lat.toFixed(1)}°N,{' '}
                    {typhoon.currentPosition.lon.toFixed(1)}°E
                  </div>
                  <div className="typhoon-info">
                    Path Points: {typhoon.path.length}
                  </div>
                </div>
                {onShowMapView && (
                  <button
                    className="map-view-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onShowMapView(typhoon)
                    }}
                    title="View on Google Maps"
                  >
                    🗺️ View Map
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showEarthquakes && (
        <div className="panel-section">
          <h3>Recent Earthquakes</h3>
          <div className="earthquake-list">
            {earthquakes.map((eq) => (
              <div
                key={eq.id}
                className={`earthquake-item ${selectedEarthquake?.id === eq.id ? 'selected' : ''}`}
              >
                <div onClick={() => onEarthquakeSelect(eq)} style={{ flex: 1 }}>
                  <div className="earthquake-header">
                    <span className={`magnitude-badge magnitude-${Math.floor(eq.magnitude)}`}>
                      M{eq.magnitude.toFixed(1)}
                    </span>
                    <span className="earthquake-location">{eq.location}</span>
                  </div>
                  <div className="earthquake-info">
                    Depth: {eq.depth} km | {eq.lat.toFixed(2)}°N, {eq.lon.toFixed(2)}°E
                  </div>
                </div>
                {onShowEarthquakeMapView && (
                  <button
                    className="map-view-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onShowEarthquakeMapView(eq)
                    }}
                    title="View on Google Maps"
                  >
                    🌍 View Map
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedTyphoon || selectedEarthquake) && (
        <div className="panel-section details-section">
          <h3>Details</h3>
          {selectedTyphoon && (
            <div className="details-content">
              <h4>{selectedTyphoon.name}</h4>
              <p>
                <strong>Current Position:</strong> {selectedTyphoon.currentPosition.lat.toFixed(2)}°N,{' '}
                {selectedTyphoon.currentPosition.lon.toFixed(2)}°E
              </p>
              <p>
                <strong>Path Length:</strong> {selectedTyphoon.path.length} points
              </p>
              <p>
                <strong>Current Intensity:</strong> Category{' '}
                {selectedTyphoon.path[selectedTyphoon.path.length - 1].intensity}
              </p>
            </div>
          )}
          {selectedEarthquake && (
            <div className="details-content">
              <h4>Earthquake Details</h4>
              <p>
                <strong>Magnitude:</strong> {selectedEarthquake.magnitude.toFixed(1)}
              </p>
              <p>
                <strong>Location:</strong> {selectedEarthquake.location}
              </p>
              <p>
                <strong>Coordinates:</strong> {selectedEarthquake.lat.toFixed(2)}°N,{' '}
                {selectedEarthquake.lon.toFixed(2)}°E
              </p>
              <p>
                <strong>Depth:</strong> {selectedEarthquake.depth} km
              </p>
            </div>
          )}
        </div>
      )}

      <div className="panel-section">
        <div className="legend">
          <h3>Legend</h3>
          <div className="legend-item">
            <div className="legend-color typhoon-path"></div>
            <span>Typhoon Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-color typhoon-sight"></div>
            <span>Line of Sight</span>
          </div>
          <div className="legend-item">
            <div className="legend-color earthquake-major"></div>
            <span>Major (M≥7.0)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color earthquake-strong"></div>
            <span>Strong (M≥6.0)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color earthquake-moderate"></div>
            <span>Moderate (M≥5.0)</span>
          </div>
        </div>
      </div>

      <div className="panel-section instructions">
        <p>🖱️ Click and drag to rotate the globe</p>
        <p>🔍 Scroll to zoom in/out</p>
        <p>📍 Click markers for details</p>
      </div>
    </div>
  )
}

export default ControlPanel

