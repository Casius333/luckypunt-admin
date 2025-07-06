-- Fix all RLS policies to use correct column references
-- The admin_users table has 'user_id' column, not 'id' for auth reference

-- 1. Fix promotions table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to view active promotions" ON promotions;
DROP POLICY IF EXISTS "Allow admins to manage promotions" ON promotions;

CREATE POLICY "Allow authenticated users to view active promotions" ON promotions
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Allow admins to manage promotions" ON promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- 2. Fix banners table RLS policies  
DROP POLICY IF EXISTS "Allow authenticated users to view active banners" ON banners;
DROP POLICY IF EXISTS "Allow admins to manage banners" ON banners;

CREATE POLICY "Allow authenticated users to view active banners" ON banners
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Allow admins to manage banners" ON banners
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- 3. Fix admin_users table RLS policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Allow super_admin to update roles" ON admin_users;
DROP POLICY IF EXISTS "Allow super_admin to insert" ON admin_users;
DROP POLICY IF EXISTS "Allow super_admin to do everything" ON admin_users;
DROP POLICY IF EXISTS "Allow admins to view all" ON admin_users;
DROP POLICY IF EXISTS "Allow users to view their own role" ON admin_users;

CREATE POLICY "Allow super_admin to do everything" ON admin_users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Allow admins to view all" ON admin_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow users to view their own role" ON admin_users
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 4. Fix user_promotions table RLS policies
DROP POLICY IF EXISTS "Allow users to view their own promotions" ON user_promotions;
DROP POLICY IF EXISTS "Allow admins to view all user promotions" ON user_promotions;
DROP POLICY IF EXISTS "Allow users to update their own promotions" ON user_promotions;
DROP POLICY IF EXISTS "Allow admins to manage all user promotions" ON user_promotions;

CREATE POLICY "Allow users to view their own promotions" ON user_promotions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow admins to view all user promotions" ON user_promotions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow users to update their own promotions" ON user_promotions
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow admins to manage all user promotions" ON user_promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- 5. Update the is_admin() function to use correct column
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$; 