import { DemandeDomiciliation } from '../types';
import { apiClient } from '../lib/api-client';

export class DomiciliationsService {
  static async getAll(): Promise<DemandeDomiciliation[]> {
    const response = await apiClient.getDomiciliations();
    if (!response.success || !response.data) {
      return [];
    }
    return response.data as DemandeDomiciliation[];
  }

  static async getById(id: string): Promise<DemandeDomiciliation | null> {
    const response = await apiClient.getDomiciliation(id);
    if (!response.success || !response.data) {
      return null;
    }
    return response.data as DemandeDomiciliation;
  }

  static async create(data: Partial<DemandeDomiciliation>): Promise<DemandeDomiciliation | null> {
    const response = await apiClient.createDomiciliation(data);
    if (!response.success || !response.data) {
      return null;
    }
    return response.data as DemandeDomiciliation;
  }

  static async update(id: string, data: Partial<DemandeDomiciliation>): Promise<DemandeDomiciliation | null> {
    const response = await apiClient.updateDomiciliation(id, data);
    if (!response.success || !response.data) {
      return null;
    }
    return response.data as DemandeDomiciliation;
  }

  static getByStatus(domiciliations: DemandeDomiciliation[], status: string): DemandeDomiciliation[] {
    return domiciliations.filter(d => d.statut === status);
  }

  static getPendingDomiciliations(domiciliations: DemandeDomiciliation[]): DemandeDomiciliation[] {
    return this.getByStatus(domiciliations, 'en_attente');
  }

  static getActiveDomiciliations(domiciliations: DemandeDomiciliation[]): DemandeDomiciliation[] {
    return this.getByStatus(domiciliations, 'validee');
  }

  static calculateStats(domiciliations: DemandeDomiciliation[]) {
    return {
      total: domiciliations.length,
      pending: this.getPendingDomiciliations(domiciliations).length,
      active: this.getActiveDomiciliations(domiciliations).length,
      rejected: this.getByStatus(domiciliations, 'rejetee').length,
    };
  }

  static calculateMonthlyRevenue(domiciliations: DemandeDomiciliation[]): number {
    return domiciliations
      .filter(d => d.statut === 'validee')
      .reduce((sum, d) => sum + (d.montantMensuel || 0), 0);
  }
}
