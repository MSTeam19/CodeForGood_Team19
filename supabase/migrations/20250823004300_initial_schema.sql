-- Initial schema for leaderboard functionality

-- Campaigns table
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  goal_cents BIGINT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regions table  
CREATE TABLE regions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  goal_cents BIGINT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  description TEXT,
  campaign_id TEXT REFERENCES campaigns(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  region_id TEXT REFERENCES regions(id) NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  amount_cents BIGINT NOT NULL,
  message TEXT,
  campaign_id TEXT REFERENCES campaigns(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view for leaderboard performance
CREATE MATERIALIZED VIEW leaderboard_region AS
SELECT 
  r.id as region_id,
  r.name,
  r.country,
  r.lat,
  r.lng,
  r.goal_cents,
  COALESCE(SUM(d.amount_cents), 0) as total_amount_cents,
  COALESCE(COUNT(d.id), 0) as donation_count,
  COALESCE(MAX(d.amount_cents), 0) as highest_single_donation_cents,
  r.created_at
FROM regions r
LEFT JOIN donations d ON r.id = d.region_id
GROUP BY r.id, r.name, r.country, r.lat, r.lng, r.goal_cents, r.created_at;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard_region()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW leaderboard_region;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_donations_region_id ON donations(region_id);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_regions_country ON regions(country);
CREATE INDEX idx_regions_campaign_id ON regions(campaign_id);