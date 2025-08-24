import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './champion-region.css';

interface Champion {
  championId: string;
  name: string;
  email: string;
  organization?: string;
  message: string; // Using as bio
  isLeadChampion: boolean;
  joinedDate: string;
  bio?: string;
  nextInitiativeTitle?: string;
  nextInitiativeDescription?: string;
  nextInitiativeDate?: string;
}

interface Region {
  regionId: string;
  name: string;
  country: string;
}

const ChampionRegionPage: React.FC = () => {
  const { regionId } = useParams<{ regionId: string }>();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChampionsAndRegion() {
      if (!regionId) return;

      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

        // Fetch champions for this region
        const championsResponse = await fetch(`${baseUrl}/regions/${regionId}/champions`);
        if (!championsResponse.ok) {
          throw new Error('Failed to fetch champions');
        }
        const championsData = await championsResponse.json();

        // Get region info from regions API instead of leaderboard
        const regionsResponse = await fetch(`${baseUrl}/regions`);
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          const foundRegion = regionsData.regions.find((r: any) => r.regionId === regionId);
          if (foundRegion) {
            setRegion({
              regionId: foundRegion.regionId,
              name: foundRegion.name,
              country: foundRegion.country
            });
          }
        }

        // For now, add mock data for champions with initiatives
        const enhancedChampions = championsData.champions.length > 0 
          ? championsData.champions.map((champion: Champion, index: number) => ({
              ...champion,
              bio: champion.message || `Passionate community member dedicated to making a difference in ${region?.name || 'our region'}.`,
              nextInitiativeTitle: index === 0 ? 'Christmas Bake Sale' : 'Sports Day Fundraiser',
              nextInitiativeDescription: index === 0 
                ? 'Organizing a community bake sale to raise funds for new school equipment. Looking for 5 volunteers to help with setup and sales!'
                : 'Planning a fun sports day event with donation booths. Need equipment donations and volunteer coaches.',
              nextInitiativeDate: index === 0 ? '2024-12-15' : '2024-01-20'
            }))
          : [
              // Mock data for testing - remove when real data exists
              {
                championId: '1',
                name: 'Sarah Chen',
                email: 'sarah@example.com',
                organization: 'Parent Volunteer Group',
                message: 'Local parent who has organized 15 successful fundraising events in the past year.',
                isLeadChampion: true,
                joinedDate: '2024-01-15',
                bio: 'Local parent who has organized 15 successful fundraising events in the past year. Passionate about education and community building.',
                nextInitiativeTitle: 'Christmas Bake Sale',
                nextInitiativeDescription: 'Organizing a community bake sale to raise funds for new school equipment. Looking for 5 volunteers to help with setup and sales!',
                nextInitiativeDate: '2024-12-15'
              },
              {
                championId: '2',
                name: 'Mike Wong',
                email: 'mike@example.com',
                organization: 'Local Business Owner',
                message: 'Teacher and local business owner passionate about youth development.',
                isLeadChampion: false,
                joinedDate: '2024-02-20',
                bio: 'Teacher and local business owner passionate about youth development. Believes in the power of community support.',
                nextInitiativeTitle: 'Sports Day Fundraiser',
                nextInitiativeDescription: 'Planning a fun sports day event with donation booths. Need equipment donations and volunteer coaches.',
                nextInitiativeDate: '2024-01-20'
              }
            ];

        setChampions(enhancedChampions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load champions');
      } finally {
        setLoading(false);
      }
    }

    fetchChampionsAndRegion();
  }, [regionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="champion-region-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading champions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="champion-region-page">
        <div className="error-container">
          <h2>Unable to load champions</h2>
          <p>{error}</p>
          <Link to="/needs-map" className="back-button">
            ← Back to Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="champion-region-page">
      <div className="champion-header">
        <Link to="/needs-map" className="back-link">
          ← Back to Map
        </Link>
        <div className="header-content">
          <h1>Champions in {region?.name || 'This Region'}</h1>
          <p className="region-info">{region?.country} • {champions.length} Champion{champions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="champions-container">
        {champions.length === 0 ? (
          <div className="no-champions">
            <div className="no-champions-content">
              <h3>No Champions Yet</h3>
              <p>This region doesn't have any champions yet. Be the first to make a difference!</p>
              <Link to="/champion" className="become-champion-btn">
                Become a Champion
              </Link>
            </div>
          </div>
        ) : (
          <div className="champions-grid">
            {champions.map((champion) => (
              <div key={champion.championId} className={`champion-card ${champion.isLeadChampion ? 'lead-champion' : ''}`}>
                <div className="champion-header-card">
                  <div className="champion-avatar">
                    {champion.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="champion-info">
                    <h3 className="champion-name">
                      {champion.name}
                      {champion.isLeadChampion && <span className="lead-badge">👑 Lead Champion</span>}
                    </h3>
                    <p className="champion-meta">
                      {champion.organization && <span>{champion.organization} • </span>}
                      Joined {formatJoinDate(champion.joinedDate)}
                    </p>
                  </div>
                </div>

                <div className="champion-bio">
                  <h4>About</h4>
                  <p>{champion.bio}</p>
                </div>

                {champion.nextInitiativeTitle && (
                  <div className="next-initiative">
                    <h4>Next Initiative</h4>
                    <div className="initiative-content">
                      <h5 className="initiative-title">{champion.nextInitiativeTitle}</h5>
                      {champion.nextInitiativeDate && (
                        <span className="initiative-date">{formatDate(champion.nextInitiativeDate)}</span>
                      )}
                      <p className="initiative-description">{champion.nextInitiativeDescription}</p>
                      <div className="initiative-actions">
                        <button className="join-initiative-btn">Join This Initiative</button>
                        <button className="message-champion-btn">Message {champion.name.split(' ')[0]}</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="champion-cta">
          <div className="cta-content">
            <h3>Want to become a Champion?</h3>
            <p>Join our community of regional champions making a difference!</p>
            <Link to="/champion" className="become-champion-btn">
              Apply to Become a Champion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionRegionPage;