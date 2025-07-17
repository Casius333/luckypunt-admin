import { PlayerTableColumn } from '@/types/player'

export const columns: PlayerTableColumn[] = [
  {
    id: 'id',
    label: 'User ID',
    sortable: true
  },
  {
    id: 'actions',
    label: 'Actions',
    sortable: false
  },
  {
    id: 'username',
    label: 'Username',
    sortable: true,
    filterable: true
  },
  {
    id: 'kyc_status',
    label: 'KYC Status',
    sortable: true,
    filterable: true
  },
  {
    id: 'account_status',
    label: 'Account Status',
    sortable: true,
    filterable: true
  },
  {
    id: 'created_at',
    label: 'Registration Date',
    sortable: true
  },
  {
    id: 'updated_at',
    label: 'Last Activity',
    sortable: true
  }
] 