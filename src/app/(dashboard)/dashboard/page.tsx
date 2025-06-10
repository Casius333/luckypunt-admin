'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'

interface DashboardStats {
  totalPlayers: number
  activeGames: number
  totalRevenue: number
  recentPlayers: Array<{
    id: string
    email: string
    created_at: string
    username: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    activeGames: 0,
    totalRevenue: 0,
    recentPlayers: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total players
        const { count: totalPlayers } = await supabase
          .from('players')
          .select('*', { count: 'exact' })

        // Fetch recent players
        const { data: recentPlayers } = await supabase
          .from('players')
          .select('id, email, created_at, username')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalPlayers: totalPlayers || 0,
          activeGames: 0, // TODO: Implement active games count
          totalRevenue: 0, // TODO: Implement revenue calculation
          recentPlayers: recentPlayers || []
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Players</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalPlayers}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Games</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeGames}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium">Recent Players</h2>
          <div className="mt-6 flow-root">
            <div className="-my-5 divide-y divide-gray-200">
              {stats.recentPlayers.map((player) => (
                <div key={player.id} className="py-5">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {player.username || player.email}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        Joined {new Date(player.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {/* TODO: View player details */}}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 