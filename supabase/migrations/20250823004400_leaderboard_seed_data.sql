-- Seed data for leaderboard functionality

-- Insert demo campaign
INSERT INTO campaigns (id, name, description, goal_cents, is_active) 
VALUES ('demo-campaign', 'Project Reach Demo Campaign', 'Demonstration campaign for Project Reach fundraising', 10000000, true);

-- Insert regions with coordinates
INSERT INTO regions (id, name, country, goal_cents, lat, lng, description, campaign_id) 
SELECT 
  region_data.id,
  region_data.name,
  region_data.country,
  region_data.goal_cents,
  region_data.lat,
  region_data.lng,
  region_data.description,
  'demo-campaign'
FROM (VALUES
  ('hk-central', 'Central Hong Kong School', 'HK', 3000000, 22.2816, 114.1578, 'Primary school in Central Hong Kong'),
  ('hk-wan-chai', 'Wan Chai Elementary', 'HK', 2200000, 22.2766, 114.1747, 'Elementary school in Wan Chai district'),
  ('hk-tsim-sha-tsui', 'Tsim Sha Tsui Primary', 'HK', 1500000, 22.2976, 114.1722, 'Primary school in Tsim Sha Tsui'),
  ('sg-marina-bay', 'Marina Bay School', 'SG', 2800000, 1.2647, 103.8636, 'International school near Marina Bay'),
  ('sg-orchard', 'Orchard Primary', 'SG', 2000000, 1.3048, 103.8318, 'Primary school in Orchard district'),
  ('sg-sentosa', 'Sentosa Island School', 'SG', 1800000, 1.2494, 103.8303, 'School on Sentosa Island'),
  ('my-kl-central', 'KL Central School', 'MY', 2400000, 3.1478, 101.6953, 'Central Kuala Lumpur school'),
  ('my-petaling-jaya', 'Petaling Jaya Academy', 'MY', 2000000, 3.1073, 101.6067, 'Academy in Petaling Jaya'),
  ('my-johor-bahru', 'Johor Bahru Primary', 'MY', 1600000, 1.4927, 103.7414, 'Primary school in Johor Bahru')
) AS region_data(id, name, country, goal_cents, lat, lng, description);

-- Insert sample donations
INSERT INTO donations (region_id, donor_name, donor_email, amount_cents, message, campaign_id)
SELECT 
  donation_data.region_id,
  donation_data.donor_name,
  donation_data.donor_email,
  donation_data.amount_cents,
  donation_data.message,
  'demo-campaign'
FROM (VALUES
  -- Hong Kong donations
  ('hk-central', 'John Chen', 'john@example.com', 100000, 'Happy to support education!'),
  ('hk-central', 'Mary Wong', 'mary@example.com', 75000, 'Great cause'),
  ('hk-central', 'David Lee', 'david@example.com', 50000, 'Keep up the good work'),
  ('hk-wan-chai', 'Sarah Kim', 'sarah@example.com', 85000, 'Education is important'),
  ('hk-wan-chai', 'Michael Lam', 'michael@example.com', 60000, 'Supporting our children'),
  ('hk-tsim-sha-tsui', 'Lisa Zhang', 'lisa@example.com', 90000, 'Proud to contribute'),
  ('hk-tsim-sha-tsui', 'Peter Hui', 'peter@example.com', 45000, 'Every bit helps'),
  
  -- Singapore donations  
  ('sg-marina-bay', 'Amanda Tan', 'amanda@example.com', 120000, 'Excellent initiative'),
  ('sg-marina-bay', 'Robert Lim', 'robert@example.com', 95000, 'Supporting education'),
  ('sg-orchard', 'Grace Ng', 'grace@example.com', 80000, 'Important cause'),
  ('sg-orchard', 'Daniel Ong', 'daniel@example.com', 65000, 'Happy to help'),
  ('sg-sentosa', 'Jennifer Koh', 'jennifer@example.com', 70000, 'Great work'),
  
  -- Malaysia donations
  ('my-kl-central', 'Ahmad Rahman', 'ahmad@example.com', 85000, 'Supporting Malaysian education'),
  ('my-kl-central', 'Siti Nur', 'siti@example.com', 70000, 'Keep it up'),
  ('my-petaling-jaya', 'Lim Wei Ming', 'wei@example.com', 60000, 'Good cause'),
  ('my-petaling-jaya', 'Priya Devi', 'priya@example.com', 55000, 'Happy to support'),
  ('my-johor-bahru', 'Hassan Ali', 'hassan@example.com', 50000, 'Education matters'),
  ('my-johor-bahru', 'Mei Lin', 'mei@example.com', 40000, 'Great initiative')
) AS donation_data(region_id, donor_name, donor_email, amount_cents, message);

-- Refresh the materialized view with the seed data
SELECT refresh_leaderboard_region();