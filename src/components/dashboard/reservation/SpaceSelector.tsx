import { memo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, CreditCard, Check, AlertCircle } from 'lucide-react'
import Card from '../../ui/Card'
import type { Espace } from '../../../types'

interface SpaceSelectorProps {
  espaces: Espace[]
  selectedId?: string
  onSelect: (id: string) => void
  error?: string
}

const SpaceCard = memo(({ espace, isSelected, onSelect }: { espace: Espace; isSelected: boolean; onSelect: () => void }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      className={`p-4 cursor-pointer transition-all border-2 ${
        isSelected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-accent/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <MapPin className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-900">{espace.nom}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{espace.description}</p>
            </div>
            {isSelected && <Check className="w-6 h-6 text-accent flex-shrink-0 ml-2" />}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{espace.capacite} pers.</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span className="font-semibold text-accent">{espace.prixHeure.toLocaleString()} DA/h</span>
            </div>
          </div>
          {espace.equipements && espace.equipements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {espace.equipements.slice(0, 3).map((equip, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {equip}
                </span>
              ))}
              {espace.equipements.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  +{espace.equipements.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
))

SpaceCard.displayName = 'SpaceCard'

const SpaceSelector = ({ espaces, selectedId, onSelect, error }: SpaceSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Choisissez votre espace</h3>
        <p className="text-sm text-gray-600">Selectionnez l'espace qui correspond a vos besoins</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
        {espaces.map((espace) => (
          <SpaceCard
            key={espace.id}
            espace={espace}
            isSelected={selectedId === espace.id}
            onSelect={() => onSelect(espace.id)}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </motion.div>
  )
}

export default memo(SpaceSelector)
