import { memo } from 'react'
import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import Card from '../../ui/Card'

interface PricingSummaryProps {
  estimatedAmount: number
  discount: number
}

const PricingSummary = ({ estimatedAmount, discount }: PricingSummaryProps) => {
  if (estimatedAmount <= 0) return null

  const subtotal = estimatedAmount + discount

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium text-gray-900">{subtotal.toLocaleString()} DA</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Reduction
              </span>
              <span className="font-medium text-green-600">-{discount.toLocaleString()} DA</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-accent">{estimatedAmount.toLocaleString()} DA</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default memo(PricingSummary)
