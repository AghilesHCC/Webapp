import { Espace } from '../types';
import { apiClient } from '../lib/api-client';

export class EspacesService {
  static async getAll(): Promise<Espace[]> {
    const response = await apiClient.getEspaces();
    return response.data;
  }

  static async getById(id: string): Promise<Espace> {
    const response = await apiClient.getEspace(id);
    return response.data;
  }

  static async create(data: Partial<Espace>): Promise<Espace> {
    const response = await apiClient.createEspace(data);
    return response.data;
  }

  static async update(id: string, data: Partial<Espace>): Promise<Espace> {
    const response = await apiClient.updateEspace(id, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.deleteEspace(id);
  }

  static calculateOccupancyRate(espaces: Espace[]): number {
    if (!espaces.length) return 0;
    const totalCapacity = espaces.reduce((sum, e) => sum + e.capacite, 0);
    const occupied = espaces.filter(e => !e.disponible).reduce((sum, e) => sum + e.capacite, 0);
    return totalCapacity > 0 ? (occupied / totalCapacity) * 100 : 0;
  }

  static getEspacesByType(espaces: Espace[], type: string): Espace[] {
    return espaces.filter(e => e.type === type);
  }

  static calculateTotalRevenue(espaces: Espace[]): number {
    return espaces.reduce((sum, e) => {
      return sum + (e.prixHeure || 0);
    }, 0);
  }

  static getAvailableEspaces(espaces: Espace[]): Espace[] {
    return espaces.filter(e => e.disponible);
  }

  static getStatsByType(espaces: Espace[]) {
    const stats: Record<string, { count: number; totalCapacity: number; avgPrice: number }> = {};

    espaces.forEach(espace => {
      if (!stats[espace.type]) {
        stats[espace.type] = { count: 0, totalCapacity: 0, avgPrice: 0 };
      }
      stats[espace.type].count++;
      stats[espace.type].totalCapacity += espace.capacite;
      stats[espace.type].avgPrice += espace.prixHeure;
    });

    Object.keys(stats).forEach(type => {
      if (stats[type].count > 0) {
        stats[type].avgPrice = stats[type].avgPrice / stats[type].count;
      }
    });

    return stats;
  }
}
