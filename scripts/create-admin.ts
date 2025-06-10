import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lexsfcrpmzgadmbwnrwp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxleHNmY3JwbXpnYWRtYnducndwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODkwNDE2NCwiZXhwIjoyMDY0NDgwMTY0fQ.m3LDMgSODLVslfDH-EgPZpxT5wcqGFxdefYJearvXro'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  const email = 'admin@luckypunt.com'
  const password = 'admin123!@#'

  try {
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (signUpError) {
      throw signUpError
    }

    console.log('Admin user created successfully:', user)
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdmin() 