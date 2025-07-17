'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/transactions/data-table'
import { columns } from '@/components/transactions/columns'
import type { Transaction, TransactionListFilters, TransactionType, TransactionStatus, PaymentMethod } from '@/types/transaction'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TransactionListFilters>({
    search: '',
    type: null,
    status: null,
    paymentMethod: null,
    dateRange: undefined,
    amountRange: undefined
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Build the query - we'll get user emails in a separate query due to Supabase RLS limitations
        let query = supabase
          .from('transactions')
          .select(`
            id,
            user_id,
            type,
            amount,
            currency,
            status,
            payment_method,
            transaction_id,
            reference_id,
            created_at,
            updated_at,
            processed_at,
            notes
          `)
        
        // Apply filters at the database level where possible
        if (filters.type) {
          query = query.eq('type', filters.type)
        }

        if (filters.status) {
          query = query.eq('status', filters.status)
        }

        if (filters.paymentMethod) {
          query = query.eq('payment_method', filters.paymentMethod)
        }

        if (filters.dateRange?.from) {
          query = query.gte('created_at', filters.dateRange.from.toISOString())
        }

        if (filters.dateRange?.to) {
          query = query.lte('created_at', filters.dateRange.to.toISOString())
        }

        // Add ordering
        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
          console.error('Error fetching transactions:', error)
          throw error
        }

        // Get user emails for the transactions using the database function
        const userIds = [...new Set(data?.map(t => t.user_id).filter(Boolean) || [])]
        let userEmails: { [key: string]: string } = {}

        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .rpc('get_user_emails_for_transactions', { user_ids: userIds })

          if (!userError && userData) {
            userEmails = userData.reduce((acc: { [key: string]: string }, user: any) => {
              acc[user.user_id] = user.email
              return acc
            }, {})
          }
        }

        // Transform the data to include email addresses as usernames
        let transformedData: Transaction[] = (data || []).map(transaction => {
          return {
            ...transaction,
            username: userEmails[transaction.user_id] || `User ${transaction.user_id?.slice(0, 8)}...`,
            email: userEmails[transaction.user_id] || null
          }
        })

        // Apply client-side search filter for transaction_id and reference_id
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          transformedData = transformedData.filter(transaction => 
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.transaction_id?.toLowerCase().includes(searchLower) ||
            transaction.reference_id?.toLowerCase().includes(searchLower)
          )
        }

        if (filters.amountRange) {
          transformedData = transformedData.filter(transaction => 
            transaction.amount >= filters.amountRange!.min && 
            transaction.amount <= filters.amountRange!.max
          )
        }

        setTransactions(transformedData)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to fetch transactions. Check console for details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase, filters])

  // Calculate summary stats
  const totalTransactions = transactions.length
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0)
  const pendingCount = transactions.filter(t => t.status === 'pending').length
  const completedCount = transactions.filter(t => t.status === 'completed').length

  // Set default date range to last 30 days
  const setLast30Days = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    setFilters({
      ...filters,
      dateRange: {
        from: thirtyDaysAgo,
        to: today
      }
    })
  }

  const setLast7Days = () => {
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    setFilters({
      ...filters,
      dateRange: {
        from: sevenDaysAgo,
        to: today
      }
    })
  }

  const setToday = () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    setFilters({
      ...filters,
      dateRange: {
        from: startOfDay,
        to: endOfDay
      }
    })
  }

  const clearDateFilter = () => {
    setFilters({
      ...filters,
      dateRange: undefined
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTransactions.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2
                }).format(totalDeposits)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Withdrawals</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2
                }).format(totalWithdrawals)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingCount.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Date Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">Date filters:</span>
        <Button variant="ghost" size="sm" onClick={setToday}>
          Today
        </Button>
        <Button variant="ghost" size="sm" onClick={setLast7Days}>
          Last 7 Days
        </Button>
        <Button variant="ghost" size="sm" onClick={setLast30Days}>
          Last 30 Days
        </Button>
        <Button variant="ghost" size="sm" onClick={() => {/* TODO: Implement custom date picker */}}>
          Custom Range
        </Button>
        <Button variant="ghost" size="sm" onClick={clearDateFilter}>
          Clear Filters
        </Button>
        {filters.dateRange && (
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {filters.dateRange.from.toLocaleDateString()} - {filters.dateRange.to.toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={isLoading}
      />
    </div>
  )
} 