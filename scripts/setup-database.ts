import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('Setting up database...')

    // Create enum
    console.log('Creating admin_role enum...')
    const { error: enumError } = await supabase.rpc('exec_sql', {
      query: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
            CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'support');
          END IF;
        END
        $$;
      `
    })

    if (enumError) {
      throw enumError
    }

    // Create table
    console.log('Creating admin_users table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          role admin_role NOT NULL DEFAULT 'support',
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
      `
    })

    if (tableError) {
      throw tableError
    }

    // Create trigger function
    console.log('Creating update_updated_at_column function...')
    const { error: triggerFuncError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    })

    if (triggerFuncError) {
      throw triggerFuncError
    }

    // Create trigger
    console.log('Creating update_admin_users_updated_at trigger...')
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      query: `
        DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
        CREATE TRIGGER update_admin_users_updated_at
          BEFORE UPDATE ON admin_users
          FOR EACH ROW
          EXECUTE PROCEDURE update_updated_at_column();
      `
    })

    if (triggerError) {
      throw triggerError
    }

    // Enable RLS
    console.log('Enabling RLS...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      throw rlsError
    }

    // Create policies
    console.log('Creating RLS policies...')
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        DROP POLICY IF EXISTS "Allow super_admin to do everything" ON admin_users;
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

        DROP POLICY IF EXISTS "Allow admins to view all" ON admin_users;
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

        DROP POLICY IF EXISTS "Allow users to view their own role" ON admin_users;
        CREATE POLICY "Allow users to view their own role" ON admin_users
          FOR SELECT
          TO authenticated
          USING (id = auth.uid());
      `
    })

    if (policiesError) {
      throw policiesError
    }

    // Create admin view
    console.log('Creating admin_users_view...')
    const { error: viewError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE VIEW admin_users_view AS
        SELECT 
          au.id,
          au.role,
          au.created_at,
          au.updated_at,
          u.email,
          u.raw_user_meta_data->>'full_name' as full_name
        FROM admin_users au
        JOIN auth.users u ON au.id = u.id;

        GRANT SELECT ON admin_users_view TO authenticated;
      `
    })

    if (viewError) {
      throw viewError
    }

    // Create helper functions
    console.log('Creating helper functions...')
    const { error: funcError } = await supabase.rpc('exec_sql', {
      query: `
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

        CREATE OR REPLACE FUNCTION get_my_role()
        RETURNS admin_role
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path = public
        AS $$
          SELECT role FROM admin_users WHERE id = auth.uid();
        $$;
      `
    })

    if (funcError) {
      throw funcError
    }

    // Set up the admin user
    console.log('Setting up admin user...')
    const { error: adminError } = await supabase.rpc('exec_sql', {
      query: `
        INSERT INTO admin_users (id, role)
        SELECT id, 'super_admin'::admin_role
        FROM auth.users 
        WHERE email = 'chad@spxdigi.com'
        ON CONFLICT (id) 
        DO UPDATE SET role = 'super_admin'::admin_role;
      `
    })

    if (adminError) {
      throw adminError
    }

    console.log('Setup completed successfully!')

  } catch (error) {
    console.error('Error during setup:', error)
    process.exit(1)
  }
}

setupDatabase() 