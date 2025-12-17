import { Reservation, Espace, User, DemandeDomiciliation } from '../types';
import { ReservationsService } from './reservations.service';
import { EspacesService } from './espaces.service';
import { UsersService } from './users.service';
import { DomiciliationsService } from './domiciliations.service';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface DashboardStats {
  revenue: {
    total: number;
    monthly: number;
    daily: number;
    pending: number;
  };
  reservations: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    today: number;
    upcoming: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
  };
  espaces: {
    total: number;
    available: number;
    occupancyRate: number;
  };
  domiciliations: {
    total: number;
    active: number;
    pending: number;
    monthlyRevenue: number;
  };
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  reservations: number;
}

export interface EspacePerformance {
  espaceId: string;
  espaceName: string;
  type: string;
  reservations: number;
  revenue: number;
  occupancyRate: number;
}

export class AnalyticsService {
  static calculateDashboardStats(
    reservations: Reservation[],
    espaces: Espace[],
    users: User[],
    domiciliations: DemandeDomiciliation[]
  ): DashboardStats {
    const reservationStats = ReservationsService.calculateStats(reservations);
    const userStats = UsersService.calculateStats(users);
    const espacesAvailable = EspacesService.getAvailableEspaces(espaces);
    const domiciliationStats = DomiciliationsService.calculateStats(domiciliations);

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const monthlyReservations = ReservationsService.getReservationsByDateRange(
      reservations,
      startOfCurrentMonth,
      endOfCurrentMonth
    );

    const todayReservations = ReservationsService.getTodayReservations(reservations);

    return {
      revenue: {
        total: reservationStats.totalRevenue,
        monthly: ReservationsService.calculateTotalRevenue(monthlyReservations),
        daily: ReservationsService.calculateTotalRevenue(todayReservations),
        pending: reservationStats.pendingRevenue,
      },
      reservations: {
        total: reservationStats.total,
        confirmed: reservationStats.confirmed,
        pending: reservationStats.pending,
        cancelled: reservationStats.cancelled,
        today: todayReservations.length,
        upcoming: ReservationsService.getUpcomingReservations(reservations).length,
      },
      users: {
        total: userStats.total,
        active: userStats.active,
        new: userStats.recent,
      },
      espaces: {
        total: espaces.length,
        available: espacesAvailable.length,
        occupancyRate: EspacesService.calculateOccupancyRate(espaces),
      },
      domiciliations: {
        total: domiciliationStats.total,
        active: domiciliationStats.active,
        pending: domiciliationStats.pending,
        monthlyRevenue: DomiciliationsService.calculateMonthlyRevenue(domiciliations),
      },
    };
  }

  static calculateRevenueByDay(
    reservations: Reservation[],
    startDate: Date,
    endDate: Date
  ): RevenueByDay[] {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));

      const dayReservations = ReservationsService.getReservationsByDateRange(
        reservations,
        dayStart,
        dayEnd
      );

      return {
        date: format(day, 'yyyy-MM-dd'),
        revenue: ReservationsService.calculateTotalRevenue(dayReservations),
        reservations: dayReservations.length,
      };
    });
  }

  static calculateEspacePerformance(
    reservations: Reservation[],
    espaces: Espace[]
  ): EspacePerformance[] {
    return espaces.map(espace => {
      const espaceReservations = ReservationsService.getReservationsByEspace(
        reservations,
        espace.id
      );

      const revenue = ReservationsService.calculateTotalRevenue(espaceReservations);
      const totalHours = espaceReservations.length * 8;
      const occupancyRate = totalHours > 0 ? (espaceReservations.length / totalHours) * 100 : 0;

      return {
        espaceId: espace.id,
        espaceName: espace.nom,
        type: espace.type,
        reservations: espaceReservations.length,
        revenue,
        occupancyRate,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  static calculateReservationsByStatus(reservations: Reservation[]) {
    return {
      confirmed: ReservationsService.getReservationsByStatus(reservations, 'confirmee').length,
      pending: ReservationsService.getReservationsByStatus(reservations, 'en_attente').length,
      cancelled: ReservationsService.getReservationsByStatus(reservations, 'annulee').length,
    };
  }

  static calculateTopUsers(reservations: Reservation[], users: User[], limit: number = 10) {
    const userReservations: Record<string, { user: User; count: number; revenue: number }> = {};

    reservations.forEach(reservation => {
      const resUserId = reservation.userId;
      if (!resUserId) return;

      if (!userReservations[resUserId]) {
        const user = users.find(u => u.id === resUserId);
        if (user) {
          userReservations[resUserId] = {
            user,
            count: 0,
            revenue: 0,
          };
        }
      }

      if (userReservations[resUserId]) {
        userReservations[resUserId].count++;
        userReservations[resUserId].revenue += reservation.montantTotal || 0;
      }
    });

    return Object.values(userReservations)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
}
