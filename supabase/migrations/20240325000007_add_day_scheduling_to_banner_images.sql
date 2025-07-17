-- Add day-based scheduling to banner_images table
-- This allows promotional banners to be displayed on specific days of the week

-- Add schedule_days column to store days when banner should be displayed
ALTER TABLE banner_images 
ADD COLUMN IF NOT EXISTS schedule_days JSONB DEFAULT '["everyday"]',
ADD COLUMN IF NOT EXISTS is_day_scheduled BOOLEAN DEFAULT false;

-- Create index for performance on schedule_days
CREATE INDEX IF NOT EXISTS idx_banner_images_schedule_days ON banner_images USING GIN(schedule_days);

-- Set default values for existing promotional banners
UPDATE banner_images 
SET 
    schedule_days = '["everyday"]'::jsonb,
    is_day_scheduled = true
WHERE banner_id IN ('promotion-web', 'promotion-mobile') 
AND schedule_days IS NULL;

-- Add helpful comments
COMMENT ON COLUMN banner_images.schedule_days IS 'JSONB array of days when banner should be displayed: ["monday", "tuesday", ...] or ["everyday"]';
COMMENT ON COLUMN banner_images.is_day_scheduled IS 'Whether this banner uses day-based scheduling (true) or is part of a carousel (false)';

-- Update the banner_images table to include filename column if it doesn't exist
ALTER TABLE banner_images ADD COLUMN IF NOT EXISTS filename TEXT; 