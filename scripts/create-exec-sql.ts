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

async function createExecSql() {
  try {
    // Create the exec_sql function
    console.log('Creating exec_sql function...')
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute permission to authenticated users
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
      `
    })

    if (error) {
      console.error('Error creating function:', error)
      return
    }

    console.log('Function created successfully!')

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createExecSql() 