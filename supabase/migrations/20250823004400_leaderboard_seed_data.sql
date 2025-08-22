  -- Seed campaigns
  INSERT INTO campaigns (id, name, description, start_date, goal_cents) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Project Reach 2024', 'School fundraising campaign across 
  Asia', NOW(), 10000000);

  -- Seed regions
  INSERT INTO regions (region_id, name, country, lat, lng, goal_cents) VALUES
  ('hk-central', 'Central Hong Kong School', 'HK', 22.2816, 114.1578, 3000000),
  ('hk-wan-chai', 'Wan Chai Elementary', 'HK', 22.2766, 114.1747, 2200000),
  ('hk-tsim-sha-tsui', 'Tsim Sha Tsui Primary', 'HK', 22.2976, 114.1722, 1500000),
  ('sg-marina-bay', 'Marina Bay School', 'SG', 1.2647, 103.8636, 2800000),
  ('sg-orchard', 'Orchard Primary', 'SG', 1.3048, 103.8318, 2000000),
  ('my-kl-central', 'KL Central School', 'MY', 3.1478, 101.6953, 2400000);

-- Seed donations
INSERT INTO donations (campaign_id, region_id, donor_name, amount_cents, payment_status) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  r.id,
  donor_data.donor_name,
  donor_data.amount_cents,
  'completed'
FROM regions r
CROSS JOIN (VALUES
  ('hk-central', 'Anonymous Donor', 2500000),
  ('hk-central', 'John Doe', 50000),
  ('hk-wan-chai', 'Jane Smith', 1800000),
  ('hk-wan-chai', 'Bob Wilson', 75000),
  ('hk-tsim-sha-tsui', 'Alice Brown', 1200000),
  ('hk-tsim-sha-tsui', 'Charlie Davis', 50000),
  ('sg-marina-bay', 'David Lee', 2200000),
  ('sg-marina-bay', 'Emma Chen', 80000),
  ('sg-orchard', 'Frank Wang', 1600000),
  ('sg-orchard', 'Grace Liu', 60000),
  ('my-kl-central', 'Henry Kim', 1900000),
  ('my-kl-central', 'Ivy Tan', 70000)
) AS donor_data(region_id, donor_name, amount_cents)
WHERE r.region_id = donor_data.region_id;

-- Refresh the materialized view
SELECT refresh_leaderboard();