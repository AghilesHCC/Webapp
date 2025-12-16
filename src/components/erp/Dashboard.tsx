import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Building, Clock, AlertCircle, CheckCircle, ArrowUpRight, Briefcase, FileText, Package, PenTool as Tool, Bell } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useERPStore } from '../../store/erpStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { apiClient } from '../../lib/api-client';

const ERPDashboard = () => {
  const { 
    spaces, reservations, members, subscriptions, invoices, 
    maintenanceRequests, inventory, generateAnalytics, analytics,
    getLowStockItems
  } = useERPStore();
  
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        generateAnalytics(period);

        const response = await apiClient.getAdminStats();
        if (response.success && response.data) {
          setAdminStats(response.data);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  // Calcul des statistiques
  const stats = {
    totalSpaces: spaces.length,
    availableSpaces: spaces.filter(s => s.available).length,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    totalReservations: reservations.length,
    todayReservations: reservations.filter(r => 
      new Date(r.startDate).toDateString() === new Date().toDateString()
    ).length,
    pendingInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'draft').length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    lowStockItems: getLowStockItems().length,
    pendingMaintenance: maintenanceRequests.filter(r => r.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          Tableau de bord ERP
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre espace de coworking
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus ce mois</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(adminStats?.revenue?.month || analytics?.financialSummary.revenue || 0)}
                </p>
                {adminStats?.revenue?.growth !== undefined && (
                  <p className={`text-sm mt-1 ${adminStats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adminStats.revenue.growth >= 0 ? '+' : ''}{adminStats.revenue.growth}% vs mois dernier
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'occupation</p>
                <p className="text-2xl font-bold text-primary">{adminStats?.occupancy?.rate || analytics?.occupancyRate || 0}%</p>
                {adminStats?.occupancy?.growth !== undefined && (
                  <p className={`text-sm mt-1 ${adminStats.occupancy.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adminStats.occupancy.growth >= 0 ? '+' : ''}{adminStats.occupancy.growth}% vs mois dernier
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Membres actifs</p>
                <p className="text-2xl font-bold text-primary">{adminStats?.users?.active || stats.activeMembers}</p>
                {adminStats?.users?.growth !== undefined && (
                  <p className={`text-sm mt-1 ${adminStats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adminStats.users.growth >= 0 ? '+' : ''}{adminStats.users.growth}% vs mois dernier
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservations aujourd'hui</p>
                <p className="text-2xl font-bold text-primary">{adminStats?.reservations?.today || stats.todayReservations}</p>
                {adminStats?.reservations?.growth !== undefined && (
                  <p className={`text-sm mt-1 ${adminStats.reservations.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adminStats.reservations.growth >= 0 ? '+' : ''}{adminStats.reservations.growth} vs hier
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-warm/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warm" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-display font-bold text-primary mb-4">
            Alertes et notifications
          </h2>
          
          <div className="space-y-4">
            {stats.overdueInvoices > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{stats.overdueInvoices} factures en retard</p>
                    <p className="text-sm text-gray-600">Nécessite votre attention</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Voir les factures
                </Button>
              </div>
            )}
            
            {stats.pendingMaintenance > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Tool className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{stats.pendingMaintenance} demandes de maintenance en attente</p>
                    <p className="text-sm text-gray-600">Nécessite une intervention</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Voir les demandes
                </Button>
              </div>
            )}
            
            {stats.lowStockItems > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{stats.lowStockItems} articles en stock bas</p>
                    <p className="text-sm text-gray-600">Réapprovisionnement nécessaire</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Voir l'inventaire
                </Button>
              </div>
            )}
            
            {stats.pendingInvoices > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{stats.pendingInvoices} factures en attente</p>
                    <p className="text-sm text-gray-600">A envoyer aux clients</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Gerer les factures
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-bold text-primary">
                Évolution des revenus
              </h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={period === 'month' ? 'bg-accent/10 text-accent' : ''}
                  onClick={() => setPeriod('month')}
                >
                  Mois
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={period === 'year' ? 'bg-accent/10 text-accent' : ''}
                  onClick={() => setPeriod('year')}
                >
                  Année
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {analytics?.membershipGrowth.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.period}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${(item.count / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-primary w-20 text-right">
                      {item.count} membres
                    </span>
                    <span className={`text-sm w-16 text-right ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.growth >= 0 ? '+' : ''}{item.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Top Spaces */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-display font-bold text-primary mb-6">
              Espaces les plus populaires
            </h3>
            <div className="space-y-4">
              {analytics?.topSpaces.map((space, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-primary">{space.name}</p>
                    <p className="text-sm text-gray-600">{space.bookings} réservations</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatCurrency(space.revenue)}</p>
                    <p className="text-sm text-green-600">
                      <ArrowUpRight className="w-3 h-3 inline mr-1" />
                      {Math.round((space.revenue / analytics.financialSummary.revenue) * 100)}% du CA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-4">
            Activité récente
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-primary">Nouvelle réservation confirmée</p>
                  <p className="text-sm text-gray-600">Salle de Réunion - {formatDate(new Date())}</p>
                </div>
              </div>
              <Badge variant="success">Confirmée</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-primary">Nouvel abonnement</p>
                  <p className="text-sm text-gray-600">Plan Standard - Ahmed Benali</p>
                </div>
              </div>
              <span className="text-blue-600 font-semibold">{formatCurrency(25000)}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-primary">Rappel de maintenance</p>
                  <p className="text-sm text-gray-600">Climatisation Zone Principale - Demain</p>
                </div>
              </div>
              <Badge variant="warning">Planifié</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Résumé financier
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {formatCurrency(analytics?.financialSummary.revenue || 0)}
              </div>
              <div className="text-sm text-gray-600">Revenus</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-rose mb-1">
                {formatCurrency(analytics?.financialSummary.expenses || 0)}
              </div>
              <div className="text-sm text-gray-600">Dépenses</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(analytics?.financialSummary.profit || 0)}
              </div>
              <div className="text-sm text-gray-600">Bénéfice</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {formatCurrency(analytics?.financialSummary.outstandingInvoices || 0)}
              </div>
              <div className="text-sm text-gray-600">Factures impayées</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-primary">Répartition des revenus</h4>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Rapport complet
              </Button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-2">Par espace</h5>
                <div className="space-y-2">
                  {analytics?.topSpaces.map((space, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{space.name}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-teal h-2 rounded-full" 
                            style={{ width: `${(space.revenue / analytics.financialSummary.revenue) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{Math.round((space.revenue / analytics.financialSummary.revenue) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-2">Par abonnement</h5>
                <div className="space-y-2">
                  {Object.entries(analytics?.revenueByMembership || {}).map(([key, value], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key === 'membership-1' ? 'Starter' : 
                         key === 'membership-2' ? 'Standard' : 'Premium'}
                      </span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-warm h-2 rounded-full" 
                            style={{ width: `${(value / analytics.financialSummary.revenue) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{Math.round((value / analytics.financialSummary.revenue) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ERPDashboard;