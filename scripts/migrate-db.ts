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

async function applyMigrations() {
  try {
    console.log('Connecting to database...')
    await client.connect()

    // Read and execute the admin roles migration
    console.log('\nApplying admin roles migration...')
    const adminRolesPath = path.join(process.cwd(), 'supabase', 'migrations', '20240322000000_admin_roles.sql')
    const adminRolesMigration = fs.readFileSync(adminRolesPath, 'utf8')
    await client.query(adminRolesMigration)
    console.log('Admin roles migration applied successfully!')

    // Read and execute the user fields migration
    console.log('\nApplying user fields migration...')
    const userFieldsPath = path.join(process.cwd(), 'supabase', 'migrations', '20240323000000_add_user_fields.sql')
    const userFieldsMigration = fs.readFileSync(userFieldsPath, 'utf8')
    await client.query(userFieldsMigration)
    console.log('User fields migration applied successfully!')

    // Verify the changes
    console.log('\nVerifying changes...')
    const { rows: admins } = await client.query('SELECT * FROM admin_users')
    console.log('Current admin users:', admins)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

applyMigrations() 