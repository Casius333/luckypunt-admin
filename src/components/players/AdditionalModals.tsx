'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  X, 
  Settings,
  CreditCard,
  Save,
  Activity,
  Flag,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Monitor,
  MapPin,
  Clock
} from 'lucide-react'
import type { Player } from '@/types/player'

interface PlayerModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
}

// Set Limits Modal
export function SetLimitsModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [limits, setLimits] = useState({
    dailyDepositLimit: '',
    weeklyDepositLimit: '',
    monthlyDepositLimit: '',
    dailyWithdrawalLimit: '',
    weeklyWithdrawalLimit: '',
    monthlyWithdrawalLimit: '',
    dailyBetLimit: '',
    weeklyBetLimit: '',
    monthlyBetLimit: '',
    maxBetAmount: '',
    sessionTimeLimit: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (player && isOpen) {
      fetchCurrentLimits()
    }
  }, [player, isOpen])

  const fetchCurrentLimits = async () => {
    try {
      // TODO: Implement actual API call to fetch current limits
      // Mock data for now
      setLimits({
        dailyDepositLimit: '1000',
        weeklyDepositLimit: '5000',
        monthlyDepositLimit: '20000',
        dailyWithdrawalLimit: '2000',
        weeklyWithdrawalLimit: '10000',
        monthlyWithdrawalLimit: '50000',
        dailyBetLimit: '500',
        weeklyBetLimit: '2500',
        monthlyBetLimit: '10000',
        maxBetAmount: '100',
        sessionTimeLimit: '240'
      })
    } catch (error) {
      console.error('Error fetching limits:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to update limits
      console.log('Updating limits for player:', player?.id, limits)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onClose()
    } catch (error) {
      console.error('Error updating limits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Set Player Limits</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Player Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {player.full_name?.charAt(0) || player.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{player.full_name || player.username}</p>
                <p className="text-sm text-gray-600">{player.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deposit Limits */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Deposit Limits
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.dailyDepositLimit}
                    onChange={(e) => setLimits({ ...limits, dailyDepositLimit: e.target.value })}
                    placeholder="1000"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.weeklyDepositLimit}
                    onChange={(e) => setLimits({ ...limits, weeklyDepositLimit: e.target.value })}
                    placeholder="5000"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.monthlyDepositLimit}
                    onChange={(e) => setLimits({ ...limits, monthlyDepositLimit: e.target.value })}
                    placeholder="20000"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </Card>

            {/* Withdrawal Limits */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Withdrawal Limits
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.dailyWithdrawalLimit}
                    onChange={(e) => setLimits({ ...limits, dailyWithdrawalLimit: e.target.value })}
                    placeholder="2000"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.weeklyWithdrawalLimit}
                    onChange={(e) => setLimits({ ...limits, weeklyWithdrawalLimit: e.target.value })}
                    placeholder="10000"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.monthlyWithdrawalLimit}
                    onChange={(e) => setLimits({ ...limits, monthlyWithdrawalLimit: e.target.value })}
                    placeholder="50000"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </Card>

            {/* Betting Limits */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Betting Limits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Bet Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.dailyBetLimit}
                    onChange={(e) => setLimits({ ...limits, dailyBetLimit: e.target.value })}
                    placeholder="500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Bet Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.weeklyBetLimit}
                    onChange={(e) => setLimits({ ...limits, weeklyBetLimit: e.target.value })}
                    placeholder="2500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Bet Limit ($)</label>
                  <Input
                    type="number"
                    value={limits.monthlyBetLimit}
                    onChange={(e) => setLimits({ ...limits, monthlyBetLimit: e.target.value })}
                    placeholder="10000"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Single Bet ($)</label>
                  <Input
                    type="number"
                    value={limits.maxBetAmount}
                    onChange={(e) => setLimits({ ...limits, maxBetAmount: e.target.value })}
                    placeholder="100"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </Card>

            {/* Session Limits */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Session Limits
              </h3>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={limits.sessionTimeLimit}
                  onChange={(e) => setLimits({ ...limits, sessionTimeLimit: e.target.value })}
                  placeholder="240"
                  disabled={isLoading}
                />
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Limits
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Balance Adjustment Modal
export function BalanceAdjustmentModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'credit' as 'credit' | 'debit',
    reason: '',
    category: 'manual_adjustment'
  })
  const [currentBalance, setCurrentBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (player && isOpen) {
      fetchCurrentBalance()
    }
  }, [player, isOpen])

  const fetchCurrentBalance = async () => {
    try {
      // TODO: Implement actual API call to fetch current balance
      // Mock data for now
      setCurrentBalance(340.50)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to adjust balance
      console.log('Adjusting balance for player:', player?.id, adjustmentData)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onClose()
    } catch (error) {
      console.error('Error adjusting balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNewBalance = () => {
    const adjustment = parseFloat(adjustmentData.amount) || 0
    if (adjustmentData.type === 'credit') {
      return currentBalance + adjustment
    } else {
      return currentBalance - adjustment
    }
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Balance Adjustment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Player Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {player.full_name?.charAt(0) || player.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{player.full_name || player.username}</p>
                <p className="text-sm text-gray-600">Current Balance: ${currentBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="type"
                    value="credit"
                    checked={adjustmentData.type === 'credit'}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value as 'credit' | 'debit' })}
                    className="text-green-600"
                  />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Credit</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="type"
                    value="debit"
                    checked={adjustmentData.type === 'debit'}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value as 'credit' | 'debit' })}
                    className="text-red-600"
                  />
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">Debit</span>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={adjustmentData.amount}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })}
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={adjustmentData.category}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, category: e.target.value })}
                className="w-full p-2 border rounded-lg"
                disabled={isLoading}
              >
                <option value="manual_adjustment">Manual Adjustment</option>
                <option value="bonus">Bonus</option>
                <option value="refund">Refund</option>
                <option value="correction">Correction</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                className="w-full p-3 border rounded-lg resize-none h-20"
                placeholder="Enter reason for adjustment..."
                required
                disabled={isLoading}
              />
            </div>

            {/* Balance Preview */}
            {adjustmentData.amount && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span>Current Balance:</span>
                  <span className="font-medium">${currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Adjustment:</span>
                  <span className={`font-medium ${adjustmentData.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustmentData.type === 'credit' ? '+' : '-'}${parseFloat(adjustmentData.amount || '0').toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>New Balance:</span>
                    <span className="text-blue-600">${calculateNewBalance().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Apply Adjustment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 

// Activity Log Modal
export function ActivityLogModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [activityData, setActivityData] = useState<Array<{
    id: string
    type: 'login' | 'logout' | 'bet' | 'deposit' | 'withdrawal' | 'password_change' | 'profile_update'
    description: string
    ip_address: string
    device: string
    location: string
    created_at: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (player && isOpen) {
      fetchActivityLog()
    }
  }, [player, isOpen])

  const fetchActivityLog = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API call to fetch activity log
      // Mock data for now
      setTimeout(() => {
        setActivityData([
          {
            id: '1',
            type: 'login',
            description: 'User logged in successfully',
            ip_address: '192.168.1.100',
            device: 'Chrome 118.0 on macOS',
            location: 'New York, USA',
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            type: 'bet',
            description: 'Placed bet on Football Match ($50.00)',
            ip_address: '192.168.1.100',
            device: 'Chrome 118.0 on macOS',
            location: 'New York, USA',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            type: 'deposit',
            description: 'Deposit via Credit Card ($250.00)',
            ip_address: '192.168.1.100',
            device: 'Chrome 118.0 on macOS',
            location: 'New York, USA',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            type: 'login',
            description: 'User logged in successfully',
            ip_address: '10.0.0.50',
            device: 'Safari 16.4 on iPhone',
            location: 'New York, USA',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '5',
            type: 'profile_update',
            description: 'Updated profile information',
            ip_address: '192.168.1.100',
            device: 'Chrome 118.0 on macOS',
            location: 'New York, USA',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching activity log:', error)
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Activity className="h-4 w-4 text-green-600" />
      case 'logout': return <Activity className="h-4 w-4 text-gray-600" />
      case 'bet': return <DollarSign className="h-4 w-4 text-blue-600" />
      case 'deposit': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'withdrawal': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'password_change': return <Settings className="h-4 w-4 text-orange-600" />
      case 'profile_update': return <Settings className="h-4 w-4 text-purple-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredActivities = activityData.filter(activity => {
    if (filter === 'all') return true
    return activity.type === filter
  })

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Player Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {player.full_name?.charAt(0) || player.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{player.full_name || player.username}</p>
                <p className="text-sm text-gray-600">{player.email}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['all', 'login', 'logout', 'bet', 'deposit', 'withdrawal', 'password_change', 'profile_update'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterType.replace('_', ' ').charAt(0).toUpperCase() + filterType.replace('_', ' ').slice(1)}
              </button>
            ))}
          </div>

          {/* Activity List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading activity log...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activities found.</p>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3" />
                            <span>{activity.device}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{activity.location} • {activity.ip_address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(activity.created_at).toLocaleDateString()}</p>
                      <p>{new Date(activity.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Flag Account Modal
export function FlagAccountModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [flagData, setFlagData] = useState({
    type: 'investigation',
    priority: 'medium',
    reason: '',
    notes: '',
    assignedTo: '',
    autoSuspend: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const flagTypes = [
    { value: 'investigation', label: 'Investigation Required', color: 'text-yellow-600' },
    { value: 'suspicious_activity', label: 'Suspicious Activity', color: 'text-orange-600' },
    { value: 'kyc_review', label: 'KYC Review', color: 'text-blue-600' },
    { value: 'fraud_suspected', label: 'Fraud Suspected', color: 'text-red-600' },
    { value: 'bonus_abuse', label: 'Bonus Abuse', color: 'text-purple-600' },
    { value: 'payment_issues', label: 'Payment Issues', color: 'text-gray-600' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to flag account
      console.log('Flagging account for player:', player?.id, flagData)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onClose()
    } catch (error) {
      console.error('Error flagging account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Flag Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Player Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {player.full_name?.charAt(0) || player.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{player.full_name || player.username}</p>
                <p className="text-sm text-gray-600">{player.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Flag Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Flag Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {flagTypes.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={flagData.type === type.value}
                      onChange={(e) => setFlagData({ ...flagData, type: e.target.value })}
                      className="text-blue-600"
                    />
                    <Flag className={`h-4 w-4 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {priorityLevels.map((priority) => (
                  <label key={priority.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={flagData.priority === priority.value}
                      onChange={(e) => setFlagData({ ...flagData, priority: e.target.value })}
                      className="text-blue-600"
                    />
                    <AlertTriangle className={`h-4 w-4 ${priority.color}`} />
                    <span className="text-sm font-medium">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Flag
              </label>
              <select
                value={flagData.reason}
                onChange={(e) => setFlagData({ ...flagData, reason: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
                disabled={isLoading}
              >
                <option value="">Select a reason...</option>
                <option value="multiple_accounts">Multiple Accounts</option>
                <option value="unusual_betting_patterns">Unusual Betting Patterns</option>
                <option value="large_transactions">Large Transactions</option>
                <option value="failed_kyc">Failed KYC Verification</option>
                <option value="chargeback_dispute">Chargeback Dispute</option>
                <option value="suspicious_location">Suspicious Location</option>
                <option value="bonus_exploitation">Bonus Exploitation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={flagData.notes}
                onChange={(e) => setFlagData({ ...flagData, notes: e.target.value })}
                className="w-full p-3 border rounded-lg resize-none h-24"
                placeholder="Provide additional details about the flag..."
                disabled={isLoading}
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Team Member
              </label>
              <select
                value={flagData.assignedTo}
                onChange={(e) => setFlagData({ ...flagData, assignedTo: e.target.value })}
                className="w-full p-2 border rounded-lg"
                disabled={isLoading}
              >
                <option value="">Assign later...</option>
                <option value="compliance_team">Compliance Team</option>
                <option value="fraud_team">Fraud Team</option>
                <option value="kyc_team">KYC Team</option>
                <option value="senior_admin">Senior Admin</option>
              </select>
            </div>

            {/* Auto Suspend */}
            <div>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={flagData.autoSuspend}
                  onChange={(e) => setFlagData({ ...flagData, autoSuspend: e.target.checked })}
                  className="text-red-600"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-900">Auto-suspend account</p>
                  <p className="text-sm text-gray-600">Temporarily suspend the account while investigation is pending</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Flagging...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 