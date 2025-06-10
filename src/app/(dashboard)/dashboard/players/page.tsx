'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Settings, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/players/data-table'
import { columns } from '@/components/players/columns'
import type { Player, PlayerListFilters, KycStatus, AccountStatus } from '@/types/player'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PlayerListFilters>({
    search: '',
    kycStatus: null,
    accountStatus: null,
    dateRange: undefined
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Fetching players...')
        const { data, error } = await supabase
          .from('players')
          .select(`
            id,
            username,
            email,
            full_name,
            avatar_url,
            kyc_status,
            account_status,
            created_at,
            updated_at
          `)
        
        console.log('Query response:', { data, error })

        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
          return
        }

        // Apply search filter in memory since we can't use .or() with .ilike()
        let filteredData = data || []
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filteredData = filteredData.filter(player => 
            (player.username?.toLowerCase().includes(searchLower) ||
             player.email?.toLowerCase().includes(searchLower) ||
             player.full_name?.toLowerCase().includes(searchLower))
          )
        }

        // Apply KYC status filter
        if (filters.kycStatus) {
          filteredData = filteredData.filter(player => 
            player.kyc_status === filters.kycStatus
          )
        }

        // Apply account status filter
        if (filters.accountStatus) {
          filteredData = filteredData.filter(player => 
            player.account_status === filters.accountStatus
          )
        }

        // Apply date range filter
        if (filters.dateRange) {
          const fromDate = filters.dateRange.from.getTime()
          const toDate = filters.dateRange.to.getTime()
          filteredData = filteredData.filter(player => {
            const playerDate = new Date(player.created_at || '').getTime()
            return playerDate >= fromDate && playerDate <= toDate
          })
        }

        // Sort by created_at desc
        filteredData.sort((a, b) => {
          const dateA = new Date(a.created_at || '').getTime()
          const dateB = new Date(b.created_at || '').getTime()
          return dateB - dateA
        })

        setPlayers(filteredData)
      } catch (error) {
        console.error('Error details:', error)
        setError('Failed to fetch players. Check console for details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [supabase, filters])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Players List</h1>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Create Player
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={players}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={isLoading}
      />
    </div>
  )
} 