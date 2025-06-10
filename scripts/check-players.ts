import { config } from 'dotenv'
import { Client } from 'pg'
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

async function checkPlayersTable() {
  try {
    console.log('Connecting to database...')
    await client.connect()

    // Check table structure
    console.log('\nChecking table structure...')
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'players';
    `)
    console.log('Table structure:', columns)

    // Check if there's any data
    console.log('\nChecking table data...')
    const { rows: players } = await client.query('SELECT * FROM players LIMIT 5')
    console.log('Sample players:', players)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

checkPlayersTable() 