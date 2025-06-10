'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import type { AdminRole } from '@/types/admin'
import { canAccessFeature } from '@/lib/admin'

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<AdminRole | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('admin')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAdmins()
    fetchCurrentUserRole()
  }, [])

  const fetchCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    setCurrentUserRole(adminUser?.role || null)
  }

  const loadAdmins = async () => {
    try {
      const { data: adminUsers, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setAdmins(adminUsers || [])
      setError(null)
    } catch (err: any) {
      console.error('Error loading admins:', err)
      setError(err.message)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // First check if the user exists in auth.users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newAdminEmail)
        .single()

      if (userError) {
        throw new Error('User not found. Please ensure the user has registered first.')
      }

      // Then create the admin user
      const { error: createError } = await supabase
        .from('admin_users')
        .insert([
          {
            user_id: existingUser.id,
            role: newAdminRole
          }
        ])

      if (createError) throw createError

      setNewAdminEmail('')
      loadAdmins()
      setError(null)
    } catch (err: any) {
      console.error('Error creating admin:', err)
      setError(err.message)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', adminId)

      if (deleteError) throw deleteError

      loadAdmins()
      setError(null)
    } catch (err: any) {
      console.error('Error deleting admin:', err)
      setError(err.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Users</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {canAccessFeature(currentUserRole, 'super_admin') && (
        <form onSubmit={handleCreateAdmin} className="mb-8">
          <div className="flex gap-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 p-2 border rounded"
            />
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
              className="p-2 border rounded"
            >
              <option value="admin">Admin</option>
              <option value="support">Support</option>
            </select>
            <Button type="submit">Add Admin</Button>
          </div>
        </form>
      )}

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{admin.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{admin.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {canAccessFeature(currentUserRole, 'super_admin') && admin.role !== 'super_admin' && (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAdmin(admin.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 