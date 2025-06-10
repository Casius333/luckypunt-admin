import { useState } from 'react'
import { Player, PlayerListFilters, PlayerTableColumn } from '@/types/player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Search,
  Filter
} from 'lucide-react'

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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 w-[300px]"
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left font-medium text-gray-500"
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
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
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
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-center">
                  Loading...
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-center">
                  No players found
                </td>
              </tr>
            ) : (
              sortedData.map((player) => (
                <tr key={player.id} className="border-b">
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-3">
                      {column.id === 'actions' ? (
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      ) : (
                        player[column.id as keyof Player]?.toString() || '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 