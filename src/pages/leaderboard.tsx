import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './leaderboard.css';

export type LeaderboardRow = {
  regionId: string;
  name: string;
  country: string;
  totalAmountCents: number;
  donationCount: number;
  highestSingleDonationCents: number;
  goalCents: number;
  lat?: number;
  lng?: number;
};

export type LeaderboardResponse = {
  campaignId: string;
  updatedAt: string;
  regions: LeaderboardRow[];
};

const MOCK_DATA: LeaderboardResponse = {
  campaignId: 'demo-campaign',
  updatedAt: new Date().toISOString(),
  regions: [
    {
      regionId: 'hk-ssp-k3',
      name: 'Sham Shui Po K3',
      country: 'HK',
      totalAmountCents: 850000,
      donationCount: 34,
      highestSingleDonationCents: 50000,
      goalCents: 1000000,
      lat: 22.3307,
      lng: 114.1628
    },
    {
      regionId: 'hk-central-p1',
      name: 'Central Primary 1',
      country: 'HK',
      totalAmountCents: 720000,
      donationCount: 28,
      highestSingleDonationCents: 45000,
      goalCents: 800000,
      lat: 22.2816,
      lng: 114.1578
    },
    {
      regionId: 'sg-orchard-s2',
      name: 'Orchard Secondary 2',
      country: 'SG',
      totalAmountCents: 650000,
      donationCount: 41,
      highestSingleDonationCents: 35000,
      goalCents: 900000,
      lat: 1.3048,
      lng: 103.8318
    },
    {
      regionId: 'my-kl-int',
      name: 'KL International School',
      country: 'MY',
      totalAmountCents: 580000,
      donationCount: 22,
      highestSingleDonationCents: 60000,
      goalCents: 750000,
      lat: 3.1478,
      lng: 101.6953
    },
    {
      regionId: 'hk-tst-elem',
      name: 'Tsim Sha Tsui Elementary',
      country: 'HK',
      totalAmountCents: 480000,
      donationCount: 19,
      highestSingleDonationCents: 40000,
      goalCents: 600000,
      lat: 22.2976,
      lng: 114.1722
    },
    {
      regionId: 'sg-marina-p3',
      name: 'Marina Primary 3',
      country: 'SG',
      totalAmountCents: 420000,
      donationCount: 31,
      highestSingleDonationCents: 25000,
      goalCents: 700000,
      lat: 1.2647,
      lng: 103.8636
    }
  ]
};

export async function fetchLeaderboard(country: string): Promise<LeaderboardResponse> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const campaignId = import.meta.env.VITE_CAMPAIGN_ID;

  if (apiBaseUrl && campaignId) {
    try {
      const countryParam = country === 'ALL' ? '' : `?country=${country}`;
      const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}/leaderboard${countryParam}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      const supabaseResponse = await fetch(
        `${apiBaseUrl}/rest/v1/leaderboard_region?campaign_id=eq.${campaignId}${country !== 'ALL' ? `&country=eq.${country}` : ''}&select=*`
      );
      
      if (supabaseResponse.ok) {
        const rows = await supabaseResponse.json();
        return {
          campaignId,
          updatedAt: new Date().toISOString(),
          regions: rows.map((row: any) => ({
            regionId: row.region_id || row.regionId,
            name: row.name,
            country: row.country,
            totalAmountCents: row.total_amount_cents || row.totalAmountCents,
            donationCount: row.donation_count || row.donationCount,
            highestSingleDonationCents: row.highest_single_donation_cents || row.highestSingleDonationCents,
            goalCents: row.goal_cents || row.goalCents,
            lat: row.lat,
            lng: row.lng
          }))
        };
      }
    } catch (error) {
      console.warn('API fetch failed, using mock data:', error);
    }
  }

  const filteredRegions = country === 'ALL' 
    ? MOCK_DATA.regions 
    : MOCK_DATA.regions.filter(region => region.country === country);

  return {
    ...MOCK_DATA,
    regions: filteredRegions
  };
}

export function selectSummary(data: LeaderboardResponse): { totalAmountCents: number; donationCount: number; } {
  return data.regions.reduce(
    (acc, region) => ({
      totalAmountCents: acc.totalAmountCents + region.totalAmountCents,
      donationCount: acc.donationCount + region.donationCount
    }),
    { totalAmountCents: 0, donationCount: 0 }
  );
}

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

function ProgressBar({ current, goal, animate = false }: { current: number; goal: number; animate?: boolean }) {
  const percentage = Math.min(100, (current / goal) * 100);
  
  return (
    <div className="progress-container">
      <div 
        className={`progress-bar ${animate ? 'animate' : ''}`}
        style={{ '--progress': `${percentage}%` } as React.CSSProperties}
      />
      <span className="progress-text">{percentage.toFixed(1)}%</span>
    </div>
  );
}

function LeaderboardRow({ 
  region, 
  rank, 
  isHighlighted, 
  country 
}: { 
  region: LeaderboardRow; 
  rank: number; 
  isHighlighted: boolean;
  country: string;
}) {
  const [animate, setAnimate] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), rank * 100);
    return () => clearTimeout(timer);
  }, [rank]);

  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="ribbon ribbon-gold">🥇</span>;
    if (rank === 2) return <span className="ribbon ribbon-silver">🥈</span>;
    if (rank === 3) return <span className="ribbon ribbon-bronze">🥉</span>;
    return null;
  };

  return (
    <tr 
      ref={rowRef}
      className={`table-row ${isHighlighted ? 'highlighted' : ''} ${rank <= 3 ? `top-${rank}` : ''}`}
    >
      <td className="rank-cell">
        {getRankBadge(rank)}
        <span className="rank-number">{rank}</span>
      </td>
      <td className="name-cell">
        <div className="region-info">
          <span className="region-name">{region.name}</span>
          <span className="region-country">{region.country}</span>
        </div>
      </td>
      <td className="progress-cell">
        <ProgressBar 
          current={region.totalAmountCents} 
          goal={region.goalCents} 
          animate={animate}
        />
      </td>
      <td className="amount-cell">{formatCurrency(region.totalAmountCents)}</td>
      <td className="donations-cell">{region.donationCount}</td>
      <td className="highest-cell">{formatCurrency(region.highestSingleDonationCents)}</td>
      <td className="actions-cell">
        <button 
          className="btn btn-primary"
          onClick={() => window.location.hash = `/donate?regionId=${region.regionId}`}
          aria-label={`Donate to ${region.name}`}
        >
          Donate
        </button>
        <a 
          href={`/needs-map?country=${country}&region=${region.regionId}`}
          className="btn btn-secondary"
          aria-label={`View ${region.name} on map`}
        >
          Map
        </a>
      </td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <tr key={i} className="skeleton-row">
          <td><div className="skeleton skeleton-rank" /></td>
          <td><div className="skeleton skeleton-name" /></td>
          <td><div className="skeleton skeleton-progress" /></td>
          <td><div className="skeleton skeleton-amount" /></td>
          <td><div className="skeleton skeleton-donations" /></td>
          <td><div className="skeleton skeleton-highest" /></td>
          <td><div className="skeleton skeleton-actions" /></td>
        </tr>
      ))}
    </>
  );
}

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const country = searchParams.get('country') || 'HK';
  const highlightRegion = searchParams.get('region');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchLeaderboard(country);
      setData(result);
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [country]);

  const handleCountryChange = (newCountry: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('country', newCountry);
    if (highlightRegion) newParams.delete('region');
    setSearchParams(newParams);
  };

  const sortedRegions = data?.regions
    .slice()
    .sort((a, b) => b.totalAmountCents - a.totalAmountCents) || [];

  const summary = data ? selectSummary(data) : { totalAmountCents: 0, donationCount: 0 };

  return (
    <div className="page leaderboard-page">
      <div className="container">
        <header className="page-header">
          <h1>School Fundraising Leaderboard</h1>
          
          <div className="summary">
            <div className="summary-item">
              <span className="summary-label">Total Raised</span>
              <span className="summary-value">{formatCurrency(summary.totalAmountCents)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Donations</span>
              <span className="summary-value">{summary.donationCount.toLocaleString()}</span>
            </div>
            {data && (
              <div className="summary-item">
                <span className="summary-label">Last updated</span>
                <span className="summary-value">
                  {new Date(data.updatedAt).toLocaleString()} ({formatTimeAgo(data.updatedAt)})
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="controls">
          <div className="filter-group">
            <label htmlFor="country-filter">Filter by Country:</label>
            <div className="country-tabs">
              {['ALL', 'HK', 'SG', 'MY'].map((c) => (
                <button
                  key={c}
                  className={`country-tab ${country === c ? 'active' : ''}`}
                  onClick={() => handleCountryChange(c)}
                  aria-pressed={country === c}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="view-toggle">
            <span className="view-option active">Table View</span>
            <a 
              href={`/needs-map?country=${country}${highlightRegion ? `&region=${highlightRegion}` : ''}`}
              className="view-option"
            >
              Map View (Beta)
            </a>
          </div>
        </div>

        <div className="table-container">
          {error ? (
            <div className="status error">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadData}>
                Retry
              </button>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>School/Region</th>
                  <th>Progress</th>
                  <th>Total (HKD)</th>
                  <th>Donations</th>
                  <th>Highest (HKD)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <LoadingSkeleton />
                ) : sortedRegions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="status empty">
                      No schools found for the selected country. Try a different filter.
                    </td>
                  </tr>
                ) : (
                  sortedRegions.map((region, index) => (
                    <LeaderboardRow
                      key={region.regionId}
                      region={region}
                      rank={index + 1}
                      isHighlighted={region.regionId === highlightRegion}
                      country={country}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}