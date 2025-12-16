import { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'

interface AdminPageLayoutProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  isLoading?: boolean
  children: ReactNode
}

export function AdminPageLayout({
  title,
  description,
  action,
  isLoading,
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>

        {action && (
          <Button onClick={action.onClick} className="whitespace-nowrap">
            {action.icon || <Plus className="w-5 h-5 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
