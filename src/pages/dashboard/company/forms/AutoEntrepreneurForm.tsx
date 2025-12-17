import { Building2, Hash, Briefcase, Calendar, MapPin } from 'lucide-react'
import Card from '../../../../components/ui/Card'
import Input from '../../../../components/ui/Input'
import AddressFields from '../AddressFields'
import type { CompanyFormData } from '../types'

interface Props {
  formData: CompanyFormData
  onChange: (data: Partial<CompanyFormData>) => void
  disabled: boolean
}

const AutoEntrepreneurForm = ({ formData, onChange, disabled }: Props) => {
  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Activite Auto-Entrepreneur</h3>
            <p className="text-sm text-gray-500">Informations sur votre activite</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Nom commercial / Denomination"
            icon={<Building2 className="w-5 h-5" />}
            value={formData.raisonSociale}
            onChange={(e) => onChange({ raisonSociale: e.target.value })}
            disabled={disabled}
            placeholder="Ex: Ahmed BENALI - Consultant IT"
            required={!disabled}
          />

          <Input
            label="Numero Auto-Entrepreneur (Carte AE)"
            icon={<Hash className="w-5 h-5" />}
            value={formData.numeroAutoEntrepreneur}
            onChange={(e) => onChange({ numeroAutoEntrepreneur: e.target.value })}
            disabled={disabled}
            placeholder="Ex: AE-16-XXXXXX"
            required={!disabled}
          />

          <Input
            label="Activite principale"
            icon={<Briefcase className="w-5 h-5" />}
            value={formData.activitePrincipale}
            onChange={(e) => onChange({ activitePrincipale: e.target.value })}
            disabled={disabled}
            placeholder="Ex: Services informatiques, Formation..."
          />

          <Input
            label="Date de debut d'activite"
            type="date"
            icon={<Calendar className="w-5 h-5" />}
            value={formData.dateCreationEntreprise}
            onChange={(e) => onChange({ dateCreationEntreprise: e.target.value })}
            disabled={disabled}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Hash className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Identifiants fiscaux</h3>
            <p className="text-sm text-gray-500">Optionnel - si vous les avez</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="NIF (Numero d'Identification Fiscale)"
            icon={<Hash className="w-5 h-5" />}
            value={formData.nif}
            onChange={(e) => onChange({ nif: e.target.value })}
            disabled={disabled}
            placeholder="Si disponible"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Adresse</h3>
            <p className="text-sm text-gray-500">Votre adresse actuelle</p>
          </div>
        </div>

        <AddressFields
          formData={formData}
          onChange={onChange}
          disabled={disabled}
        />
      </Card>
    </>
  )
}

export default AutoEntrepreneurForm
