import { useState, useEffect } from 'react';
import './home.css';

function Home() {
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const impactStats = [
    { number: '2,500+', label: 'Students Supported', icon: '🎓' },
    { number: '15', label: 'Communities Reached', icon: '🏘️' },
    { number: 'HK$850K', label: 'Funds Raised', icon: '💝' },
    { number: '200+', label: 'Volunteers', icon: '🤝' }
  ];

  const missionCards = [
    {
      icon: '🎓',
      title: 'Education First',
      description: 'Providing quality educational resources and mentorship programs to unlock potential in every student.'
    },
    {
      icon: '🤝',
      title: 'Community Building', 
      description: 'Fostering inclusive communities where everyone has the opportunity to thrive and contribute.'
    },
    {
      icon: '💡',
      title: 'Innovation & Growth',
      description: 'Empowering individuals with modern skills and innovative approaches to break barriers.'
    },
    {
      icon: '🌟',
      title: 'Sustainable Impact',
      description: 'Creating lasting change through sustainable programs that grow with our communities.'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setStatsAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % impactStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [impactStats.length]);

  return (
    <div className="home-root">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-main">Empowering Communities.</span>
              <span className="title-accent">Creating Opportunities.</span>
              <span className="title-emphasis">Making a Difference.</span>
            </h1>
            <p className="hero-subtitle">
              Join REACH in building stronger, more inclusive communities across Hong Kong through education, outreach, and empowerment.
            </p>
            <div className="hero-actions">
              <a href="/leaderboard" className="hero-btn-primary">
                View Impact Dashboard
              </a>
              <a href="https://reachhk.squarespace.com/" target="_blank" rel="noopener noreferrer" className="hero-btn-secondary">
                Get Involved
              </a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="floating-stat">
              <span className="stat-icon">{impactStats[currentStat].icon}</span>
              <span className="stat-number">{impactStats[currentStat].number}</span>
              <span className="stat-label">{impactStats[currentStat].label}</span>
            </div>
          </div>
        </div>
        <div className="hero-wave"></div>
      </section>

      {/* Impact Statistics */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="section-title">Our Impact in Numbers</h2>
          <div className="stats-grid">
            {impactStats.map((stat, index) => (
              <div 
                key={index} 
                className={`stat-card ${statsAnimated ? 'animate' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="stat-icon-large">{stat.icon}</div>
                <div className="stat-number-large">{stat.number}</div>
                <div className="stat-label-large">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="mission-section">
        <div className="mission-container">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-grid">
            {missionCards.map((card, index) => (
              <div key={index} className="mission-card">
                <div className="mission-icon">{card.icon}</div>
                <h3 className="mission-title">{card.title}</h3>
                <p className="mission-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Make a Difference?</h2>
            <p className="cta-description">
              Join our community of changemakers and help us create lasting impact across Hong Kong.
            </p>
            <div className="cta-actions">
              <a href="/leaderboard" className="cta-btn primary">
                Explore Our Programs
              </a>
              <a href="https://reachhk.squarespace.com/" target="_blank" rel="noopener noreferrer" className="cta-btn secondary">
                Contact Us
              </a>
            </div>
          </div>
          <div className="cta-visual">
            <div className="impact-circle">
              <span>Together We</span>
              <strong>REACH</strong>
              <span>Further</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;