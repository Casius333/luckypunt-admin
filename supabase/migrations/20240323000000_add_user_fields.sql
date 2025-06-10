-- Add email column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'admin_users' AND column_name = 'email') THEN
    ALTER TABLE admin_users ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add full_name column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'admin_users' AND column_name = 'full_name') THEN
    ALTER TABLE admin_users ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Update existing records
UPDATE admin_users au
SET 
  email = u.email,
  full_name = u.raw_user_meta_data->>'full_name'
FROM auth.users u
WHERE au.user_id = u.id;

-- Add trigger to keep email and full_name in sync
CREATE OR REPLACE FUNCTION sync_admin_user_details()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert or update, sync details from auth.users
  SELECT email, raw_user_meta_data->>'full_name'
  INTO NEW.email, NEW.full_name
  FROM auth.users
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_admin_user_details_trigger ON admin_users;

CREATE TRIGGER sync_admin_user_details_trigger
BEFORE INSERT OR UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION sync_admin_user_details(); 