import { User } from '../types';
import { apiClient } from '../lib/api-client';

export class UsersService {
  static async getAll(): Promise<User[]> {
    const response = await apiClient.getUsers();
    return (response.data as User[]) || [];
  }

  static async getById(id: string): Promise<User> {
    const response = await apiClient.getUser(id);
    return response.data as User;
  }

  static async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.updateUser(id, data);
    return response.data as User;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.deleteUser(id);
  }

  static getActiveUsers(users: User[]): User[] {
    return users.filter(u => u.actif);
  }

  static getAdmins(users: User[]): User[] {
    return users.filter(u => u.role === 'admin');
  }

  static getUsersByRole(users: User[], role: string): User[] {
    return users.filter(u => u.role === role);
  }

  static getRecentUsers(users: User[], days: number = 30): User[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return users.filter(u => {
      try {
        const createdAt = new Date(u.dateCreation || u.created_at || '');
        return createdAt >= cutoffDate;
      } catch {
        return false;
      }
    });
  }

  static calculateStats(users: User[]) {
    return {
      total: users.length,
      active: this.getActiveUsers(users).length,
      admins: this.getAdmins(users).length,
      recent: this.getRecentUsers(users).length,
      byRole: this.groupByRole(users),
    };
  }

  static groupByRole(users: User[]): Record<string, number> {
    return users.reduce((acc, user) => {
      const role = user.role || 'user';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
