import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Building,
  Activity,
  Download,
  FileText,
} from 'lucide-react';
import { useReservations, useEspaces, useUsers, useDomiciliations } from '../../../hooks/queries';
import { AnalyticsService } from '../../../services';
import { LineChart, BarChart, PieChart, StatCard } from '../../../components/charts';
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatters';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

type PeriodType = '7days' | '30days' | '3months' | '6months' | 'year';

export default function Analytics() {
  const [period, setPeriod] = useState<PeriodType>('30days');

  const { data: reservations = [], isLoading: loadingReservations } = useReservations();
  const { data: espaces = [], isLoading: loadingEspaces } = useEspaces();
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: domiciliations = [], isLoading: loadingDomiciliations } = useDomiciliations();

  const isLoading = loadingReservations || loadingEspaces || loadingUsers || loadingDomiciliations;

  const { dashboardStats, revenueByDay, espacePerformance, reservationsByStatus } = useMemo(() => {
    if (isLoading) {
      return {
        dashboardStats: null,
        revenueByDay: [],
        espacePerformance: [],
        reservationsByStatus: null,
      };
    }

    const stats = AnalyticsService.calculateDashboardStats(
      reservations,
      espaces,
      users,
      domiciliations
    );

    const now = new Date();
    let startDate = startOfMonth(now);

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
    }

    const revenue = AnalyticsService.calculateRevenueByDay(reservations, startDate, now);
    const performance = AnalyticsService.calculateEspacePerformance(reservations, espaces);
    const byStatus = AnalyticsService.calculateReservationsByStatus(reservations);

    return {
      dashboardStats: stats,
      revenueByDay: revenue,
      espacePerformance: performance,
      reservationsByStatus: byStatus,
    };
  }, [reservations, espaces, users, domiciliations, period, isLoading]);

  const handleExportReport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      period,
      stats: dashboardStats,
      revenue: revenueByDay,
      espacePerformance,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AdminPageLayout title="Analytics" icon={Activity}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageLayout>
    );
  }

  if (!dashboardStats) {
    return null;
  }

  return (
    <AdminPageLayout
      title="Analytics & Rapports"
      subtitle="Vue d'ensemble des performances et statistiques détaillées"
      icon={Activity}
      actions={
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="year">12 derniers mois</option>
          </select>

          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter le rapport
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Revenu Total"
          value={formatCurrency(dashboardStats.revenue.total)}
          subtitle={`${formatCurrency(dashboardStats.revenue.monthly)} ce mois`}
          icon={DollarSign}
          color="green"
        />

        <StatCard
          title="Réservations"
          value={dashboardStats.reservations.total}
          subtitle={`${dashboardStats.reservations.today} aujourd'hui`}
          icon={Calendar}
          color="blue"
        />

        <StatCard
          title="Utilisateurs"
          value={dashboardStats.users.total}
          subtitle={`${dashboardStats.users.active} actifs`}
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Taux d'Occupation"
          value={`${dashboardStats.espaces.occupancyRate.toFixed(1)}%`}
          subtitle={`${dashboardStats.espaces.available} espaces disponibles`}
          icon={Building}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Évolution du Revenu</h3>
                <p className="text-sm text-gray-600">Revenu quotidien sur la période sélectionnée</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">
                  +{((dashboardStats.revenue.monthly / (dashboardStats.revenue.total || 1)) * 100).toFixed(1)}%
                </span>
                <span>ce mois</span>
              </div>
            </div>

            <LineChart
              data={revenueByDay.map(d => ({
                label: format(new Date(d.date), 'dd/MM'),
                value: d.revenue,
              }))}
              height={300}
              color="#10B981"
              formatValue={(v) => formatCurrency(v)}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Répartition des Réservations
            </h3>

            <PieChart
              data={[
                {
                  label: 'Confirmées',
                  value: reservationsByStatus?.confirmed || 0,
                  color: '#10B981',
                },
                {
                  label: 'En attente',
                  value: reservationsByStatus?.pending || 0,
                  color: '#F59E0B',
                },
                {
                  label: 'Annulées',
                  value: reservationsByStatus?.cancelled || 0,
                  color: '#EF4444',
                },
              ]}
              size={180}
              formatValue={(v) => v.toString()}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Performance par Espace
            </h3>

            <BarChart
              data={espacePerformance.slice(0, 8).map(e => ({
                label: e.espaceName,
                value: e.revenue,
                color: '#3B82F6',
              }))}
              height={300}
              formatValue={(v) => formatCurrency(v)}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Espaces
            </h3>

            <div className="space-y-4">
              {espacePerformance.slice(0, 5).map((espace, index) => (
                <motion.div
                  key={espace.espaceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{espace.espaceName}</p>
                      <p className="text-sm text-gray-600">{espace.type}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(espace.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {espace.reservations} réservations
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Domiciliations</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{dashboardStats.domiciliations.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actives</span>
                <span className="font-semibold text-green-600">
                  {dashboardStats.domiciliations.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En attente</span>
                <span className="font-semibold text-yellow-600">
                  {dashboardStats.domiciliations.pending}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Revenu mensuel</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(dashboardStats.domiciliations.monthlyRevenue)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Réservations</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmées</span>
                <span className="font-semibold text-green-600">
                  {dashboardStats.reservations.confirmed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En attente</span>
                <span className="font-semibold text-yellow-600">
                  {dashboardStats.reservations.pending}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">À venir</span>
                <span className="font-semibold text-blue-600">
                  {dashboardStats.reservations.upcoming}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Revenu en attente</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(dashboardStats.revenue.pending)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Utilisateurs</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{dashboardStats.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actifs</span>
                <span className="font-semibold text-green-600">
                  {dashboardStats.users.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nouveaux</span>
                <span className="font-semibold text-blue-600">
                  {dashboardStats.users.new}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Taux de croissance</span>
                <span className="font-bold text-green-600">
                  +{dashboardStats.users.total > 0
                    ? ((dashboardStats.users.new / dashboardStats.users.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
