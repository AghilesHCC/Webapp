import { Reservation } from '../types';
import { apiClient } from '../lib/api-client';
import { startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

export class ReservationsService {
  static async getAll(): Promise<Reservation[]> {
    const response = await apiClient.getReservations();
    return response.data;
  }

  static async getById(id: string): Promise<Reservation> {
    const response = await apiClient.getReservation(id);
    return response.data;
  }

  static async create(data: Partial<Reservation>): Promise<Reservation> {
    const response = await apiClient.createReservation(data);
    return response.data;
  }

  static async update(id: string, data: Partial<Reservation>): Promise<Reservation> {
    const response = await apiClient.updateReservation(id, data);
    return response.data;
  }

  static async cancel(id: string): Promise<void> {
    await apiClient.cancelReservation(id);
  }

  static calculateTotalRevenue(reservations: Reservation[]): number {
    return reservations
      .filter(r => r.statut === 'confirmee')
      .reduce((sum, r) => sum + (r.montantTotal || 0), 0);
  }

  static getPendingRevenue(reservations: Reservation[]): number {
    return reservations
      .filter(r => r.statut === 'en_attente')
      .reduce((sum, r) => sum + (r.montantTotal || 0), 0);
  }

  static getReservationsByStatus(reservations: Reservation[], status: string): Reservation[] {
    return reservations.filter(r => r.statut === status);
  }

  static getReservationsByDateRange(
    reservations: Reservation[],
    startDate: Date,
    endDate: Date
  ): Reservation[] {
    return reservations.filter(r => {
      try {
        const reservationDate = parseISO(r.dateDebut);
        return isWithinInterval(reservationDate, { start: startDate, end: endDate });
      } catch {
        return false;
      }
    });
  }

  static getTodayReservations(reservations: Reservation[]): Reservation[] {
    const today = new Date();
    return this.getReservationsByDateRange(
      reservations,
      startOfDay(today),
      endOfDay(today)
    );
  }

  static getUpcomingReservations(reservations: Reservation[]): Reservation[] {
    const now = new Date();
    return reservations.filter(r => {
      try {
        const reservationDate = parseISO(r.dateDebut);
        return reservationDate > now && r.statut !== 'annulee';
      } catch {
        return false;
      }
    });
  }

  static getReservationsByUser(reservations: Reservation[], userId: string): Reservation[] {
    return reservations.filter(r => r.userId === userId);
  }

  static getReservationsByEspace(reservations: Reservation[], espaceId: string): Reservation[] {
    return reservations.filter(r => r.espaceId === espaceId);
  }

  static calculateStats(reservations: Reservation[]) {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.statut === 'confirmee').length;
    const pending = reservations.filter(r => r.statut === 'en_attente').length;
    const cancelled = reservations.filter(r => r.statut === 'annulee').length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      totalRevenue: this.calculateTotalRevenue(reservations),
      pendingRevenue: this.getPendingRevenue(reservations),
    };
  }
}
