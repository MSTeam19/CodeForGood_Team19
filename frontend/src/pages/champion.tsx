import React, { useState, useEffect } from 'react';
import './champion.css';

interface ChampionFormData {
  name: string;
  email: string;
  organization: string;
  region: string;
  message: string;
}

interface Region {
  regionId: string;
  name: string;
  country: string;
  goalCents: number;
  lat?: number;
  lng?: number;
  description?: string;
  createdAt: string;
}

const Champion: React.FC = () => {
  const [formData, setFormData] = useState<ChampionFormData>({
    name: '',
    email: '',
    organization: '',
    region: '',
    message: ''
  });
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch regions from API
  useEffect(() => {
    async function fetchRegions() {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/regions`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch regions');
        }
        
        const data = await response.json();
        setRegions(data.regions || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
        // Fallback to empty array if API fails
        setRegions([]);
      } finally {
        setLoadingRegions(false);
      }
    }

    fetchRegions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        organization: '',
        region: '',
        message: ''
      });
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="champion-page">
        <div className="champion-success">
          <div className="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your application to become a Champion has been submitted successfully.</p>
          <p>We'll be in touch soon to discuss next steps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="champion-page">
      <div className="champion-header">
        <h1>Become a Champion</h1>
        <p>Join our network of regional champions making a difference in communities worldwide</p>
      </div>

      <div className="champion-content">
        <div className="champion-info">
          <h3>What Champions Do</h3>
          <ul>
            <li>Lead fundraising efforts in their region</li>
            <li>Organize community events and drives</li>
            <li>Coordinate with local organizations</li>
            <li>Share impact stories and updates</li>
            <li>Mentor new volunteers</li>
          </ul>

          <h3>Benefits</h3>
          <ul>
            <li>Direct impact on your local community</li>
            <li>Access to exclusive Champion resources</li>
            <li>Leadership development opportunities</li>
            <li>Network with global change-makers</li>
            <li>Recognition and certificates</li>
          </ul>
        </div>

        <div className="champion-form-container">
          <form onSubmit={handleSubmit} className="champion-form">
            <h3>Apply to Become a Champion</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization/Affiliation</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Optional - your workplace, school, or community group"
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">Preferred Region *</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                required
                disabled={loadingRegions}
              >
                <option value="">
                  {loadingRegions ? 'Loading regions...' : 'Select a region...'}
                </option>
                {regions.map(region => (
                  <option key={region.regionId} value={region.regionId}>
                    {region.name} ({region.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Why do you want to become a Champion? *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us about your passion for making a difference..."
                required
              />
            </div>

            <button 
              type="submit" 
              className="champion-submit-btn"
              disabled={isSubmitting || loadingRegions}
            >
              {isSubmitting ? 'Submitting...' : loadingRegions ? 'Loading...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Champion;