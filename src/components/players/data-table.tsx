import { useState } from 'react'
import { Player, PlayerListFilters, PlayerTableColumn } from '@/types/player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Search,
  Filter,
  Copy,
  ChevronLeft,
  ChevronRight,
  User,
  Edit,
  Ban,
  Key,
  FileText,
  CreditCard,
  Settings,
  Activity,
  Flag,
  Mail
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ViewPlayerProfileModal, 
  EditPlayerInfoModal, 
  AccountStatusModal,
  PasswordResetModal,
  AdminNotesModal,
  SendEmailModal,
  ViewTransactionsModal
} from './PlayerModals'
import {
  SetLimitsModal,
  BalanceAdjustmentModal,
  ActivityLogModal,
  FlagAccountModal
} from './AdditionalModals'

// Helper function to truncate text
const TruncatedCell = ({ content, maxLength = 12 }: { content: string, maxLength?: number }) => {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!content || content.length <= maxLength) {
    return <span className="text-gray-700">{content || '-'}</span>
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <span className="truncate max-w-[150px] block text-gray-700 font-medium">
              {content}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white px-3 py-1.5 text-sm rounded-md shadow-lg">
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button
        onClick={() => copyToClipboard(content)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        <Copy className="h-3 w-3 text-gray-600 hover:text-gray-900" />
      </button>
    </div>
  )
}

// Actions Dropdown Component
const ActionsDropdown = ({ player, onActionSelect }: { player: Player, onActionSelect: (action: string, player: Player) => void }) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { id: 'view-profile', label: 'View Player Profile', icon: User },
    { id: 'edit-info', label: 'Edit Player Info', icon: Edit },
    { id: 'account-status', label: 'Account Status', icon: Ban },
    { id: 'password-reset', label: 'Password Reset', icon: Key },
    { id: 'admin-notes', label: 'Admin Notes', icon: FileText },
    { id: 'divider1', label: '', icon: null },
    { id: 'view-transactions', label: 'View Transactions', icon: CreditCard },
    { id: 'set-limits', label: 'Set Limits', icon: Settings },
    { id: 'balance-adjustment', label: 'Balance Adjustment', icon: CreditCard },
    { id: 'divider2', label: '', icon: null },
    { id: 'activity-log', label: 'Activity Log', icon: Activity },
    { id: 'flag-account', label: 'Flag Account', icon: Flag },
    { id: 'send-email', label: 'Send Email', icon: Mail },
  ]

  const handleActionClick = (actionId: string) => {
    if (actionId.startsWith('divider')) return
    onActionSelect(actionId, player)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
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
          <div className="absolute right-0 top-8 z-20 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1">
            {actions.map((action) => {
              if (action.id.startsWith('divider')) {
                return <div key={action.id} className="border-t border-gray-200 my-1" />
              }
              
              const Icon = action.icon!
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

interface DataTableProps {
  columns: PlayerTableColumn[]
  data: Player[]
  filters: PlayerListFilters
  onFiltersChange: (filters: PlayerListFilters) => void
  isLoading?: boolean
}

export function DataTable({
  columns,
  data,
  filters,
  onFiltersChange,
  isLoading = false
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Player>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  // Modal states
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false)
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false)
  const [isAccountStatusModalOpen, setIsAccountStatusModalOpen] = useState(false)
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false)
  const [isAdminNotesModalOpen, setIsAdminNotesModalOpen] = useState(false)
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false)
  const [isViewTransactionsModalOpen, setIsViewTransactionsModalOpen] = useState(false)
  const [isSetLimitsModalOpen, setIsSetLimitsModalOpen] = useState(false)
  const [isBalanceAdjustmentModalOpen, setIsBalanceAdjustmentModalOpen] = useState(false)
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false)
  const [isFlagAccountModalOpen, setIsFlagAccountModalOpen] = useState(false)

  const handleActionSelect = (action: string, player: Player) => {
    setSelectedPlayer(player)
    
    switch (action) {
      case 'view-profile':
        setIsViewProfileModalOpen(true)
        break
      case 'edit-info':
        setIsEditInfoModalOpen(true)
        break
      case 'account-status':
        setIsAccountStatusModalOpen(true)
        break
      case 'password-reset':
        setIsPasswordResetModalOpen(true)
        break
      case 'admin-notes':
        setIsAdminNotesModalOpen(true)
        break
      case 'view-transactions':
        setIsViewTransactionsModalOpen(true)
        break
      case 'set-limits':
        setIsSetLimitsModalOpen(true)
        break
      case 'balance-adjustment':
        setIsBalanceAdjustmentModalOpen(true)
        break
      case 'activity-log':
        setIsActivityLogModalOpen(true)
        break
      case 'flag-account':
        setIsFlagAccountModalOpen(true)
        break
      case 'send-email':
        setIsSendEmailModalOpen(true)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const closeModals = () => {
    setSelectedPlayer(null)
    setIsViewProfileModalOpen(false)
    setIsEditInfoModalOpen(false)
    setIsAccountStatusModalOpen(false)
    setIsPasswordResetModalOpen(false)
    setIsAdminNotesModalOpen(false)
    setIsSendEmailModalOpen(false)
    setIsViewTransactionsModalOpen(false)
    setIsSetLimitsModalOpen(false)
    setIsBalanceAdjustmentModalOpen(false)
    setIsActivityLogModalOpen(false)
    setIsFlagAccountModalOpen(false)
  }

  const handleSort = (columnId: keyof Player) => {
    if (columnId === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (aValue === null) return sortDirection === 'asc' ? -1 : 1
      if (bValue === null) return sortDirection === 'asc' ? 1 : -1
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    }
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 w-[300px] text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <Button variant="secondary" className="gap-2 text-gray-700 font-medium border-gray-300 hover:bg-gray-100">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-gray-300 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left font-semibold text-gray-900 bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && column.id !== 'actions' && (
                      <button
                        onClick={() => handleSort(column.id as keyof Player)}
                        className="focus:outline-none"
                      >
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 text-gray-900" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-900" />
                          )
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-center text-gray-700">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-center text-gray-700">
                  No players found
                </td>
              </tr>
            ) : (
              paginatedData.map((player) => (
                <tr 
                  key={player.id} 
                  className="group hover:bg-gray-50 transition-colors duration-150 h-12"
                >
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {column.id === 'actions' ? (
                        <ActionsDropdown player={player} onActionSelect={handleActionSelect} />
                      ) : (
                        <TruncatedCell 
                          content={player[column.id as keyof Player]?.toString() || ''} 
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
      
      {/* Modals */}
      <ViewPlayerProfileModal
        player={selectedPlayer}
        isOpen={isViewProfileModalOpen}
        onClose={closeModals}
      />
      <EditPlayerInfoModal
        player={selectedPlayer}
        isOpen={isEditInfoModalOpen}
        onClose={closeModals}
      />
      <AccountStatusModal
        player={selectedPlayer}
        isOpen={isAccountStatusModalOpen}
        onClose={closeModals}
      />
      <PasswordResetModal
        player={selectedPlayer}
        isOpen={isPasswordResetModalOpen}
        onClose={closeModals}
      />
      <AdminNotesModal
        player={selectedPlayer}
        isOpen={isAdminNotesModalOpen}
        onClose={closeModals}
      />
      <SendEmailModal
        player={selectedPlayer}
        isOpen={isSendEmailModalOpen}
        onClose={closeModals}
      />
      <ViewTransactionsModal
        player={selectedPlayer}
        isOpen={isViewTransactionsModalOpen}
        onClose={closeModals}
      />
      <SetLimitsModal
        player={selectedPlayer}
        isOpen={isSetLimitsModalOpen}
        onClose={closeModals}
      />
      <BalanceAdjustmentModal
        player={selectedPlayer}
        isOpen={isBalanceAdjustmentModalOpen}
        onClose={closeModals}
      />
      <ActivityLogModal
        player={selectedPlayer}
        isOpen={isActivityLogModalOpen}
        onClose={closeModals}
      />
      <FlagAccountModal
        player={selectedPlayer}
        isOpen={isFlagAccountModalOpen}
        onClose={closeModals}
      />
    </div>
  )
} 