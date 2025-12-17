import { Rocket, Calendar, MapPin, AlertCircle } from 'lucide-react'
import Card from '../../../../components/ui/Card'
import Input from '../../../../components/ui/Input'
import AddressFields from '../AddressFields'
import type { CompanyFormData } from '../types'

interface Props {
  formData: CompanyFormData
  onChange: (data: Partial<CompanyFormData>) => void
  disabled: boolean
}

const StartupForm = ({ formData, onChange, disabled }: Props) => {
  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Votre Projet</h3>
            <p className="text-sm text-gray-500">Presentez votre startup ou projet innovant</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Nom du projet / Startup"
            icon={<Rocket className="w-5 h-5" />}
            value={formData.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            disabled={disabled}
            placeholder="Ex: TechFlow, InnovaLab..."
            required={!disabled}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du projet
            </label>
            <textarea
              value={formData.projectDescription}
              onChange={(e) => onChange({ projectDescription: e.target.value })}
              disabled={disabled}
              placeholder="Decrivez brievement votre projet, son secteur d'activite et son innovation..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 resize-none"
            />
          </div>

          <Input
            label="Date de lancement / creation"
            type="date"
            icon={<Calendar className="w-5 h-5" />}
            value={formData.dateCreationEntreprise}
            onChange={(e) => onChange({ dateCreationEntreprise: e.target.value })}
            disabled={disabled}
          />
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Startup en creation ?</p>
              <p>Pas encore de documents officiels ? Aucun probleme ! Vous pouvez demarrer avec ces informations de base et completer votre dossier plus tard.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Localisation</h3>
            <p className="text-sm text-gray-500">Ou etes-vous base actuellement ?</p>
          </div>
        </div>

        <AddressFields
          formData={formData}
          onChange={onChange}
          disabled={disabled}
          addressPlaceholder="Adresse actuelle (optionnel)"
        />
      </Card>
    </>
  )
}

export default StartupForm
