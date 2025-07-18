'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CreditCard,
  Activity,
  Edit2,
  Save,
  Ban,
  Key,
  FileText,
  Settings,
  Flag,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { Player } from '@/types/player'

interface PlayerModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
}

// View Player Profile Modal
export function ViewPlayerProfileModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [playerStats, setPlayerStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBets: 0,
    totalWins: 0,
    currentBalance: 0,
    lastLoginDate: null as string | null,
    registrationDate: null as string | null,
    kycDocuments: 0,
    supportTickets: 0,
    flaggedTransactions: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (player && isOpen) {
      fetchPlayerStats()
    }
  }, [player, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlayerStats = async () => {
    if (!player) return
    
    setIsLoading(true)
    try {
      // TODO: Implement actual API calls to fetch player stats
      // For now, using mock data
      setTimeout(() => {
        setPlayerStats({
          totalDeposits: 1250.00,
          totalWithdrawals: 800.00,
          totalBets: 2150.00,
          totalWins: 1890.00,
          currentBalance: 340.00,
          lastLoginDate: new Date().toISOString(),
          registrationDate: player.created_at,
          kycDocuments: 3,
          supportTickets: 2,
          flaggedTransactions: 0
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching player stats:', error)
      setIsLoading(false)
    }
  }

  if (!isOpen || !player) return null

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'suspended': return 'text-red-600 bg-red-50'
      case 'banned': return 'text-red-800 bg-red-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Player Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading player data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Player Basic Info */}
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {player.full_name?.charAt(0) || player.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{player.full_name || 'No Name'}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccountStatusColor(player.account_status || 'unknown')}`}>
                        {player.account_status || 'Unknown'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">{player.username || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{player.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Joined:</span>
                        <span className="font-medium">{new Date(player.created_at || '').toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">KYC Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKycStatusColor(player.kyc_status || 'unknown')}`}>
                          {player.kyc_status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Financial Summary */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Financial Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">${playerStats.totalDeposits.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Deposits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">${playerStats.totalWithdrawals.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Withdrawals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">${playerStats.totalBets.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Bets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">${playerStats.totalWins.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">${playerStats.currentBalance.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Current Balance</p>
                  </div>
                </div>
              </Card>

              {/* Activity Summary */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{playerStats.kycDocuments}</p>
                    <p className="text-sm text-gray-600">KYC Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{playerStats.supportTickets}</p>
                    <p className="text-sm text-gray-600">Support Tickets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{playerStats.flaggedTransactions}</p>
                    <p className="text-sm text-gray-600">Flagged Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {playerStats.lastLoginDate ? new Date(playerStats.lastLoginDate).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="text-sm text-gray-600">Last Login</p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Ban className="h-4 w-4" />
                    Account Status
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Key className="h-4 w-4" />
                    Reset Password
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    View Notes
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Set Limits
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Flag className="h-4 w-4" />
                    Flag Account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Edit Player Info Modal
export function EditPlayerInfoModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (player && isOpen) {
      setFormData({
        username: player.username || '',
        email: player.email || '',
        full_name: player.full_name || '',
        phone: '', // TODO: Add to player type
        address: '', // TODO: Add to player type
        city: '', // TODO: Add to player type
        country: '' // TODO: Add to player type
      })
    }
  }, [player, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // TODO: Implement actual API call to update player info
      console.log('Updating player info:', formData)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onClose()
    } catch (error) {
      console.error('Error updating player info:', error)
      setErrors({ general: 'Failed to update player information' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Player Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <Input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Account Status Modal
export function AccountStatusModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (player && isOpen) {
      setSelectedStatus(player.account_status || 'active')
      setReason('')
    }
  }, [player, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to update account status
      console.log('Updating account status:', { playerId: player?.id, status: selectedStatus, reason })
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onClose()
    } catch (error) {
      console.error('Error updating account status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !player) return null

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-green-600', icon: CheckCircle },
    { value: 'suspended', label: 'Suspended', color: 'text-yellow-600', icon: AlertTriangle },
    { value: 'banned', label: 'Banned', color: 'text-red-600', icon: Ban }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Account Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status: {player.account_status || 'Unknown'}
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => {
                const Icon = option.icon
                return (
                  <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="text-blue-600"
                    />
                    <Icon className={`h-5 w-5 ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none h-20"
              placeholder="Enter reason for status change..."
              disabled={isLoading}
            />
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Password Reset Modal
export function PasswordResetModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to trigger password reset
      console.log('Triggering password reset for player:', player?.id)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEmailSent(true)
    } catch (error) {
      console.error('Error triggering password reset:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmailSent(false)
    onClose()
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Password Reset</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {emailSent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Sent</h3>
              <p className="text-gray-600 mb-4">
                A password reset email has been sent to <strong>{player.email}</strong>.
                The player will receive instructions on how to reset their password.
              </p>
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to trigger a password reset for this player?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{player.full_name || player.username}</p>
                      <p className="text-sm text-gray-600">{player.email}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  The player will receive an email with instructions to reset their password.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Send Reset Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Admin Notes Modal
export function AdminNotesModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [notes, setNotes] = useState<Array<{ id: string; content: string; author: string; created_at: string }>>([])
  const [newNote, setNewNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (player && isOpen) {
      fetchNotes()
    }
  }, [player, isOpen])

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API call to fetch admin notes
      // Mock data for now
      setTimeout(() => {
        setNotes([
          {
            id: '1',
            content: 'Player contacted support regarding withdrawal delay. Issue resolved.',
            author: 'Admin User',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            content: 'KYC documents verified successfully.',
            author: 'Support Team',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching admin notes:', error)
      setIsLoading(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setIsAdding(true)
    try {
      // TODO: Implement actual API call to add admin note
      console.log('Adding admin note:', newNote)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add to local state
      const note = {
        id: Date.now().toString(),
        content: newNote,
        author: 'Current Admin',
        created_at: new Date().toISOString()
      }
      setNotes([note, ...notes])
      setNewNote('')
    } catch (error) {
      console.error('Error adding admin note:', error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Admin Notes</h2>
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

          {/* Add New Note */}
          <form onSubmit={handleAddNote} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Note
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none h-24 mb-3"
              placeholder="Enter your note here..."
              disabled={isAdding}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isAdding || !newNote.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Previous Notes</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notes found for this player.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{note.author}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Send Email Modal
export function SendEmailModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const emailTemplates = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'welcome', label: 'Welcome Message' },
    { value: 'kyc_reminder', label: 'KYC Reminder' },
    { value: 'promotion', label: 'Promotion Offer' },
    { value: 'account_update', label: 'Account Update' }
  ]

  const handleTemplateChange = (template: string) => {
    setEmailData({ ...emailData, template })
    
    // Set default content based on template
    switch (template) {
      case 'welcome':
        setEmailData({
          template,
          subject: 'Welcome to LuckyPunt!',
          message: `Hello ${player?.full_name || player?.username},\n\nWelcome to LuckyPunt! We're excited to have you join our community.\n\nBest regards,\nThe LuckyPunt Team`
        })
        break
      case 'kyc_reminder':
        setEmailData({
          template,
          subject: 'KYC Verification Required',
          message: `Hello ${player?.full_name || player?.username},\n\nTo complete your account setup, please submit your KYC documents.\n\nBest regards,\nThe LuckyPunt Team`
        })
        break
      case 'promotion':
        setEmailData({
          template,
          subject: 'Special Promotion Just for You!',
          message: `Hello ${player?.full_name || player?.username},\n\nWe have a special promotion available for you!\n\nBest regards,\nThe LuckyPunt Team`
        })
        break
      case 'account_update':
        setEmailData({
          template,
          subject: 'Account Update Notification',
          message: `Hello ${player?.full_name || player?.username},\n\nWe're writing to inform you about an update to your account.\n\nBest regards,\nThe LuckyPunt Team`
        })
        break
      default:
        setEmailData({
          template,
          subject: '',
          message: ''
        })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to send email
      console.log('Sending email:', emailData)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEmailSent(true)
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmailSent(false)
    setEmailData({ subject: '', message: '', template: 'custom' })
    onClose()
  }

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Send Email</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {emailSent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent Successfully</h3>
              <p className="text-gray-600 mb-4">
                Your email has been sent to <strong>{player.email}</strong>.
              </p>
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Player Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">To: {player.full_name || player.username}</p>
                    <p className="text-sm text-gray-600">{player.email}</p>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={emailData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  disabled={isLoading}
                >
                  {emailTemplates.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Enter email subject"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="w-full p-3 border rounded-lg resize-none h-32"
                  placeholder="Enter your message here..."
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// View Transactions Modal
export function ViewTransactionsModal({ player, isOpen, onClose }: PlayerModalProps) {
  const [transactions, setTransactions] = useState<Array<{
    id: string
    type: 'deposit' | 'withdrawal' | 'bet' | 'win'
    amount: number
    status: 'completed' | 'pending' | 'failed'
    created_at: string
    method?: string
    description?: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (player && isOpen) {
      fetchTransactions()
    }
  }, [player, isOpen])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API call to fetch transactions
      // Mock data for now
      setTimeout(() => {
        setTransactions([
          {
            id: '1',
            type: 'deposit',
            amount: 250.00,
            status: 'completed',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            method: 'Credit Card',
            description: 'Deposit via Visa ending in 4242'
          },
          {
            id: '2',
            type: 'bet',
            amount: 50.00,
            status: 'completed',
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            description: 'Bet on Football Match'
          },
          {
            id: '3',
            type: 'win',
            amount: 125.00,
            status: 'completed',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            description: 'Win from Football Match'
          },
          {
            id: '4',
            type: 'withdrawal',
            amount: 100.00,
            status: 'pending',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            method: 'Bank Transfer',
            description: 'Withdrawal to Bank Account'
          },
          {
            id: '5',
            type: 'deposit',
            amount: 500.00,
            status: 'completed',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            method: 'Bitcoin',
            description: 'Crypto deposit'
          }
        ])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600 bg-green-50'
      case 'withdrawal': return 'text-red-600 bg-red-50'
      case 'bet': return 'text-blue-600 bg-blue-50'
      case 'win': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    return transaction.type === filter
  })

  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
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
          <div className="flex gap-2 mb-6">
            {['all', 'deposit', 'withdrawal', 'bet', 'win'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions found.</p>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">${transaction.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        {transaction.method && (
                          <p className="text-sm text-gray-500">Method: {transaction.method}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
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