export type AdminRole = 'super_admin' | 'admin' | 'support'

export interface AdminUser {
  id: string
  user_id: string
  role: AdminRole
  created_at: string
  updated_at: string
  email?: string
  full_name?: string
} 