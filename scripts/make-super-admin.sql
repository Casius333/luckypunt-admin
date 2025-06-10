-- Update the admin_users table to set the role to super_admin for the specified user
UPDATE admin_users
SET role = 'super_admin'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'chad@spxdigi.com'
); 