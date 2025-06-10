import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type AdminRole = 'super_admin' | 'admin' | 'support'

export interface AdminUser {
  id: string
  role: AdminRole
  created_at: string
  updated_at: string
  auth_users?: {
    email: string
  }
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    return adminUser?.role || null
  } catch (error) {
    console.error('Error fetching admin role:', error)
    return null
  }
}

export function canAccessFeature(userRole: AdminRole | null, requiredRole: AdminRole): boolean {
  if (!userRole) return false
  
  const roleHierarchy: Record<AdminRole, number> = {
    'super_admin': 3,
    'admin': 2,
    'support': 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
} 