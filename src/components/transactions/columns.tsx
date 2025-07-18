import { TransactionTableColumn } from '@/types/transaction'

export const columns: TransactionTableColumn[] = [
  {
    id: 'id',
    label: 'Transaction ID',
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
    id: 'email',
    label: 'Email',
    sortable: true,
    filterable: true
  },
  {
    id: 'type',
    label: 'Type',
    sortable: true,
    filterable: true
  },
  {
    id: 'amount',
    label: 'Amount',
    sortable: true
  },
  {
    id: 'currency',
    label: 'Currency',
    sortable: true,
    filterable: true
  },
  {
    id: 'status',
    label: 'Status',
    sortable: true,
    filterable: true
  },
  {
    id: 'payment_method',
    label: 'Payment Method',
    sortable: true,
    filterable: true
  },
  {
    id: 'transaction_id',
    label: 'External ID',
    sortable: true
  },
  {
    id: 'created_at',
    label: 'Created',
    sortable: true
  },
  {
    id: 'processed_at',
    label: 'Processed',
    sortable: true
  }
] 