-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Allow super_admin to update roles" ON admin_users;
DROP POLICY IF EXISTS "Allow super_admin to insert" ON admin_users;

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow super_admin to do everything" ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role = 'super_admin'
    )
  );

CREATE POLICY "Allow admins to view all" ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow users to view their own role" ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$; 