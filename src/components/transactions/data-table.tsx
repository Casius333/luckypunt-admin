import { useState } from 'react'
import { Transaction, TransactionListFilters, TransactionTableColumn } from '@/types/transaction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  RefreshCw
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Helper function to truncate text
const TruncatedCell = ({ content, maxLength = 12 }: { content: string, maxLength?: number }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  if (content.length <= maxLength) {
    return <span className="text-sm text-gray-900">{content}</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="text-sm text-gray-900 hover:text-blue-600 focus:outline-none cursor-pointer"
          >
            {content.slice(0, maxLength)}...
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-all">{content}</p>
          <p className="text-xs mt-1 opacity-75">{copied ? 'Copied!' : 'Click to copy'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Action menu component
const ActionMenu = ({ transaction, onActionSelect }: { 
  transaction: Transaction
  onActionSelect: (action: string, transaction: Transaction) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { id: 'view-details', label: 'View Details', icon: Eye },
    ...(transaction.status === 'pending' ? [
      { id: 'approve', label: 'Approve', icon: Check },
      { id: 'cancel', label: 'Cancel', icon: X },
    ] : []),
    { id: 'refresh-status', label: 'Refresh Status', icon: RefreshCw },
  ]

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[140px]">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onActionSelect(action.id, transaction)
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface DataTableProps {
  data: Transaction[]
  columns: TransactionTableColumn[]
  filters?: TransactionListFilters
  onFiltersChange?: (filters: TransactionListFilters) => void
  isLoading?: boolean
}

export function DataTable({ 
  data, 
  columns, 
  filters = {}, 
  onFiltersChange, 
  isLoading = false 
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Transaction>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  const handleActionSelect = (action: string, transaction: Transaction) => {
    switch (action) {
      case 'view-details':
        // TODO: Open transaction details modal
        console.log('View details for transaction:', transaction.id)
        break
      case 'approve':
        // TODO: Approve transaction
        console.log('Approve transaction:', transaction.id)
        break
      case 'cancel':
        // TODO: Cancel transaction
        console.log('Cancel transaction:', transaction.id)
        break
      case 'refresh-status':
        // TODO: Refresh transaction status
        console.log('Refresh status for transaction:', transaction.id)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const handleSort = (columnId: keyof Transaction) => {
    if (columnId === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange?.({
      ...filters,
      search: value || undefined
    })
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const formatValue = (value: unknown, columnId: string) => {
    if (value === null || value === undefined) return ''
    
    switch (columnId) {
      case 'amount':
        return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value)
      case 'created_at':
      case 'updated_at':
      case 'processed_at':
        return typeof value === 'string' && value ? new Date(value).toLocaleDateString() : ''
      case 'status':
        return typeof value === 'string' && value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
      case 'type':
        return typeof value === 'string' && value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
      case 'payment_method':
        return typeof value === 'string' && value ? value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : ''
      default:
        return String(value)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return 'bg-blue-100 text-blue-800'
      case 'withdrawal':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 bg-white">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.id as keyof Transaction)}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      {column.label}
                      {sortColumn === column.id && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paginatedData.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-4 whitespace-nowrap">
                      {column.id === 'actions' ? (
                        <ActionMenu 
                          transaction={transaction} 
                          onActionSelect={handleActionSelect} 
                        />
                      ) : column.id === 'status' ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {formatValue(transaction[column.id as keyof Transaction], column.id)}
                        </span>
                      ) : column.id === 'type' ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                          {formatValue(transaction[column.id as keyof Transaction], column.id)}
                        </span>
                      ) : (
                        <TruncatedCell 
                          content={formatValue(transaction[column.id as keyof Transaction], column.id)} 
                          maxLength={column.id === 'id' ? 8 : 20} 
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border border-gray-300 rounded-md shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of{' '}
              {data.length} results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 