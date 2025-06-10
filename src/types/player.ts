export type KycStatus = 'pending' | 'approved' | 'rejected'
export type AccountStatus = 'active' | 'suspended' | 'blocked'

export interface Player {
  id: string
  username: string | null
  email: string | null
  full_name: string | null
  avatar_url: string | null
  kyc_status: KycStatus | null
  account_status: AccountStatus | null
  created_at: string | null
  updated_at: string | null
}

export interface PlayerListFilters {
  search?: string
  kycStatus?: KycStatus | null
  accountStatus?: AccountStatus | null
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface PlayerTableColumn {
  id: keyof Player | 'actions'
  label: string
  sortable?: boolean
  filterable?: boolean
} 