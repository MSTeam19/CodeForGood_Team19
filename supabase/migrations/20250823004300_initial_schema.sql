  -- Materialized View for leaderboard 
  CREATE MATERIALIZED VIEW leaderboard_region AS
  SELECT
    r.region_id,
    r.name,
    r.country,
    r.lat,
    r.lng,
    r.goal_cents,
    COALESCE(SUM(d.amount_cents), 0) as total_amount_cents,
    COUNT(d.id) as donation_count,
    COALESCE(MAX(d.amount_cents), 0) as highest_single_donation_cents,
    c.id as campaign_id,
    MAX(d.created_at) as last_donation_at
  FROM regions r
  LEFT JOIN donations d ON r.id = d.region_id AND d.payment_status = 'completed'
  LEFT JOIN campaigns c ON d.campaign_id = c.id
  GROUP BY r.id, r.region_id, r.name, r.country, r.lat, r.lng, r.goal_cents, c.id;

  -- Create indexes for fast querying
  CREATE INDEX idx_leaderboard_country ON leaderboard_region(country);
  CREATE INDEX idx_leaderboard_campaign ON leaderboard_region(campaign_id);

  -- Function to refresh leaderboard
  CREATE OR REPLACE FUNCTION refresh_leaderboard()
  RETURNS void AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW leaderboard_region;
  END;
  $$ LANGUAGE plpgsql;