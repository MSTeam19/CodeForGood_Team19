import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './needs-map.css';
import {
  fetchLeaderboard,
  selectSummary,
  type LeaderboardRow,
  type LeaderboardResponse,
} from './leaderboard';

function formatCurrency(cents: number): string {
  return `HK$${(cents / 100).toLocaleString()}`;
}

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function getProgressColor(current: number, goal: number): string {
  const percentage = (current / goal) * 100;
  if (percentage < 30) return '#ff6b6b';
  if (percentage < 70) return '#ffa726';
  return '#66bb6a';
}

function getMarkerSize(amount: number, maxAmount: number): number {
  const ratio = amount / maxAmount;
  return Math.max(20, Math.min(50, 20 + ratio * 30));
}

function ProgressBar({ current, goal }: { current: number; goal: number }) {
  const percentage = Math.min(100, (current / goal) * 100);

  return (
    <div className="detail-progress-container">
      <div
        className="detail-progress-bar"
        style={
          {
            '--progress': `${percentage}%`,
            '--color': getProgressColor(current, goal),
          } as React.CSSProperties
        }
      />
      <span className="detail-progress-text">{percentage.toFixed(1)}%</span>
    </div>
  );
}

function DetailPanel({
  region,
  onClose,
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
        <div className="detail-country">
          <span className="country-badge">{region.country}</span>
        </div>

        <div className="detail-progress">
          <label>Fundraising Progress</label>
          <ProgressBar
            current={region.totalAmountCents}
            goal={region.goalCents}
          />
        </div>

        <div className="detail-stats">
          <div className="stat-item">
            <span className="stat-label">Total Raised</span>
            <span className="stat-value">
              {formatCurrency(region.totalAmountCents)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Goal</span>
            <span className="stat-value">
              {formatCurrency(region.goalCents)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Donations</span>
            <span className="stat-value">{region.donationCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest Donation</span>
            <span className="stat-value">
              {formatCurrency(region.highestSingleDonationCents)}
            </span>
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              (window.location.hash = `/donate?regionId=${region.regionId}`)
            }
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
        <p>
          To enable the interactive map view, please configure your Mapbox token
          in the environment variables.
        </p>
        <a href="/leaderboard" className="btn btn-primary">
          Continue in Table View
        </a>
      </div>
    </div>
  );
}

export default function NeedsMap() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<LeaderboardRow | null>(
    null
  );
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const country = searchParams.get('country') || 'HK';
  const focusRegion = searchParams.get('region');
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [country]);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || !data) return;

    mapboxgl.accessToken = mapboxToken;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center:
        country === 'HK'
          ? [114.1694, 22.3193]
          : country === 'SG'
          ? [103.8198, 1.3521]
          : country === 'MY'
          ? [101.6869, 3.139]
          : [108.0, 12.0],
      zoom: country === 'ALL' ? 4 : 10,
      pitch: 55,
      bearing: 20,
    });

    newMap.on('load', () => {
      const regionsWithCoords = data.regions.filter(
        (region) => region.lat && region.lng
      );
      const maxAmount = Math.max(
        ...regionsWithCoords.map((r) => r.totalAmountCents)
      );

      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      regionsWithCoords.forEach((region) => {
        if (!region.lat || !region.lng) return;

        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';

        const size = getMarkerSize(region.totalAmountCents, maxAmount);
        const color = getProgressColor(
          region.totalAmountCents,
          region.goalCents
        );

        markerElement.style.width = `${size}px`;
        markerElement.style.height = `${size}px`;
        markerElement.style.backgroundColor = color;
        markerElement.style.borderRadius = '50%';
        markerElement.style.border = '3px solid white';
        markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        markerElement.style.cursor = 'pointer';
        markerElement.style.transition = 'transform 0.2s ease';

        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.1)';
        });

        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
        });

        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([region.lng, region.lat])
          .addTo(newMap);

        markersRef.current[region.regionId] = marker;

        markerElement.addEventListener('click', () => {
          setSelectedRegion(region);
          newMap.flyTo({
            center: [region.lng!, region.lat!],
            zoom: 12,
            duration: 1000,
          });
        });
      });

      if (focusRegion) {
        const region = regionsWithCoords.find(
          (r) => r.regionId === focusRegion
        );
        if (region && region.lat && region.lng) {
          setSelectedRegion(region);
          newMap.flyTo({
            center: [region.lng, region.lat],
            zoom: 12,
            duration: 2000,
          });
        }
      }
    });

    setMap(newMap);

    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      newMap.remove();
    };
  }, [data, mapboxToken, focusRegion]);

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

  const summary = data
    ? selectSummary(data)
    : { totalAmountCents: 0, donationCount: 0 };
  const regionsWithoutCoords =
    data?.regions.filter((region) => !region.lat || !region.lng).length || 0;

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

          <a href={`/leaderboard?country=${country}`} className="view-toggle">
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
                {regionsWithoutCoords} region
                {regionsWithoutCoords > 1 ? 's' : ''} without location data not
                shown on map
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
