import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import './needs-map.css';

// Types matching the existing leaderboard
type LeaderboardRow = {
  regionId: string;
  name: string;
  totalAmountCents: number;
  donationCount: number;
  highestSingleDonationCents: number;
  lat?: number;
  lng?: number;
  goalCents?: number;
};

type LeaderboardResponse = {
  country?: string;
  regions: LeaderboardRow[];
  updatedAt: string;
};

// Enhanced mock data with coordinates and goals
const mockDataByCountry: Record<string, LeaderboardResponse> = {
  "HK": {
    country: "HK",
    regions: [
      {
        regionId: "hk-central",
        name: "Central Hong Kong School",
        totalAmountCents: 2500000,
        donationCount: 45,
        highestSingleDonationCents: 100000,
        goalCents: 3000000,
        lat: 22.2816,
        lng: 114.1578
      },
      {
        regionId: "hk-wan-chai",
        name: "Wan Chai Elementary",
        totalAmountCents: 1800000,
        donationCount: 32,
        highestSingleDonationCents: 75000,
        goalCents: 2200000,
        lat: 22.2766,
        lng: 114.1747
      },
      {
        regionId: "hk-tsim-sha-tsui",
        name: "Tsim Sha Tsui Primary",
        totalAmountCents: 1200000,
        donationCount: 28,
        highestSingleDonationCents: 50000,
        goalCents: 1500000,
        lat: 22.2976,
        lng: 114.1722
      }
    ],
    updatedAt: new Date().toISOString()
  },
  "SG": {
    country: "SG",
    regions: [
      {
        regionId: "sg-marina-bay",
        name: "Marina Bay School",
        totalAmountCents: 2200000,
        donationCount: 38,
        highestSingleDonationCents: 80000,
        goalCents: 2800000,
        lat: 1.2647,
        lng: 103.8636
      },
      {
        regionId: "sg-orchard",
        name: "Orchard Primary",
        totalAmountCents: 1600000,
        donationCount: 29,
        highestSingleDonationCents: 60000,
        goalCents: 2000000,
        lat: 1.3048,
        lng: 103.8318
      }
    ],
    updatedAt: new Date().toISOString()
  },
  "MY": {
    country: "MY",
    regions: [
      {
        regionId: "my-kl-central",
        name: "KL Central School",
        totalAmountCents: 1900000,
        donationCount: 35,
        highestSingleDonationCents: 70000,
        goalCents: 2400000,
        lat: 3.1478,
        lng: 101.6953
      }
    ],
    updatedAt: new Date().toISOString()
  }
};

// Fetch function matching existing pattern
async function fetchLeaderboard(country: string): Promise<LeaderboardResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  try {
    const url = country === "ALL" 
      ? `${baseUrl}/campaigns/demo-campaign/leaderboard`
      : `${baseUrl}/campaigns/demo-campaign/leaderboard?country=${country}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('API request failed, using mock data:', error);
    if (country === "ALL") {
      const allRegions = Object.values(mockDataByCountry).flatMap(data => data.regions);
      return {
        regions: allRegions,
        updatedAt: new Date().toISOString()
      };
    }
    return mockDataByCountry[country] || mockDataByCountry["HK"];
  }
}

function selectSummary(data: LeaderboardResponse): { totalAmountCents: number; donationCount: number; } {
  return data.regions.reduce(
    (acc, region) => ({
      totalAmountCents: acc.totalAmountCents + region.totalAmountCents,
      donationCount: acc.donationCount + region.donationCount
    }),
    { totalAmountCents: 0, donationCount: 0 }
  );
}

// Utility functions
function formatCurrency(cents: number): string {
  const hkd = new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD' });
  return hkd.format(cents / 100);
}

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function getProgressColor(current: number, goal?: number): string {
  if (!goal) return '#007bff';
  const percentage = (current / goal) * 100;
  if (percentage < 30) return '#ff6b6b';
  if (percentage < 70) return '#ffa726';
  return '#66bb6a';
}

function getMarkerSize(amount: number, maxAmount: number): number {
  const ratio = amount / maxAmount;
  return Math.max(20, Math.min(50, 20 + ratio * 30));
}

// Components
function ProgressBar({ current, goal }: { current: number; goal?: number }) {
  if (!goal) return <div>No goal set</div>;
  const percentage = Math.min(100, (current / goal) * 100);
  
  return (
    <div className="detail-progress-container">
      <div 
        className="detail-progress-bar"
        style={{ 
          '--progress': `${percentage}%`,
          '--color': getProgressColor(current, goal)
        } as React.CSSProperties}
      />
      <span className="detail-progress-text">{percentage.toFixed(1)}%</span>
    </div>
  );
}

function DetailPanel({ 
  region, 
  onClose 
}: { 
  region: LeaderboardRow | null; 
  onClose: () => void;
}) {
  if (!region) return null;

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h3>{region.name}</h3>
        <button 
          className="close-btn"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          ×
        </button>
      </div>
      
      <div className="detail-content">
        <div className="detail-progress">
          <label>Fundraising Progress</label>
          <ProgressBar current={region.totalAmountCents} goal={region.goalCents} />
        </div>

        <div className="detail-stats">
          <div className="stat-item">
            <span className="stat-label">Total Raised</span>
            <span className="stat-value">{formatCurrency(region.totalAmountCents)}</span>
          </div>
          {region.goalCents && (
            <div className="stat-item">
              <span className="stat-label">Goal</span>
              <span className="stat-value">{formatCurrency(region.goalCents)}</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Donations</span>
            <span className="stat-value">{region.donationCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest Donation</span>
            <span className="stat-value">{formatCurrency(region.highestSingleDonationCents)}</span>
          </div>
        </div>

        <div className="detail-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.hash = `/donate?regionId=${region.regionId}`}
          >
            Donate Now
          </button>
          <a 
            href={`/leaderboard?region=${region.regionId}`}
            className="btn btn-secondary"
          >
            View in Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div className="map-placeholder">
      <div className="placeholder-content">
        <h2>Map View Requires Mapbox Token</h2>
        <p>To enable the interactive map view, please configure your Mapbox token in the environment variables.</p>
        <a href="/leaderboard" className="btn btn-primary">
          Continue in Table View
        </a>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    mapboxgl: unknown;
  }
}

export default function NeedsMap() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<LeaderboardRow | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  const country = searchParams.get('country') || 'HK';
  const focusRegion = searchParams.get('region');
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchLeaderboard(country);
      setData(result);
    } catch (err) {
      setError('Failed to load map data');
      console.error('Map data error:', err);
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    loadData();
  }, [country, loadData]);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || !data || !window.mapboxgl) return;

    window.mapboxgl.accessToken = mapboxToken;

    // Ensure container has explicit dimensions
    mapContainer.current.style.width = '100%';
    mapContainer.current.style.height = '100%';

    const map = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: country === 'HK' ? [114.1694, 22.3193] : 
              country === 'SG' ? [103.8198, 1.3521] :
              country === 'MY' ? [101.6869, 3.1390] : [108.0, 12.0],
      zoom: country === 'ALL' ? 4 : 10,
      pitch: 55,
      bearing: 20
    });

    map.on('load', () => {
      // Force map to recalculate its size
      map.resize();
      
      setTimeout(() => {
        // Second resize to ensure proper sizing
        map.resize();
        
        const regionsWithCoords = data.regions.filter(region => region.lat && region.lng);
        const maxAmount = Math.max(...regionsWithCoords.map(r => r.totalAmountCents));

        // Create GeoJSON data for the regions
        const geojsonData = {
          type: 'FeatureCollection',
          features: regionsWithCoords.map(region => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [region.lng!, region.lat!]
            },
            properties: {
              regionId: region.regionId,
              name: region.name,
              totalAmountCents: region.totalAmountCents,
              donationCount: region.donationCount,
              highestSingleDonationCents: region.highestSingleDonationCents,
              goalCents: region.goalCents,
              color: getProgressColor(region.totalAmountCents, region.goalCents),
              size: getMarkerSize(region.totalAmountCents, maxAmount)
            }
          }))
        };

        // Add source
        map.addSource('schools', {
          type: 'geojson',
          data: geojsonData
        });

        // Add circle layer
        map.addLayer({
          id: 'schools-circles',
          type: 'circle',
          source: 'schools',
          paint: {
            'circle-radius': ['get', 'size'],
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 3,
            'circle-opacity': 0.8
          }
        });

        // Add hover effect
        map.on('mouseenter', 'schools-circles', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'schools-circles', () => {
          map.getCanvas().style.cursor = '';
        });

        // Add click event
        map.on('click', 'schools-circles', (e: { features?: unknown[] }) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0] as {
              geometry: { coordinates: [number, number] };
              properties: {
                regionId: string;
                name: string;
                totalAmountCents: number;
                donationCount: number;
                highestSingleDonationCents: number;
                goalCents: number;
              };
            };
            const props = feature.properties;
            
            const region: LeaderboardRow = {
              regionId: props.regionId,
              name: props.name,
              totalAmountCents: props.totalAmountCents,
              donationCount: props.donationCount,
              highestSingleDonationCents: props.highestSingleDonationCents,
              goalCents: props.goalCents,
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0]
            };

            setSelectedRegion(region);
            map.flyTo({
              center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
              zoom: 12,
              duration: 1000
            });
          }
        });

        // Focus on specific region if specified
        if (focusRegion) {
          const region = regionsWithCoords.find(r => r.regionId === focusRegion);
          if (region && region.lat && region.lng) {
            setSelectedRegion(region);
            map.flyTo({
              center: [region.lng, region.lat],
              zoom: 12,
              duration: 2000
            });
          }
        }
      }, 300);
    });

    mapRef.current = map;

    return () => {
      if (map.getLayer('schools-circles')) {
        map.removeLayer('schools-circles');
      }
      if (map.getSource('schools')) {
        map.removeSource('schools');
      }
      map.remove();
    };
  }, [data, mapboxToken, focusRegion, country]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRegion(null);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  if (!mapboxToken) {
    return <MapPlaceholder />;
  }

  const summary = data ? selectSummary(data) : { totalAmountCents: 0, donationCount: 0 };
  const regionsWithoutCoords = data?.regions.filter(region => !region.lat || !region.lng).length || 0;

  return (
    <div className="map-page">
      <div className="map-header">
        <div className="map-title">
          <h1>Fundraising Map</h1>
          <div className="map-summary">
            <span>{formatCurrency(summary.totalAmountCents)} raised</span>
            <span>•</span>
            <span>{summary.donationCount} donations</span>
            {data && (
              <>
                <span>•</span>
                <span>Updated {formatTimeAgo(data.updatedAt)}</span>
              </>
            )}
          </div>
        </div>

        <div className="map-controls">
          <div className="country-filter">
            {['ALL', 'HK', 'SG', 'MY'].map((c) => (
              <a
                key={c}
                href={`/needs-map?country=${c}`}
                className={`country-tab ${country === c ? 'active' : ''}`}
              >
                {c}
              </a>
            ))}
          </div>

          <a 
            href={`/leaderboard?country=${country}`}
            className="view-toggle"
          >
            ← Table View
          </a>
        </div>
      </div>

      <div className="map-content">
        {loading ? (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Loading map data...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadData}>
              Retry
            </button>
          </div>
        ) : (
          <>
            <div ref={mapContainer} className="map-container" />
            
            {regionsWithoutCoords > 0 && (
              <div className="map-notice">
                {regionsWithoutCoords} region{regionsWithoutCoords > 1 ? 's' : ''} without location data not shown on map
              </div>
            )}

            <DetailPanel 
              region={selectedRegion} 
              onClose={() => setSelectedRegion(null)} 
            />
          </>
        )}
      </div>
    </div>
  );
}