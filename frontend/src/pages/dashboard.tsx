import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  getQuestLevel, 
  getQuestProgress, 
  getChampionPower, 
  getPowerLevel, 
  getPowerProgress, 
  QUEST_LEVELS,
  POWER_LEVELS 
} from '../utils/gamification';
import './dashboard.css';

// Types matching the existing leaderboard
type LeaderboardRow = {
  regionId: string;
  name: string;
  totalAmountCents: number;
  donationCount: number;
  highestSingleDonationCents: number;
  championCount?: number;
  leadChampionName?: string;
  leadChampionId?: string;
};

type Champion = {
  championId: string;
  name: string;
  email: string;
  organization?: string;
  message: string;
  isLeadChampion: boolean;
  joinedDate: string;
};

type LeaderboardResponse = {
  country?: string;
  regions: LeaderboardRow[];
  updatedAt: string;
};

// Mock activity feed data for demo
const mockActivityFeed = [
  { 
    id: '1', 
    type: 'quest_level_up', 
    regionName: 'Central Hong Kong', 
    from: 'Sprout', 
    to: 'Sapling', 
    timestamp: Date.now() - 1000 * 60 * 5 
  },
  { 
    id: '2', 
    type: 'new_champion', 
    championName: 'Sarah Chen', 
    regionName: 'Wan Chai', 
    timestamp: Date.now() - 1000 * 60 * 15 
  },
  { 
    id: '3', 
    type: 'large_donation', 
    amount: 5000, 
    regionName: 'Tsim Sha Tsui', 
    timestamp: Date.now() - 1000 * 60 * 30 
  },
  { 
    id: '4', 
    type: 'power_level_up', 
    championName: 'Mike Wong', 
    from: 'Flame', 
    to: 'Star', 
    timestamp: Date.now() - 1000 * 60 * 45 
  }
];

const mockChampions: Champion[] = [
  {
    championId: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    organization: 'Parent Volunteer Group',
    message: 'Local parent who has organized 15 successful fundraising events.',
    isLeadChampion: true,
    joinedDate: '2024-01-15',
  },
  {
    championId: '2',
    name: 'Mike Wong',
    email: 'mike@example.com',
    organization: 'Local Business Owner',
    message: 'Teacher and business owner passionate about youth development.',
    isLeadChampion: false,
    joinedDate: '2024-02-20',
  },
  {
    championId: '3',
    name: 'Lisa Tan',
    email: 'lisa@example.com',
    organization: 'Community Organizer',
    message: 'Experienced community organizer with 10+ years of volunteer work.',
    isLeadChampion: true,
    joinedDate: '2024-01-10',
  }
];

async function fetchLeaderboard(country: string): Promise<LeaderboardResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  try {
    const url = country === 'ALL'
      ? `${baseUrl}/campaigns/demo-campaign/leaderboard`
      : `${baseUrl}/campaigns/demo-campaign/leaderboard?country=${country}`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    return await response.json();
  } catch (error) {
    // Fallback to mock data with quest levels
    const mockRegions: LeaderboardRow[] = [
      {
        regionId: 'hk-central',
        name: 'Central Hong Kong',
        totalAmountCents: 2500000,
        donationCount: 45,
        highestSingleDonationCents: 100000,
        championCount: 2,
        leadChampionName: 'Sarah Chen',
      },
      {
        regionId: 'hk-wan-chai',
        name: 'Wan Chai',
        totalAmountCents: 1800000,
        donationCount: 32,
        highestSingleDonationCents: 75000,
        championCount: 1,
        leadChampionName: 'Mike Wong',
      },
      {
        regionId: 'sg-marina-bay',
        name: 'Marina Bay',
        totalAmountCents: 1900000,
        donationCount: 38,
        highestSingleDonationCents: 85000,
        championCount: 1,
        leadChampionName: 'Lisa Tan',
      },
    ];
    
    return {
      regions: mockRegions,
      updatedAt: new Date().toISOString(),
    };
  }
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
  }).format(cents / 100);
}

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [country, setCountry] = useState<string>(searchParams.get('country') || 'ALL');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result = await fetchLeaderboard(country);
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [country]);

  if (loading || !data) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading live view...</p>
        </div>
      </div>
    );
  }

  // Calculate quest level distribution
  const questDistribution = QUEST_LEVELS.map(level => {
    const count = data.regions.filter(region => 
      getQuestLevel(region.totalAmountCents).id === level.id
    ).length;
    return { ...level, count };
  });

  // Calculate champion power rankings
  const championPowerRankings = mockChampions.map(champion => {
    const power = getChampionPower(champion);
    const powerLevel = getPowerLevel(power);
    const powerProgress = getPowerProgress(power);
    return { 
      ...champion, 
      power, 
      powerLevel, 
      powerProgress 
    };
  }).sort((a, b) => b.power - a.power);

  const totalRegions = data.regions.length;
  const totalChampions = data.regions.reduce((sum, region) => sum + (region.championCount || 0), 0);
  const totalRaised = data.regions.reduce((sum, region) => sum + region.totalAmountCents, 0);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🏆 Live View</h1>
          <p>Real-time quest progress and champion activity</p>
        </div>
        <div className="dashboard-nav">
          <Link to="/needs-map" className="nav-link">← Back to Map</Link>
          <Link to="/leaderboard" className="nav-link">View Leaderboard</Link>
        </div>
      </div>

      {/* Key Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-info">
            <span className="stat-number">{totalRegions}</span>
            <span className="stat-label">Active Regions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <span className="stat-number">{totalChampions}</span>
            <span className="stat-label">Champions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-number">{formatCurrency(totalRaised)}</span>
            <span className="stat-label">Total Raised</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Quest Level Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🗺️ Quest Level Distribution</h3>
            <span className="card-subtitle">Regional progress breakdown</span>
          </div>
          <div className="quest-distribution">
            {questDistribution.map(level => (
              <div key={level.id} className="quest-distribution-item">
                <div className="quest-level-info">
                  <span className="quest-level-emoji">{level.emoji}</span>
                  <div className="quest-level-details">
                    <span className="quest-level-name" style={{ color: level.color }}>
                      {level.name}
                    </span>
                    <span className="quest-level-desc">{level.description}</span>
                  </div>
                </div>
                <div className="quest-count">
                  <span className="count-number">{level.count}</span>
                  <span className="count-label">regions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Champion Power Rankings */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>⚡ Champion Power Rankings</h3>
            <span className="card-subtitle">Top champions by activity</span>
          </div>
          <div className="champion-rankings">
            {championPowerRankings.map((champion, index) => (
              <div key={champion.championId} className="champion-ranking-item">
                <div className="champion-rank">#{index + 1}</div>
                <div className="champion-avatar">
                  {champion.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="champion-details">
                  <div className="champion-name">{champion.name}</div>
                  <div className="champion-org">{champion.organization}</div>
                </div>
                <div className="power-display">
                  <div className="power-badge" style={{ color: champion.powerLevel.color }}>
                    {champion.powerLevel.emoji} {champion.powerLevel.name}
                  </div>
                  <div className="power-number">{champion.power} power</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📡 Live Activity Feed</h3>
            <span className="card-subtitle">Recent achievements and milestones</span>
          </div>
          <div className="activity-feed">
            {mockActivityFeed.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'quest_level_up' && '🎯'}
                  {activity.type === 'new_champion' && '👑'}
                  {activity.type === 'large_donation' && '💎'}
                  {activity.type === 'power_level_up' && '⚡'}
                </div>
                <div className="activity-content">
                  {activity.type === 'quest_level_up' && (
                    <div>
                      <strong>{activity.regionName}</strong> leveled up from <em>{activity.from}</em> to <em>{activity.to}</em>!
                    </div>
                  )}
                  {activity.type === 'new_champion' && (
                    <div>
                      <strong>{activity.championName}</strong> became a champion for <em>{activity.regionName}</em>!
                    </div>
                  )}
                  {activity.type === 'large_donation' && (
                    <div>
                      Large donation of <strong>{formatCurrency(activity.amount * 100)}</strong> received in <em>{activity.regionName}</em>!
                    </div>
                  )}
                  {activity.type === 'power_level_up' && (
                    <div>
                      Champion <strong>{activity.championName}</strong> reached <em>{activity.to}</em> power level!
                    </div>
                  )}
                </div>
                <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}