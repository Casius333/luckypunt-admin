-- Fix inconsistent day scheduling data
-- Remove "everyday" from schedule_days arrays that contain specific days

-- Update records that have both "everyday" and specific days
-- Remove "everyday" and keep only the specific days
UPDATE banner_images 
SET schedule_days = (
    SELECT jsonb_agg(day) 
    FROM jsonb_array_elements_text(schedule_days) AS day
    WHERE day != 'everyday'
)
WHERE schedule_days ? 'everyday' 
AND jsonb_array_length(schedule_days) > 1;

-- Clean up any empty arrays that might result from the above
UPDATE banner_images 
SET schedule_days = '["everyday"]'::jsonb
WHERE schedule_days = '[]'::jsonb OR schedule_days IS NULL;

-- Add helpful comment
COMMENT ON COLUMN banner_images.schedule_days IS 'JSONB array: either ["everyday"] for carousel banners, or specific days like ["monday", "tuesday"] for day-scheduled banners'; 