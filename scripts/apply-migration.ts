import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240323000000_add_user_fields.sql')
    const migration = fs.readFileSync(migrationPath, 'utf8')

    // Execute the migration
    console.log('Applying migration...')
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migration
    })

    if (error) {
      console.error('Error applying migration:', error)
      return
    }

    console.log('Migration applied successfully!')

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

applyMigration() 