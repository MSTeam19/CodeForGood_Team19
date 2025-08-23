-- Drop and recreate the materialized view to include champion data
DROP MATERIALIZED VIEW IF EXISTS leaderboard_region;

CREATE MATERIALIZED VIEW leaderboard_region AS
SELECT 
  r.id as region_id,
  r.name,
  r.country,
  r.lat,
  r.lng,
  r.goal_cents,
  COALESCE(SUM(d.amount_cents), 0) as total_amount_cents,
  COALESCE(COUNT(DISTINCT d.id), 0) as donation_count,
  COALESCE(MAX(d.amount_cents), 0) as highest_single_donation_cents,
  COALESCE(COUNT(DISTINCT c.id), 0) as champion_count,
  COALESCE(MAX(CASE WHEN c.is_lead_champion = true THEN c.name END), NULL) as lead_champion_name,
  (SELECT c2.id FROM champions c2 WHERE c2.region_id = r.id AND c2.is_lead_champion = true AND c2.status = 'active' LIMIT 1) as lead_champion_id,
  r.created_at
FROM regions r
LEFT JOIN donations d ON r.id = d.region_id
LEFT JOIN champions c ON r.id = c.region_id AND c.status = 'active'
GROUP BY r.id, r.name, r.country, r.lat, r.lng, r.goal_cents, r.created_at;