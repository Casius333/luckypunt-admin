import { config } from 'dotenv'
import fetch from 'node-fetch'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

async function executeSql(sql: string) {
  const serviceKey = supabaseServiceKey as string
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`
  }

  console.log('Executing SQL:', sql)

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql })
  })

  const data = await response.json()
  console.log('Response:', data)

  if (!response.ok) {
    throw new Error(JSON.stringify(data))
  }

  return data
}

async function createAdminView() {
  try {
    // Create the view
    console.log('Creating admin_users_view...')
    await executeSql(`
      DROP VIEW IF EXISTS admin_users_view;
      
      CREATE VIEW admin_users_view AS
      SELECT 
        au.id,
        au.user_id,
        au.role,
        au.created_at,
        au.updated_at,
        u.email,
        u.raw_user_meta_data->>'full_name' as full_name
      FROM admin_users au
      JOIN auth.users u ON au.user_id = u.id;

      -- Grant access to the view
      GRANT SELECT ON admin_users_view TO authenticated;
    `)

    console.log('Successfully created admin_users_view!')

    // Test the view by querying it
    console.log('\nTesting the view...')
    const result = await executeSql(`
      SELECT * FROM admin_users_view;
    `)

    console.log('Current admin users:', result)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createAdminView() 