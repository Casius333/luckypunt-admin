-- Fix RLS policies for promotions table
-- Drop existing policies
DROP POLICY IF EXISTS "Allow admins to manage promotions" ON promotions;

-- Create corrected policy for promotions management
CREATE POLICY "Allow admins to manage promotions" ON promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- Fix user_promotions policies as well
DROP POLICY IF EXISTS "Allow admins to view all user promotions" ON user_promotions;
DROP POLICY IF EXISTS "Allow admins to manage all user promotions" ON user_promotions;

CREATE POLICY "Allow admins to view all user promotions" ON user_promotions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow admins to manage all user promotions" ON user_promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    ); 