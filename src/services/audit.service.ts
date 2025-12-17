import { AuditLog, AuditAction, AuditEntityType, AuditLogFilter, AuditLogStats } from '../types/audit';
import { User } from '../types';

export class AuditService {
  private static logs: AuditLog[] = [];

  static log(
    user: User,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    options?: {
      entityName?: string;
      changes?: Record<string, { old: any; new: any }>;
      metadata?: Record<string, any>;
    }
  ): void {
    const log: AuditLog = {
      id: this.generateId(),
      userId: user.id,
      userName: `${user.prenom} ${user.nom}`,
      userEmail: user.email,
      action,
      entityType,
      entityId,
      entityName: options?.entityName,
      changes: options?.changes,
      metadata: options?.metadata,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    this.logs.unshift(log);

    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(0, 10000);
    }

    this.persistToLocalStorage();

    console.log('[AUDIT]', {
      user: log.userName,
      action: log.action,
      entity: `${log.entityType}:${log.entityId}`,
      timestamp: log.timestamp.toISOString(),
    });
  }

  static getLogs(filter?: AuditLogFilter): AuditLog[] {
    let filtered = [...this.logs];

    if (filter?.userId) {
      filtered = filtered.filter(log => log.userId === filter.userId);
    }

    if (filter?.action) {
      filtered = filtered.filter(log => log.action === filter.action);
    }

    if (filter?.entityType) {
      filtered = filtered.filter(log => log.entityType === filter.entityType);
    }

    if (filter?.entityId) {
      filtered = filtered.filter(log => log.entityId === filter.entityId);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
    }

    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        log.entityName?.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.entityType.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  static getStats(): AuditLogStats {
    const actionsByType: Record<AuditAction, number> = {} as any;
    const actionsByEntity: Record<AuditEntityType, number> = {} as any;
    const userCounts: Record<string, { userName: string; count: number }> = {};

    this.logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByEntity[log.entityType] = (actionsByEntity[log.entityType] || 0) + 1;

      if (!userCounts[log.userId]) {
        userCounts[log.userId] = { userName: log.userName, count: 0 };
      }
      userCounts[log.userId].count++;
    });

    const topUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: this.logs.length,
      actionsByType,
      actionsByEntity,
      topUsers,
      recentActions: this.logs.slice(0, 20),
    };
  }

  static clear(): void {
    this.logs = [];
    this.persistToLocalStorage();
  }

  static export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private static generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static persistToLocalStorage(): void {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(this.logs.slice(0, 1000)));
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
    }
  }

  static loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('audit_logs');
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          createdAt: new Date(log.createdAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  }
}

AuditService.loadFromLocalStorage();
