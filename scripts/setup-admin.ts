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

async function setupAdmin() {
  try {
    // Drop existing tables
    console.log('Dropping existing tables...')
    const { error: dropError } = await supabase
      .from('admin_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (dropError) {
      console.error('Error dropping tables:', dropError)
      return
    }

    // Get chad's user ID
    console.log('\nGetting chad\'s user ID...')
    const { data: authUser, error: authError } = await supabase.auth
      .admin.listUsers()

    if (authError) {
      console.error('Error getting users:', authError)
      return
    }

    const chad = authUser.users.find(u => u.email === 'chad@spxdigi.com')
    if (!chad) {
      console.error('Could not find chad@spxdigi.com')
      return
    }

    console.log('Found chad\'s ID:', chad.id)

    // Insert chad as super admin
    console.log('\nSetting up chad as super admin...')
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: '361c42f8-a479-45ee-9989-eaa3f24b9a97', // Use the same ID as before
        user_id: chad.id,
        role: 'super_admin'
      })

    if (insertError) {
      console.error('Error inserting admin:', insertError)
      return
    }

    console.log('Successfully set up chad as super admin!')

    // Verify setup
    console.log('\nVerifying setup...')
    const { data: admins, error: verifyError } = await supabase
      .from('admin_users')
      .select('*')

    if (verifyError) {
      console.error('Error verifying setup:', verifyError)
      return
    }

    console.log('Current admin users:', admins)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

setupAdmin() 