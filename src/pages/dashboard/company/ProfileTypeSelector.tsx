import { motion } from 'framer-motion'
import { ChevronRight, User, Briefcase, Rocket, Building2 } from 'lucide-react'
import { profileTypes, type ProfileType } from './constants'

interface ProfileTypeSelectorProps {
  onSelect: (type: ProfileType) => void
}

const iconComponents = {
  User,
  Briefcase,
  Rocket,
  Building2
}

const ProfileTypeSelector = ({ onSelect }: ProfileTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profileTypes.map((type) => {
        const IconComponent = iconComponents[type.iconName]
        return (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(type.id)}
            className={`p-6 rounded-xl border-2 transition-all text-left ${type.bgColor}`}
          >
            <div className={`${type.color} mb-4`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{type.title}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
            <div className="flex items-center mt-4 text-sm font-medium text-gray-700">
              Selectionner <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default ProfileTypeSelector
