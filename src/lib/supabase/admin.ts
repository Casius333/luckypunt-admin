import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getAdminUsers() {
  const { data: adminUsers, error } = await supabase
    .from('admin_users_view')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return adminUsers
} 