export interface CompanyFormData {
  raisonSociale: string
  formeJuridique: string
  nif: string
  nis: string
  registreCommerce: string
  articleImposition: string
  numeroAutoEntrepreneur: string
  activitePrincipale: string
  siegeSocial: string
  capital: string
  dateCreationEntreprise: string
  wilaya: string
  commune: string
  projectName: string
  projectDescription: string
}

export const getDefaultFormData = (user?: {
  raisonSociale?: string
  formeJuridique?: string
  nif?: string
  nis?: string
  registreCommerce?: string
  articleImposition?: string
  numeroAutoEntrepreneur?: string
  activitePrincipale?: string
  siegeSocial?: string
  capital?: string
  dateCreationEntreprise?: string
  wilaya?: string
  commune?: string
}): CompanyFormData => ({
  raisonSociale: user?.raisonSociale || '',
  formeJuridique: user?.formeJuridique || '',
  nif: user?.nif || '',
  nis: user?.nis || '',
  registreCommerce: user?.registreCommerce || '',
  articleImposition: user?.articleImposition || '',
  numeroAutoEntrepreneur: user?.numeroAutoEntrepreneur || '',
  activitePrincipale: user?.activitePrincipale || '',
  siegeSocial: user?.siegeSocial || '',
  capital: user?.capital || '',
  dateCreationEntreprise: user?.dateCreationEntreprise || '',
  wilaya: user?.wilaya || '',
  commune: user?.commune || '',
  projectName: user?.raisonSociale || '',
  projectDescription: user?.activitePrincipale || ''
})
