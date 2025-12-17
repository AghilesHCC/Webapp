import { Domiciliation } from '../types';
import { apiClient } from '../lib/api-client';

export class DomiciliationsService {
  static async getAll(): Promise<Domiciliation[]> {
    const response = await apiClient.getDomiciliations();
    return response.data;
  }

  static async getById(id: string): Promise<Domiciliation> {
    const response = await apiClient.getDomiciliation(id);
    return response.data;
  }

  static async create(data: Partial<Domiciliation>): Promise<Domiciliation> {
    const response = await apiClient.createDomiciliation(data);
    return response.data;
  }

  static async update(id: string, data: Partial<Domiciliation>): Promise<Domiciliation> {
    const response = await apiClient.updateDomiciliation(id, data);
    return response.data;
  }

  static getByStatus(domiciliations: Domiciliation[], status: string): Domiciliation[] {
    return domiciliations.filter(d => d.statut === status);
  }

  static getPendingDomiciliations(domiciliations: Domiciliation[]): Domiciliation[] {
    return this.getByStatus(domiciliations, 'en_attente');
  }

  static getActiveDomiciliations(domiciliations: Domiciliation[]): Domiciliation[] {
    return this.getByStatus(domiciliations, 'active');
  }

  static calculateStats(domiciliations: Domiciliation[]) {
    return {
      total: domiciliations.length,
      pending: this.getPendingDomiciliations(domiciliations).length,
      active: this.getActiveDomiciliations(domiciliations).length,
      rejected: this.getByStatus(domiciliations, 'rejetee').length,
      suspended: this.getByStatus(domiciliations, 'suspendue').length,
    };
  }

  static calculateMonthlyRevenue(domiciliations: Domiciliation[]): number {
    return domiciliations
      .filter(d => d.statut === 'active')
      .reduce((sum, d) => sum + (d.montantMensuel || 0), 0);
  }
}
