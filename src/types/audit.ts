export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

export type AuditEntityType =
  | 'user'
  | 'espace'
  | 'reservation'
  | 'domiciliation'
  | 'code_promo'
  | 'abonnement'
  | 'settings';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface AuditLogStats {
  totalActions: number;
  actionsByType: Record<AuditAction, number>;
  actionsByEntity: Record<AuditEntityType, number>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  recentActions: AuditLog[];
}
