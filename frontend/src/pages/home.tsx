import { useState, useEffect, useRef } from 'react';
import './home.css';

function Home() {
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [currentChampion, setCurrentChampion] = useState(0);
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const impactStats = [
    { number: '2,500+', label: 'Students Supported', icon: '🎓' },
    { number: '15', label: 'Communities Reached', icon: '🏘️' },
    { number: 'HK$850K', label: 'Funds Raised', icon: '💝' },
    { number: '200+', label: 'Volunteers', icon: '🤝' }
  ];
  
  const champions = [
    {
      name: 'Sarah Chen',
      role: 'Lead Champion - Central HK',
      quote: 'Making education accessible to every child is my passion.',
      impact: '15 events organized',
      avatar: 'SC',
      photo: '/champion-sarah.jpg'
    },
    {
      name: 'Mike Wong', 
      role: 'Champion - Wan Chai',
      quote: 'Community support transforms lives, one student at a time.',
      impact: '8 events organized',
      avatar: 'MW',
      photo: '/champion-mike.jpg'
    },
    {
      name: 'Lisa Tan',
      role: 'Champion - Singapore',
      quote: 'Empowering youth through technology and mentorship.',
      impact: '12 events organized', 
      avatar: 'LT',
      photo: '/champion-lisa.jpg'
    }
  ];
  
  // Mock donation progress - replace with real API data later
  const donationProgress = {
    current: 850000,
    goal: 1200000,
    percentage: (850000 / 1200000) * 100
  };

  const missionCards = [
    {
      icon: '🎓',
      title: 'Education First',
      description: 'Providing quality educational resources and mentorship programs to unlock potential in every student.',
      bgImage: '/mission-education.jpg'
    },
    {
      icon: '🤝',
      title: 'Community Building', 
      description: 'Fostering inclusive communities where everyone has the opportunity to thrive and contribute.',
      bgImage: '/mission-community.jpg'
    },
    {
      icon: '💡',
      title: 'Innovation & Growth',
      description: 'Empowering individuals with modern skills and innovative approaches to break barriers.',
      bgImage: '/mission-innovation.jpg'
    },
    {
      icon: '🌟',
      title: 'Sustainable Impact',
      description: 'Creating lasting change through sustainable programs that grow with our communities.',
      bgImage: '/mission-impact.jpg'
    }
  ];

  const impactStories = [
    {
      name: 'Emily Chen',
      age: 16,
      story: 'REACH helped me discover my passion for coding. Now I mentor other students in my community.',
      photo: '/story-emily.jpg',
      achievement: 'Built her first mobile app',
      location: 'Central Hong Kong'
    },
    {
      name: 'Marcus Wong',
      age: 14,
      story: 'The after-school program gave me a safe place to learn and make friends when my family was struggling.',
      photo: '/story-marcus.jpg', 
      achievement: 'Top of his class in Math',
      location: 'Wan Chai'
    },
    {
      name: 'Lily Tam',
      age: 17,
      story: 'Thanks to REACH, I received a scholarship to study at university. I want to become a teacher.',
      photo: '/story-lily.jpg',
      achievement: 'Accepted to HKU with scholarship',
      location: 'Tsim Sha Tsui'
    }
  ];

  // Scroll tracking for animations and floating button
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowFloatingButton(window.scrollY > 800);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));
    
    const timer = setTimeout(() => setStatsAnimated(true), 500);
    
    return () => {
      elements.forEach(el => observer.unobserve(el));
      clearTimeout(timer);
    };
  }, []);

  // Rotating stats and champions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % impactStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [impactStats.length]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChampion((prev) => (prev + 1) % champions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [champions.length]);

  return (
    <div className="home-root">
      {/* Floating Donate Button */}
      <div className={`floating-donate-btn ${showFloatingButton ? 'visible' : ''}`}>
        <a href="https://reachhk.squarespace.com/" target="_blank" rel="noopener noreferrer" className="donate-button">
          <span className="donate-icon">💝</span>
          <span className="donate-text">Donate Now</span>
        </a>
      </div>
      
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
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

      {/* Donation Progress Thermometer */}
      <section className="thermometer-section">
        <div className="thermometer-container">
          <h2 className="section-title">Our 2025 Fundraising Goal</h2>
          <div className="thermometer-widget">
            <div className="thermometer">
              <div className="thermometer-fill" style={{ height: `${donationProgress.percentage}%` }}></div>
              <div className="thermometer-bulb"></div>
            </div>
            <div className="thermometer-labels">
              <div className="current-amount">HK${(donationProgress.current / 1000).toFixed(0)}K</div>
              <div className="goal-amount">Goal: HK${(donationProgress.goal / 1000).toFixed(0)}K</div>
              <div className="percentage">{Math.round(donationProgress.percentage)}% Complete</div>
            </div>
            <div className="thermometer-description">
              <p>Every donation brings us closer to providing quality education resources for 3,000+ students across Hong Kong.</p>
              <a href="https://reachhk.squarespace.com/" target="_blank" rel="noopener noreferrer" className="contribute-btn">
                Help Us Reach Our Goal
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Champion Spotlight */}
      <section className="champion-spotlight">
        <div className="champion-container">
          <h2 className="section-title">Meet Our Champions</h2>
          <div className="champion-widget">
            <div className="champion-card-spotlight">
              <div className="champion-avatar-large">
                <img src={champions[currentChampion].photo} alt={champions[currentChampion].name} onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }} />
                <div className="avatar-placeholder" style={{display: 'none'}}>
                  {champions[currentChampion].avatar}
                </div>
              </div>
              <div className="champion-content">
                <h3 className="champion-name">{champions[currentChampion].name}</h3>
                <p className="champion-role">{champions[currentChampion].role}</p>
                <blockquote className="champion-quote">
                  "{champions[currentChampion].quote}"
                </blockquote>
                <div className="champion-impact">
                  <span className="impact-stat">{champions[currentChampion].impact}</span>
                </div>
                <div className="champion-actions">
                  <a href="/champion" className="join-champions-btn">Become a Champion</a>
                  <a href="/leaderboard" className="view-all-btn">View All Champions</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="impact-stories-section">
        <div className="impact-stories-container">
          <h2 className="section-title">Stories of Change</h2>
          <p className="section-subtitle">Meet the students whose lives have been transformed through REACH programs</p>
          <div className="stories-grid">
            {impactStories.map((story, index) => (
              <div key={index} className="story-card">
                <div className="story-image">
                  <img src={story.photo} alt={story.name} onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }} />
                  <div className="story-image-placeholder" style={{display: 'none'}}>
                    <div className="placeholder-avatar">{story.name.split(' ').map(n => n[0]).join('')}</div>
                  </div>
                  <div className="story-overlay">
                    <span className="story-location">{story.location}</span>
                  </div>
                </div>
                <div className="story-content">
                  <div className="story-header">
                    <h3 className="story-name">{story.name}</h3>
                    <span className="story-age">Age {story.age}</span>
                  </div>
                  <blockquote className="story-quote">"{story.story}"</blockquote>
                  <div className="story-achievement">
                    <span className="achievement-label">Achievement:</span>
                    <span className="achievement-text">{story.achievement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="stories-cta">
            <a href="https://reachhk.squarespace.com/" target="_blank" rel="noopener noreferrer" className="stories-btn">
              Help Create More Success Stories
            </a>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section ref={statsRef} className="stats-section scroll-animate">
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
      <section ref={missionRef} className="mission-section scroll-animate">
        <div className="mission-container">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-grid">
            {missionCards.map((card, index) => (
              <div key={index} className="mission-card" style={{backgroundImage: `url(${card.bgImage})`}}>
                <div className="mission-overlay"></div>
                <div className="mission-content">
                  <div className="mission-icon">{card.icon}</div>
                  <h3 className="mission-title">{card.title}</h3>
                  <p className="mission-description">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="cta-section scroll-animate">
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