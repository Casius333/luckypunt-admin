import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

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

async function makeSuperAdmin() {
  try {
    // First get the user's ID from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserByEmail('chad@spxdigi.com')

    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // Update or insert the admin role
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        id: user.id,
        role: 'super_admin'
      })

    if (adminError) {
      throw adminError
    }

    console.log('Successfully updated user role to super_admin')
  } catch (error) {
    console.error('Error updating user role:', error)
    process.exit(1)
  }
}

makeSuperAdmin() 