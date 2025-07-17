export type TransactionType = 'deposit' | 'withdrawal'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'crypto' | 'e_wallet' | 'other'

export interface Transaction {
  id: string
  user_id: string
  username: string | null  // From joined auth.users table
  email: string | null     // From joined auth.users table
  type: TransactionType
  amount: number
  currency: string
  status: TransactionStatus
  payment_method: PaymentMethod
  transaction_id: string | null
  reference_id: string | null
  created_at: string
  updated_at: string
  processed_at: string | null
  notes: string | null
}

export interface TransactionListFilters {
  search?: string
  type?: TransactionType | null
  status?: TransactionStatus | null
  paymentMethod?: PaymentMethod | null
  dateRange?: {
    from: Date
    to: Date
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface TransactionTableColumn {
  id: keyof Transaction | 'actions'
  label: string
  sortable?: boolean
  filterable?: boolean
} 