export type Permission =
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'espaces.view'
  | 'espaces.create'
  | 'espaces.edit'
  | 'espaces.delete'
  | 'reservations.view'
  | 'reservations.create'
  | 'reservations.edit'
  | 'reservations.delete'
  | 'reservations.approve'
  | 'domiciliations.view'
  | 'domiciliations.create'
  | 'domiciliations.edit'
  | 'domiciliations.delete'
  | 'domiciliations.approve'
  | 'codes-promo.view'
  | 'codes-promo.create'
  | 'codes-promo.edit'
  | 'codes-promo.delete'
  | 'parrainages.view'
  | 'analytics.view'
  | 'settings.view'
  | 'settings.edit'
  | 'audit.view';

export type RoleType = 'super_admin' | 'admin' | 'manager' | 'user';

export interface Role {
  id: string;
  name: RoleType;
  displayName: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  userId: string;
  role: RoleType;
  customPermissions?: Permission[];
  deniedPermissions?: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  super_admin: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'espaces.view',
    'espaces.create',
    'espaces.edit',
    'espaces.delete',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.delete',
    'reservations.approve',
    'domiciliations.view',
    'domiciliations.create',
    'domiciliations.edit',
    'domiciliations.delete',
    'domiciliations.approve',
    'codes-promo.view',
    'codes-promo.create',
    'codes-promo.edit',
    'codes-promo.delete',
    'parrainages.view',
    'analytics.view',
    'settings.view',
    'settings.edit',
    'audit.view',
  ],
  admin: [
    'users.view',
    'users.create',
    'users.edit',
    'espaces.view',
    'espaces.create',
    'espaces.edit',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.approve',
    'domiciliations.view',
    'domiciliations.edit',
    'domiciliations.approve',
    'codes-promo.view',
    'codes-promo.create',
    'codes-promo.edit',
    'parrainages.view',
    'analytics.view',
    'settings.view',
  ],
  manager: [
    'users.view',
    'espaces.view',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'domiciliations.view',
    'codes-promo.view',
    'analytics.view',
  ],
  user: [
    'reservations.view',
    'reservations.create',
    'domiciliations.view',
    'domiciliations.create',
  ],
};
