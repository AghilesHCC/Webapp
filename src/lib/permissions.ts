import { Permission, RoleType, DEFAULT_ROLE_PERMISSIONS, UserPermissions } from '../types/permissions';
import { User } from '../types';

export class PermissionsManager {
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;

    const role = this.getUserRole(user);

    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  }

  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;

    return permissions.some(permission => this.hasPermission(user, permission));
  }

  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;

    return permissions.every(permission => this.hasPermission(user, permission));
  }

  static getUserRole(user: User): RoleType {
    if (user.role === 'admin') {
      return 'super_admin';
    }
    return 'user';
  }

  static getRolePermissions(role: RoleType): Permission[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  static canAccessAdminPanel(user: User | null): boolean {
    if (!user) return false;
    const role = this.getUserRole(user);
    return ['super_admin', 'admin', 'manager'].includes(role);
  }

  static canManageUsers(user: User | null): boolean {
    return this.hasPermission(user, 'users.edit');
  }

  static canDeleteUsers(user: User | null): boolean {
    return this.hasPermission(user, 'users.delete');
  }

  static canManageEspaces(user: User | null): boolean {
    return this.hasPermission(user, 'espaces.edit');
  }

  static canApproveReservations(user: User | null): boolean {
    return this.hasPermission(user, 'reservations.approve');
  }

  static canApproveDomiciliations(user: User | null): boolean {
    return this.hasPermission(user, 'domiciliations.approve');
  }

  static canViewAnalytics(user: User | null): boolean {
    return this.hasPermission(user, 'analytics.view');
  }

  static canManageSettings(user: User | null): boolean {
    return this.hasPermission(user, 'settings.edit');
  }

  static canViewAuditLogs(user: User | null): boolean {
    return this.hasPermission(user, 'audit.view');
  }
}

export function requirePermission(permission: Permission) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const user = (this as any).user;

      if (!PermissionsManager.hasPermission(user, permission)) {
        throw new Error(`Permission denied: ${permission}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
