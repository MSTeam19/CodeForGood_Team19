-- Add profile and initiative fields to champions table
ALTER TABLE champions ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS next_initiative_title TEXT;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS next_initiative_description TEXT;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS next_initiative_date DATE;