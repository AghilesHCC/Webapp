export const ESPACE_TYPES = {
  BOOTH: 'booth',
  OPEN_SPACE: 'open_space'
} as const

export type EspaceType = typeof ESPACE_TYPES[keyof typeof ESPACE_TYPES]

export const ESPACE_TYPE_LABELS: Record<EspaceType, string> = {
  [ESPACE_TYPES.BOOTH]: 'Private Booth',
  [ESPACE_TYPES.OPEN_SPACE]: 'Espace Coworking'
}

export const ESPACE_TYPE_COLORS: Record<EspaceType, string> = {
  [ESPACE_TYPES.BOOTH]: 'bg-blue-100 text-blue-800',
  [ESPACE_TYPES.OPEN_SPACE]: 'bg-teal-100 text-teal-800'
}

export const ESPACE_TYPE_OPTIONS = [
  { value: ESPACE_TYPES.BOOTH, label: ESPACE_TYPE_LABELS[ESPACE_TYPES.BOOTH] },
  { value: ESPACE_TYPES.OPEN_SPACE, label: ESPACE_TYPE_LABELS[ESPACE_TYPES.OPEN_SPACE] }
]

export const DEFAULT_ESPACE_TYPE: EspaceType = ESPACE_TYPES.OPEN_SPACE

export const COWORKING_CAPACITY = 12

export function getEspaceTypeLabel(type: string): string {
  return ESPACE_TYPE_LABELS[type as EspaceType] || type
}

export function getEspaceTypeColor(type: string): string {
  return ESPACE_TYPE_COLORS[type as EspaceType] || 'bg-gray-100 text-gray-800'
}

export function isValidEspaceType(type: string): type is EspaceType {
  return Object.values(ESPACE_TYPES).includes(type as EspaceType)
}

export function isExclusiveSpace(type: string): boolean {
  return type === ESPACE_TYPES.BOOTH
}

export function isSharedSpace(type: string): boolean {
  return type === ESPACE_TYPES.OPEN_SPACE
}
