import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import Input from '../ui/Input'
import Badge from '../ui/Badge'
import LoadingSpinner from '../ui/LoadingSpinner'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface FilterConfig {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  filters?: FilterConfig[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
  rowClassName?: (item: T) => string
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Rechercher...',
  searchFields = [],
  filters = [],
  isLoading = false,
  onRowClick,
  rowClassName,
  emptyMessage = 'Aucune donnée disponible',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(f => [f.key, 'tous']))
  )
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    if (searchTerm && searchFields.length > 0) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return value != null && String(value).toLowerCase().includes(lowerSearch)
        })
      )
    }

    filters.forEach(filter => {
      const filterValue = activeFilters[filter.key]
      if (filterValue && filterValue !== 'tous') {
        result = result.filter(item => (item as Record<string, unknown>)[filter.key] === filterValue)
      }
    })

    if (sortKey) {
      result.sort((a: T, b: T) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]

        if (aVal == null) return 1
        if (bVal == null) return -1

        let comparison = 0
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchTerm, searchFields, activeFilters, filters, sortKey, sortDirection])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {searchFields.length > 0 && (
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filters.map(filter => (
          <select
            key={filter.key}
            value={activeFilters[filter.key] || 'tous'}
            onChange={e =>
              setActiveFilters(prev => ({
                ...prev,
                [filter.key]: e.target.value,
              }))
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tous">{filter.label}</option>
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.className || ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && sortKey === column.key && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick?.(item)}
                    className={`
                      ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                      ${rowClassName?.(item) || ''}
                    `}
                  >
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(item)
                          : String((item as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        {filteredAndSortedData.length} résultat{filteredAndSortedData.length > 1 ? 's' : ''}
        {data.length !== filteredAndSortedData.length && ` sur ${data.length}`}
      </div>
    </div>
  )
}

export const getStatusBadge = (statut: string) => {
  const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error'; label: string }> = {
    actif: { variant: 'success', label: 'Actif' },
    inactif: { variant: 'default', label: 'Inactif' },
    suspendu: { variant: 'error', label: 'Suspendu' },
    en_attente: { variant: 'warning', label: 'En attente' },
    confirmee: { variant: 'success', label: 'Confirmée' },
    validee: { variant: 'success', label: 'Validée' },
    annulee: { variant: 'error', label: 'Annulée' },
    rejetee: { variant: 'error', label: 'Rejetée' },
  }

  const config = statusConfig[statut] || { variant: 'default' as const, label: statut }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
