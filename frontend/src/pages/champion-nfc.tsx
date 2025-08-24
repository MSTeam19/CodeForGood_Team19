import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './champion-nfc.css';

// Mock champion data for demo
const mockChampion = {
  name: 'Sarah Chen',
  role: 'Lead Champion',
  region: 'Central Hong Kong',
  email: 'sarah.chen@reach.org.hk',
  organization: 'REACH Hong Kong',
  joinedDate: '2024-01-15',
  isLeadChampion: true,
  verified: true,
  stats: {
    eventsOrganized: 15,
    donationsRaised: 185000, // in cents
    volunteersRecruited: 42,
    studentsImpacted: 156,
    questLevel: {
      name: 'Champion Elite',
      emoji: '👑',
      color: '#FFD700'
    }
  },
  achievements: [
    { name: 'First Event', emoji: '🎉', date: '2024-02-01' },
    { name: 'Top Fundraiser', emoji: '💎', date: '2024-06-15' },
    { name: 'Community Leader', emoji: '⭐', date: '2024-08-01' },
    { name: 'Quest Master', emoji: '🏆', date: '2024-11-20' }
  ]
};

export default function ChampionNFC() {
  const { token } = useParams();
  const [champion, setChampion] = useState(mockChampion);
  const [loading, setLoading] = useState(false);

  const hkd = new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const currentUrl = window.location.href;

  return (
    <div className="champion-nfc-page">
      <div className="champion-nfc-container">
        
        {/* Verification Header */}
        <div className="verification-header">
          <div className="verification-badge">
            <span className="verify-icon">✅</span>
            <span className="verify-text">Verified REACH Champion</span>
          </div>
          <div className="reach-logo">
            <span className="reach-text">REACH</span>
            <span className="hk-text">Hong Kong</span>
          </div>
        </div>

        {/* Champion Profile Card */}
        <div className="champion-profile-card">
          
          {/* Avatar and Basic Info */}
          <div className="champion-header">
            <div className="champion-avatar-nfc">
              <img 
                src="/champion-sarah.jpg" 
                alt={champion.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div className="avatar-fallback" style={{ display: 'none' }}>
                SC
              </div>
              {champion.isLeadChampion && (
                <div className="lead-champion-crown">👑</div>
              )}
            </div>
            
            <div className="champion-info">
              <h1 className="champion-name-nfc">{champion.name}</h1>
              <p className="champion-role-nfc">{champion.role}</p>
              <p className="champion-region">{champion.region}</p>
              <p className="champion-since">Champion since {formatDate(champion.joinedDate)}</p>
            </div>
          </div>

          {/* Quest Level Badge */}
          <div className="quest-level-badge-nfc" style={{ backgroundColor: champion.stats.questLevel.color }}>
            <span className="quest-emoji-nfc">{champion.stats.questLevel.emoji}</span>
            <span className="quest-name-nfc">{champion.stats.questLevel.name}</span>
          </div>

          {/* Impact Statistics */}
          <div className="impact-stats-section">
            <h2 className="section-title-nfc">Impact Statistics</h2>
            <div className="stats-grid-nfc">
              <div className="stat-item-nfc">
                <div className="stat-number-nfc">{champion.stats.eventsOrganized}</div>
                <div className="stat-label-nfc">Events Organized</div>
              </div>
              <div className="stat-item-nfc">
                <div className="stat-number-nfc">{hkd.format(champion.stats.donationsRaised / 100)}</div>
                <div className="stat-label-nfc">Donations Raised</div>
              </div>
              <div className="stat-item-nfc">
                <div className="stat-number-nfc">{champion.stats.volunteersRecruited}</div>
                <div className="stat-label-nfc">Volunteers Recruited</div>
              </div>
              <div className="stat-item-nfc">
                <div className="stat-number-nfc">{champion.stats.studentsImpacted}</div>
                <div className="stat-label-nfc">Students Impacted</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h2 className="section-title-nfc">Achievements</h2>
            <div className="achievements-grid">
              {champion.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <span className="achievement-emoji">{achievement.emoji}</span>
                  <span className="achievement-name">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="qr-section">
            <h3 className="qr-title">Share This Profile</h3>
            <div className="qr-placeholder">
              <div className="qr-code-mock">
                <div className="qr-pattern"></div>
              </div>
              <p className="qr-instruction">Scan to view profile</p>
            </div>
          </div>

          {/* Footer */}
          <div className="profile-footer">
            <p className="footer-text">This champion profile is verified by REACH Hong Kong</p>
            <p className="contact-info">For verification inquiries: verify@reach.org.hk</p>
          </div>

        </div>
      </div>
    </div>
  );
}