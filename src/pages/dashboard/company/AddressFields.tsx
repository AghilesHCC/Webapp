import { MapPin } from 'lucide-react'
import Input from '../../../components/ui/Input'
import { wilayas } from '../../../data/wilayas'
import type { CompanyFormData } from './types'

interface AddressFieldsProps {
  formData: CompanyFormData
  onChange: (data: Partial<CompanyFormData>) => void
  disabled: boolean
  showFullAddress?: boolean
  addressPlaceholder?: string
}

const AddressFields = ({ formData, onChange, disabled, showFullAddress = true, addressPlaceholder = 'Numero, rue, quartier...' }: AddressFieldsProps) => {
  const selectedWilaya = wilayas.find(w => w.code === formData.wilaya)
  const communes = selectedWilaya?.communes || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
          <select
            value={formData.wilaya}
            onChange={(e) => onChange({ wilaya: e.target.value, commune: '' })}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">Selectionnez une wilaya</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>{w.code} - {w.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
          <select
            value={formData.commune}
            onChange={(e) => onChange({ commune: e.target.value })}
            disabled={disabled || !formData.wilaya}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">Selectionnez une commune</option>
            {communes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {showFullAddress && (
        <Input
          label="Adresse complete"
          icon={<MapPin className="w-5 h-5" />}
          value={formData.siegeSocial}
          onChange={(e) => onChange({ siegeSocial: e.target.value })}
          disabled={disabled}
          placeholder={addressPlaceholder}
        />
      )}
    </div>
  )
}

export default AddressFields
