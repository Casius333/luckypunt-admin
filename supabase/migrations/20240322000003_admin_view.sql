-- Create view for admin users with email
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  au.user_id as id,
  au.role,
  au.created_at,
  au.updated_at,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON admin_users_view TO authenticated;

-- Create function to get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS admin_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM admin_users WHERE user_id = auth.uid();
$$;

-- Update the RLS policy to use the view
DROP POLICY IF EXISTS "Enable read access for authenticated users on view" ON admin_users_view;

CREATE POLICY "Allow super_admin to view all" ON admin_users_view
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'super_admin'
    )
  );

CREATE POLICY "Allow admins to view all" ON admin_users_view
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow users to view their own role" ON admin_users_view
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()); 