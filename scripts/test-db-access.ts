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

async function testAccess() {
  try {
    // First, let's check if admin_users table exists
    console.log('Checking for admin_users table...')
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1)

    if (adminError) {
      if (adminError.code === '42P01') { // Table doesn't exist
        console.log('admin_users table does not exist')
      } else {
        console.error('Error checking admin_users:', adminError)
      }
    } else {
      console.log('Found admin_users table:', adminUsers)
    }

    // Check if we can access auth.users
    console.log('\nChecking for chad@spxdigi.com in auth.users...')
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'chad@spxdigi.com')
      .single()

    if (userError) {
      console.error('Error checking auth.users:', userError)
    } else {
      console.log('Found user:', users)
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testAccess() 