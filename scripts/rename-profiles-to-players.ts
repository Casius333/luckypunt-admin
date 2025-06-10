import { config } from 'dotenv'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

// Load environment variables
config()

const client = new Client({
  host: 'db.lexsfcrpmzgadmbwnrwp.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'q7GnG556aZHYa',
  ssl: {
    rejectUnauthorized: false
  }
})

async function renameTables() {
  try {
    console.log('Connecting to database...')
    await client.connect()

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240324000000_rename_profiles_to_players.sql')
    const migration = fs.readFileSync(migrationPath, 'utf8')

    // Execute the migration
    console.log('Applying rename migration...')
    await client.query(migration)
    console.log('Migration applied successfully!')

    // Verify the changes
    console.log('\nVerifying changes...')
    const { rows: players } = await client.query('SELECT * FROM players LIMIT 5')
    console.log('Sample players from renamed table:', players)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

renameTables() 