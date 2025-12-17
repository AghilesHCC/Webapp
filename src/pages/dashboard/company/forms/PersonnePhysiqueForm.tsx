import { User, Briefcase, MapPin } from 'lucide-react'
import Card from '../../../../components/ui/Card'
import Input from '../../../../components/ui/Input'
import AddressFields from '../AddressFields'
import type { CompanyFormData } from '../types'

interface Props {
  formData: CompanyFormData
  onChange: (data: Partial<CompanyFormData>) => void
  disabled: boolean
  userName: string
  userEmail: string
}

const PersonnePhysiqueForm = ({ formData, onChange, disabled, userName, userEmail }: Props) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
          <p className="text-sm text-gray-500">Vos coordonnees pour la domiciliation</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
          </div>
        </div>

        <Input
          label="Activite / Profession"
          icon={<Briefcase className="w-5 h-5" />}
          value={formData.activitePrincipale}
          onChange={(e) => onChange({ activitePrincipale: e.target.value })}
          disabled={disabled}
          placeholder="Ex: Consultant, Freelance, Photographe..."
        />

        <Input
          label="Adresse actuelle"
          icon={<MapPin className="w-5 h-5" />}
          value={formData.siegeSocial}
          onChange={(e) => onChange({ siegeSocial: e.target.value })}
          disabled={disabled}
          placeholder="Votre adresse actuelle"
        />

        <AddressFields
          formData={formData}
          onChange={onChange}
          disabled={disabled}
          showFullAddress={false}
        />
      </div>
    </Card>
  )
}

export default PersonnePhysiqueForm
