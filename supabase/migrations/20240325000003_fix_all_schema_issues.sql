-- Fix all schema issues for promotions and banners tables

-- 1. Fix banners table RLS policy
DROP POLICY IF EXISTS "Allow admins to manage banners" ON banners;
CREATE POLICY "Allow admins to manage banners" ON banners
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- 2. Add missing columns to promotions table
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS wagering_requirement DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS max_deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS schedule_days JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS usage_type VARCHAR(20) DEFAULT 'once_off' CHECK (usage_type IN ('once_off', 'recurring')),
ADD COLUMN IF NOT EXISTS daily_usage_limit INTEGER DEFAULT 1;

-- 3. Copy data from old columns to new columns (if they exist)
UPDATE promotions 
SET 
    wagering_requirement = wagering_multiplier,
    max_deposit_amount = max_bonus_amount
WHERE wagering_requirement IS NULL OR max_deposit_amount IS NULL;

-- 4. Set intelligent defaults for existing promotions based on their names
UPDATE promotions 
SET 
    usage_type = CASE 
        WHEN name ILIKE '%reload%' THEN 'recurring'
        WHEN name ILIKE '%welcome%' THEN 'once_off'
        ELSE 'once_off'
    END,
    schedule_days = CASE 
        WHEN name ILIKE '%reload%' THEN '["friday"]'::jsonb
        WHEN name ILIKE '%welcome%' THEN '["everyday"]'::jsonb
        ELSE '["everyday"]'::jsonb
    END,
    daily_usage_limit = CASE 
        WHEN name ILIKE '%reload%' THEN 1
        WHEN name ILIKE '%welcome%' THEN 1
        ELSE 1
    END
WHERE usage_type IS NULL OR schedule_days IS NULL OR daily_usage_limit IS NULL;

-- 5. Make bonus_percent nullable for existing data compatibility
ALTER TABLE promotions ALTER COLUMN bonus_percent DROP NOT NULL;

-- 6. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotions_usage_type ON promotions(usage_type);
CREATE INDEX IF NOT EXISTS idx_promotions_schedule_days ON promotions USING GIN(schedule_days);

-- 7. Update the admin_users RLS policies to use correct column references
DROP POLICY IF EXISTS "Allow super_admin to view all" ON admin_users;
DROP POLICY IF EXISTS "Allow admins to view all" ON admin_users;
DROP POLICY IF EXISTS "Allow users to view their own role" ON admin_users;

CREATE POLICY "Allow super_admin to do everything" ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'super_admin'
    )
  );

CREATE POLICY "Allow admins to view all" ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow users to view their own role" ON admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()); 