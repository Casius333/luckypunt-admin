'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Users,
  BarChart3,
  Gift,
  TrendingUp,
  DollarSign,
  Target,
  Clock
} from 'lucide-react'

interface Promotion {
  id: string
  name: string
  description?: string
  
  // Bonus Details
  bonus_percent?: number
  min_deposit_amount?: number
  max_deposit_amount?: number
  wagering_requirement?: number
  
  // Type and Schedule
  promotion_type?: 'deposit_bonus' | 'free_bonus' | 'cashback' | 'free_spins' | 'reload_bonus'
  schedule_days?: string[] // ['monday', 'friday'] or ['everyday']
  usage_type?: 'once_off' | 'recurring'
  daily_usage_limit?: number
  
  // Date Range
  start_at?: string
  end_at?: string
  
  // Status
  is_active?: boolean
  
  // Metadata
  created_at?: string
  updated_at?: string
}



export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const supabase = createClientComponentClient()
  
  // For now, use regular client - we'll configure RLS properly

  useEffect(() => {
    fetchPromotions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPromotions = async () => {
    try {
      console.log('Fetching promotions from database...') // Debug log
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching promotions:', error)
        // Check if it's an authentication error
        if (error.message.includes('JWT') || error.message.includes('auth')) {
          console.log('Authentication error detected, redirecting to login...')
          window.location.href = '/login'
          return
        }
        // If table doesn't exist, show empty state
        setPromotions([])
      } else {
        console.log('Fetched promotions data:', data) // Debug log
        console.log('Number of promotions:', data?.length || 0) // Debug log
        setPromotions(data || [])
        console.log('Promotions state updated') // Debug log
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
      // Check if it's a network or auth error
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('auth'))) {
        console.log('Network or auth error, redirecting to login...')
        window.location.href = '/login'
        return
      }
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  const togglePromotionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        console.error('Error updating promotion status:', error)
      } else {
        fetchPromotions()
      }
    } catch (error) {
      console.error('Error updating promotion status:', error)
    }
  }

  const deletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting promotion:', error)
      } else {
        fetchPromotions()
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getPromotionTypeColor = (type: string | undefined) => {
    if (!type) return 'bg-gray-100 text-gray-800'
    switch (type) {
      case 'deposit_bonus': return 'bg-blue-100 text-blue-800'
      case 'free_bonus': return 'bg-green-100 text-green-800'
      case 'cashback': return 'bg-purple-100 text-purple-800'
      case 'free_spins': return 'bg-pink-100 text-pink-800'
      case 'reload_bonus': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPromotionTypeIcon = (type: string | undefined) => {
    if (!type) return <Gift className="h-4 w-4" />
    switch (type) {
      case 'deposit_bonus': return <DollarSign className="h-4 w-4" />
      case 'free_bonus': return <Gift className="h-4 w-4" />
      case 'cashback': return <TrendingUp className="h-4 w-4" />
      case 'free_spins': return <Target className="h-4 w-4" />
      case 'reload_bonus': return <BarChart3 className="h-4 w-4" />
      default: return <Gift className="h-4 w-4" />
    }
  }

  const formatSchedule = (promotion: Promotion) => {
    if (!promotion.schedule_days || promotion.schedule_days.length === 0) {
      return 'Not scheduled'
    }
    if (promotion.schedule_days.includes('everyday')) {
      return 'Every day'
    }
    return promotion.schedule_days.map(day => 
      day.charAt(0).toUpperCase() + day.slice(1)
    ).join(', ')
  }

  const savePromotion = async (formData: FormData) => {
    console.log('savePromotion called') // Debug log
    setSaving(true)
    
    try {
      // Get selected schedule days
      const scheduleDays: string[] = []
      if (formData.get('monday')) scheduleDays.push('monday')
      if (formData.get('tuesday')) scheduleDays.push('tuesday')
      if (formData.get('wednesday')) scheduleDays.push('wednesday')
      if (formData.get('thursday')) scheduleDays.push('thursday')
      if (formData.get('friday')) scheduleDays.push('friday')
      if (formData.get('saturday')) scheduleDays.push('saturday')
      if (formData.get('sunday')) scheduleDays.push('sunday')
      if (formData.get('everyday')) scheduleDays.push('everyday')

      console.log('Schedule days:', scheduleDays) // Debug log

      // Extract form data and map to both old and new column names for compatibility
      const maxDepositAmount = formData.get('max_deposit_amount') ? parseFloat(formData.get('max_deposit_amount') as string) : null
      
      // Handle date fields
      const startAt = formData.get('start_at') ? new Date(formData.get('start_at') as string).toISOString() : null
      const endAt = formData.get('end_at') ? new Date(formData.get('end_at') as string).toISOString() : null
      
      const promotionData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        bonus_percent: formData.get('bonus_percent') ? parseFloat(formData.get('bonus_percent') as string) : null,
        min_deposit_amount: formData.get('min_deposit_amount') ? parseFloat(formData.get('min_deposit_amount') as string) : null,
        max_deposit_amount: maxDepositAmount,
        max_bonus_amount: maxDepositAmount, // Map to old column name for compatibility
        wagering_requirement: formData.get('wagering_requirement') ? parseFloat(formData.get('wagering_requirement') as string) : null,
        promotion_type: formData.get('promotion_type') as string,
        usage_type: formData.get('usage_type') as string,
        daily_usage_limit: formData.get('daily_usage_limit') ? parseInt(formData.get('daily_usage_limit') as string) : 1,
        schedule_days: scheduleDays,
        start_at: startAt,
        end_at: endAt,
        updated_at: new Date().toISOString()
      }

      console.log('Promotion data:', promotionData) // Debug log

      let result
      if (editingPromotion) {
        console.log('Updating promotion:', editingPromotion.id) // Debug log
        console.log('Attempting update...') // Debug log
        // Update existing promotion and return the updated data
        result = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editingPromotion.id)
          .select()
        console.log('Update result:', result) // Debug log
      } else {
        console.log('Creating new promotion') // Debug log
        // Create new promotion
        result = await supabase
          .from('promotions')
          .insert([{ ...promotionData, created_at: new Date().toISOString() }])
          .select()
        console.log('Create result:', result) // Debug log
      }

      if (result.error) {
        console.error('Error saving promotion:', result.error)
        // Check if it's an authentication error
        if (result.error.message.includes('JWT') || result.error.message.includes('auth')) {
          alert('Session expired. Please login again.')
          window.location.href = '/login'
          return
        }
        alert('Error saving promotion: ' + result.error.message)
      } else {
        console.log('Promotion saved successfully') // Debug log
        alert(`Promotion ${editingPromotion ? 'updated' : 'created'} successfully!`)
        
        // Close form and refresh data
        setShowCreateForm(false)
        setEditingPromotion(null)
        
        console.log('Form closed, fetching promotions...') // Debug log
        await fetchPromotions()
        console.log('Promotions fetched successfully') // Debug log
      }
    } catch (error) {
      console.error('Error saving promotion:', error)
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('auth')) {
          alert('Connection error. Please check your internet connection and try again.')
        } else {
          alert('Error saving promotion: ' + error.message)
        }
      } else {
        alert('An unexpected error occurred. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Promotions Management</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Promotions Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.filter(p => p.is_active ?? true).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Recurring Promotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.filter(p => p.usage_type === 'recurring').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Promotions List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Promotion List</h2>
            {promotions.length === 0 && (
              <p className="text-sm text-gray-500">No promotions found. Create your first promotion to get started.</p>
            )}
          </div>
          
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No promotions</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first promotion.</p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promotion
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promotion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonus Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promotions.map((promotion) => (
                    <tr key={promotion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              {getPromotionTypeIcon(promotion.promotion_type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {promotion.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {promotion.bonus_percent ? `${promotion.bonus_percent}% bonus` : 'Custom promotion'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPromotionTypeColor(promotion.promotion_type)}`}>
                          {promotion.promotion_type?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>Bonus: {promotion.bonus_percent ? `${promotion.bonus_percent}%` : 'Not specified'}</div>
                          <div>Min: {promotion.min_deposit_amount ? formatCurrency(promotion.min_deposit_amount) : 'Not specified'}</div>
                          <div>Max: {promotion.max_deposit_amount ? formatCurrency(promotion.max_deposit_amount) : 'Not specified'}</div>
                          <div>Wagering: {promotion.wagering_requirement ? `${promotion.wagering_requirement}x` : 'Not specified'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <div>
                              <div>Start: {formatDate(promotion.start_at || '')}</div>
                              <div>End: {formatDate(promotion.end_at || '')}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <div>{formatSchedule(promotion)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          promotion.usage_type === 'recurring' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {promotion.usage_type === 'recurring' ? 'Recurring' : 'Once Off'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-center">
                          {promotion.daily_usage_limit || 1} per day
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePromotionStatus(promotion.id, promotion.is_active ?? true)}
                          >
                            {(promotion.is_active ?? true) ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPromotion(promotion)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePromotion(promotion.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Promotion Modal */}
      {(showCreateForm || editingPromotion) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </h3>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  console.log('Form submitted') // Debug log
                  e.preventDefault()
                  console.log('Form default prevented') // Debug log
                  const formData = new FormData(e.currentTarget)
                  console.log('FormData created:', formData) // Debug log
                  savePromotion(formData)
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Promotion Name
                    </label>
                    <Input
                      name="name"
                      defaultValue={editingPromotion?.name || ''}
                      placeholder="e.g., Welcome Bonus"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Promotion Type
                    </label>
                    <select 
                      name="promotion_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={editingPromotion?.promotion_type || 'deposit_bonus'}
                    >
                      <option value="deposit_bonus">Deposit Bonus</option>
                      <option value="free_bonus">Free Bonus</option>
                      <option value="cashback">Cashback</option>
                      <option value="free_spins">Free Spins</option>
                      <option value="reload_bonus">Reload Bonus</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    defaultValue={editingPromotion?.description || ''}
                    placeholder="Describe the promotion..."
                  />
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Bonus Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Bonus Percentage (%)
                      </label>
                      <Input
                        name="bonus_percent"
                        type="number"
                        defaultValue={editingPromotion?.bonus_percent || ''}
                        placeholder="100"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Wagering Requirement (x)
                      </label>
                      <Input
                        name="wagering_requirement"
                        type="number"
                        defaultValue={editingPromotion?.wagering_requirement || ''}
                        placeholder="25"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Min Deposit ($)
                      </label>
                      <Input
                        name="min_deposit_amount"
                        type="number"
                        defaultValue={editingPromotion?.min_deposit_amount || ''}
                        placeholder="20"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Max Deposit ($)
                      </label>
                      <Input
                        name="max_deposit_amount"
                        type="number"
                        defaultValue={editingPromotion?.max_deposit_amount || ''}
                        placeholder="1000"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Date Range</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Start Date <span className="text-gray-500 text-xs">(when promotion becomes active)</span>
                      </label>
                      <Input
                        name="start_at"
                        type="datetime-local"
                        defaultValue={editingPromotion?.start_at ? new Date(editingPromotion.start_at).toISOString().slice(0, 16) : ''}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        End Date <span className="text-gray-500 text-xs">(when promotion expires)</span>
                      </label>
                      <Input
                        name="end_at"
                        type="datetime-local"
                        defaultValue={editingPromotion?.end_at ? new Date(editingPromotion.end_at).toISOString().slice(0, 16) : ''}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>💡 <strong>Tip:</strong> For recurring promotions (like &ldquo;Every Sunday&rdquo;), set the end date to 1-2 years in the future so the promotion runs until that date.</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Schedule & Usage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Usage Type
                      </label>
                      <select 
                        name="usage_type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={editingPromotion?.usage_type || 'once_off'}
                      >
                        <option value="once_off">Once Off (Sign-up bonus)</option>
                        <option value="recurring">Recurring (Weekly bonus)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Daily Usage Limit
                      </label>
                      <Input
                        name="daily_usage_limit"
                        type="number"
                        defaultValue={editingPromotion?.daily_usage_limit || 1}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Schedule Days
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'everyday'].map(day => (
                        <label key={day} className="flex items-center">
                          <input 
                            type="checkbox" 
                            name={day}
                            className="mr-2" 
                            defaultChecked={editingPromotion?.schedule_days?.includes(day) || false}
                          />
                          <span className="text-sm capitalize text-gray-900">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Fixed Footer with Buttons */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingPromotion(null)
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  disabled={saving}
                  onClick={(e) => {
                    console.log('Submit button clicked') // Debug log
                    const modal = e.currentTarget.closest('.bg-white')
                    const form = modal?.querySelector('form') as HTMLFormElement
                    if (form) {
                      console.log('Form found, creating FormData') // Debug log
                      const formData = new FormData(form)
                      console.log('FormData created, calling savePromotion') // Debug log
                      savePromotion(formData)
                    } else {
                      console.log('Form not found!') // Debug log
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingPromotion ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingPromotion ? 'Update Promotion' : 'Create Promotion'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 