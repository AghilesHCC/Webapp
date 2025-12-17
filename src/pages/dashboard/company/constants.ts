import { User, Briefcase, Rocket, Building2 } from 'lucide-react'

export type ProfileType = 'personne_physique' | 'auto_entrepreneur' | 'startup' | 'personne_morale' | null

export interface ProfileTypeOption {
  id: ProfileType
  title: string
  description: string
  iconName: 'User' | 'Briefcase' | 'Rocket' | 'Building2'
  color: string
  bgColor: string
}

export const profileTypes: ProfileTypeOption[] = [
  {
    id: 'personne_physique',
    title: 'Personne Physique',
    description: 'Particulier souhaitant une adresse professionnelle',
    iconName: 'User',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  {
    id: 'auto_entrepreneur',
    title: 'Auto-Entrepreneur',
    description: 'Travailleur independant avec statut auto-entrepreneur',
    iconName: 'Briefcase',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100 border-teal-200'
  },
  {
    id: 'startup',
    title: 'Startup / Projet',
    description: 'Projet innovant ou entreprise en creation',
    iconName: 'Rocket',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  },
  {
    id: 'personne_morale',
    title: 'Personne Morale',
    description: 'Societe constituee (SARL, EURL, SPA, SNC...)',
    iconName: 'Building2',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
  }
]

export const formeJuridiqueOptions = [
  { value: 'SARL', label: 'SARL - Societe a Responsabilite Limitee' },
  { value: 'EURL', label: 'EURL - Entreprise Unipersonnelle a Responsabilite Limitee' },
  { value: 'SPA', label: 'SPA - Societe Par Actions' },
  { value: 'SNC', label: 'SNC - Societe en Nom Collectif' },
  { value: 'SCS', label: 'SCS - Societe en Commandite Simple' }
]

export const getIconComponent = (iconName: ProfileTypeOption['iconName']) => {
  const icons = { User, Briefcase, Rocket, Building2 }
  return icons[iconName]
}

export const getTypeEntrepriseValue = (type: ProfileType): string => {
  switch (type) {
    case 'personne_physique': return 'PHYSIQUE'
    case 'auto_entrepreneur': return 'AUTO'
    case 'startup': return 'STARTUP'
    case 'personne_morale': return 'MORALE'
    default: return ''
  }
}

export const getProfileTypeFromUser = (typeEntreprise?: string): ProfileType => {
  if (!typeEntreprise) return null
  if (typeEntreprise === 'AUTO' || typeEntreprise === 'auto_entrepreneur') return 'auto_entrepreneur'
  if (typeEntreprise === 'STARTUP' || typeEntreprise === 'startup') return 'startup'
  if (typeEntreprise === 'PHYSIQUE' || typeEntreprise === 'personne_physique') return 'personne_physique'
  if (['SARL', 'EURL', 'SPA', 'SNC', 'SCS', 'personne_morale'].includes(typeEntreprise)) return 'personne_morale'
  return null
}
