import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addUserFields() {
  try {
    // Add email and full_name columns to admin_users
    console.log('Adding email and full_name columns to admin_users...')
    const { error: alterError } = await supabase.rpc('alter_admin_users_table', {
      sql: `
        -- Add email column
        ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email TEXT;
        
        -- Add full_name column
        ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;
        
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
      `
    })

    if (alterError) {
      console.error('Error altering table:', alterError)
      return
    }

    console.log('Successfully added and populated email and full_name columns!')

    // Verify the changes
    const { data: admins, error: selectError } = await supabase
      .from('admin_users')
      .select('*')

    if (selectError) {
      console.error('Error verifying changes:', selectError)
      return
    }

    console.log('Current admin users:', admins)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addUserFields() 