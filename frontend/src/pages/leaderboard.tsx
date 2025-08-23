import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './leaderboard.css';

type LeaderboardRow = {
  regionId: string;
  name: string;
  totalAmountCents: number;
  donationCount: number;
  highestSingleDonationCents: number;
};

type LeaderboardResponse = {
  country?: string;
  regions: LeaderboardRow[];
  updatedAt: string;
};

const mockDataByCountry: Record<string, LeaderboardResponse> = {
  HK: {
    country: 'HK',
    regions: [
      {
        regionId: 'hk-central',
        name: 'Central Hong Kong',
        totalAmountCents: 2500000,
        donationCount: 45,
        highestSingleDonationCents: 100000,
      },
      {
        regionId: 'hk-wan-chai',
        name: 'Wan Chai',
        totalAmountCents: 1800000,
        donationCount: 32,
        highestSingleDonationCents: 75000,
      },
      {
        regionId: 'hk-tsim-sha-tsui',
        name: 'Tsim Sha Tsui',
        totalAmountCents: 1200000,
        donationCount: 28,
        highestSingleDonationCents: 50000,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  SG: {
    country: 'SG',
    regions: [
      {
        regionId: 'sg-marina-bay',
        name: 'Marina Bay',
        totalAmountCents: 1900000,
        donationCount: 38,
        highestSingleDonationCents: 85000,
      },
      {
        regionId: 'sg-orchard',
        name: 'Orchard',
        totalAmountCents: 1400000,
        donationCount: 29,
        highestSingleDonationCents: 60000,
      },
      {
        regionId: 'sg-sentosa',
        name: 'Sentosa',
        totalAmountCents: 900000,
        donationCount: 22,
        highestSingleDonationCents: 45000,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  MY: {
    country: 'MY',
    regions: [
      {
        regionId: 'my-kl-city',
        name: 'Kuala Lumpur City',
        totalAmountCents: 1600000,
        donationCount: 35,
        highestSingleDonationCents: 70000,
      },
      {
        regionId: 'my-petaling-jaya',
        name: 'Petaling Jaya',
        totalAmountCents: 1100000,
        donationCount: 26,
        highestSingleDonationCents: 55000,
      },
      {
        regionId: 'my-johor-bahru',
        name: 'Johor Bahru',
        totalAmountCents: 800000,
        donationCount: 20,
        highestSingleDonationCents: 40000,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
};

const getAllCountriesData = (): LeaderboardResponse => {
  const allRegions = Object.values(mockDataByCountry).flatMap(
    (data) => data.regions
  );
  return {
    regions: allRegions,
    updatedAt: new Date().toISOString(),
  };
};

async function fetchLeaderboard(country: string): Promise<LeaderboardResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  try {
    const url =
      country === 'ALL'
        ? `${baseUrl}/campaigns/demo-campaign/leaderboard`
        : `${baseUrl}/campaigns/demo-campaign/leaderboard?country=${country}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('API request failed, using mock data:', error);
    return country === 'ALL'
      ? getAllCountriesData()
      : mockDataByCountry[country] || mockDataByCountry['HK'];
  }
}

export default function LeaderboardPage() {
  const [searchParams] = useSearchParams();
  const [country, setCountry] = useState<string>(searchParams.get('country') || 'HK');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hkd = new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchLeaderboard(country);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [country]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
  };

  const sortedRegions =
    data?.regions
      .slice()
      .sort((a, b) => b.totalAmountCents - a.totalAmountCents) || [];

  return (
    <div className="page">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="section-title">Donation Leaderboard</h1>
        </div>

        <div className="card">
          <div className="controls">
            <div className="filter-group">
              <label htmlFor="country-select">Filter by Country:</label>
              <select
                id="country-select"
                value={country}
                onChange={handleCountryChange}
                className="country-select"
              >
                <option value="ALL">All Countries</option>
                <option value="HK">Hong Kong</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
              </select>
            </div>

            <div className="view-toggle">
              <span className="view-option active">Table View</span>
              <a href={`/needs-map?country=${country}`} className="view-option">
                Map View
              </a>
            </div>
          </div>

          {loading && (
            <div className="status loading">Loading leaderboard data...</div>
          )}

          {error && <div className="status error">Error: {error}</div>}

          {!loading && !error && sortedRegions.length === 0 && (
            <div className="status empty">
              No data available for the selected country.
            </div>
          )}

          {!loading && !error && sortedRegions.length > 0 && (
            <div className="table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Region</th>
                    <th>Total Raised (HKD)</th>
                    <th>Donations</th>
                    <th>Highest Donation (HKD)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegions.map((region, index) => (
                    <tr key={region.regionId}>
                      <td>{index + 1}</td>
                      <td>{region.name}</td>
                      <td>{hkd.format(region.totalAmountCents / 100)}</td>
                      <td>{region.donationCount}</td>
                      <td>
                        {hkd.format(region.highestSingleDonationCents / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && (
            <div className="updated-at">
              Last updated: {new Date(data.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
