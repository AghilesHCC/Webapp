import { Building2, Briefcase, Calendar, FileText, Hash, MapPin } from 'lucide-react'
import Card from '../../../../components/ui/Card'
import Input from '../../../../components/ui/Input'
import AddressFields from '../AddressFields'
import { formeJuridiqueOptions } from '../constants'
import type { CompanyFormData } from '../types'

interface Props {
  formData: CompanyFormData
  onChange: (data: Partial<CompanyFormData>) => void
  disabled: boolean
}

const PersonneMoraleForm = ({ formData, onChange, disabled }: Props) => {
  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Informations de la societe</h3>
            <p className="text-sm text-gray-500">Donnees officielles de votre entreprise</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Raison Sociale"
            icon={<Building2 className="w-5 h-5" />}
            value={formData.raisonSociale}
            onChange={(e) => onChange({ raisonSociale: e.target.value })}
            disabled={disabled}
            placeholder="Ex: SARL Innovation Tech"
            required={!disabled}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forme Juridique <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.formeJuridique}
                onChange={(e) => onChange({ formeJuridique: e.target.value })}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                required={!disabled}
              >
                <option value="">Selectionnez</option>
                {formeJuridiqueOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Capital Social (DA)"
              type="number"
              value={formData.capital}
              onChange={(e) => onChange({ capital: e.target.value })}
              disabled={disabled}
              placeholder="Ex: 1000000"
            />
          </div>

          <Input
            label="Activite Principale"
            icon={<Briefcase className="w-5 h-5" />}
            value={formData.activitePrincipale}
            onChange={(e) => onChange({ activitePrincipale: e.target.value })}
            disabled={disabled}
            placeholder="Ex: Services informatiques"
          />

          <Input
            label="Date de Creation"
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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Identifiants Officiels</h3>
            <p className="text-sm text-gray-500">Numeros d'identification fiscaux et legaux</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIF (Numero d'Identification Fiscale)"
              icon={<Hash className="w-5 h-5" />}
              value={formData.nif}
              onChange={(e) => onChange({ nif: e.target.value })}
              disabled={disabled}
              placeholder="099012345678901"
              required={!disabled}
            />

            <Input
              label="NIS (Numero d'Identification Statistique)"
              icon={<Hash className="w-5 h-5" />}
              value={formData.nis}
              onChange={(e) => onChange({ nis: e.target.value })}
              disabled={disabled}
              placeholder="123456789012345"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Registre de Commerce"
              icon={<FileText className="w-5 h-5" />}
              value={formData.registreCommerce}
              onChange={(e) => onChange({ registreCommerce: e.target.value })}
              disabled={disabled}
              placeholder="16/00-1234567A23"
            />

            <Input
              label="Article d'Imposition"
              icon={<FileText className="w-5 h-5" />}
              value={formData.articleImposition}
              onChange={(e) => onChange({ articleImposition: e.target.value })}
              disabled={disabled}
              placeholder="16123456789"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Siege Social Actuel</h3>
            <p className="text-sm text-gray-500">Adresse actuelle de votre societe</p>
          </div>
        </div>

        <AddressFields
          formData={formData}
          onChange={onChange}
          disabled={disabled}
          addressPlaceholder="Ex: 12 Rue Didouche Mourad, Alger"
        />
      </Card>
    </>
  )
}

export default PersonneMoraleForm
