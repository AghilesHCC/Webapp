import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Building,
  Activity,
  Download,
  ArrowUp,
  ArrowDown,
  Percent
} from 'lucide-react'
import { useAppStore } from '../../../store/store'
import Card from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatters'

const Reports = () => {
  const { reservations, users, espaces, domiciliationServices } = useAppStore()
  const [periode, setPeriode] = useState<'semaine' | 'mois' | 'annee'>('mois')

  const stats = useMemo(() => {
    const today = new Date()
    const thisMonth = today.getMonth()
    const lastMonth = thisMonth - 1
    const thisYear = today.getFullYear()

    // Réservations
    const totalReservations = reservations.length
    const reservationsThisMonth = reservations.filter(r =>
      new Date(r.dateCreation).getMonth() === thisMonth
    ).length
    const reservationsLastMonth = reservations.filter(r =>
      new Date(r.dateCreation).getMonth() === lastMonth
    ).length

    // Revenus
    const revenuTotal = reservations
      .filter(r => r.statut === 'confirmee')
      .reduce((sum, r) => sum + r.montantTotal, 0)

    const revenuThisMonth = reservations
      .filter(r =>
        r.statut === 'confirmee' &&
        new Date(r.dateCreation).getMonth() === thisMonth
      )
      .reduce((sum, r) => sum + r.montantTotal, 0)

    const revenuLastMonth = reservations
      .filter(r =>
        r.statut === 'confirmee' &&
        new Date(r.dateCreation).getMonth() === lastMonth
      )
      .reduce((sum, r) => sum + r.montantTotal, 0)

    // Utilisateurs
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.statut === 'actif').length
    const newUsersThisMonth = users.filter(u =>
      new Date(u.dateCreation).getMonth() === thisMonth
    ).length

    // Espaces
    const totalEspaces = espaces.length
    const espacesDisponibles = espaces.filter(e => e.disponible).length
    const tauxOccupation = totalEspaces > 0
      ? ((totalEspaces - espacesDisponibles) / totalEspaces * 100).toFixed(1)
      : 0

    // Domiciliation
    const domiciliationsActives = domiciliationServices.filter(d => d.status === 'active').length
    const revenuDomiciliation = domiciliationServices
      .filter(d => d.status === 'active')
      .reduce((sum, d) => sum + (d.monthlyFee || 0), 0)

    // Variations
    const variationReservations = reservationsLastMonth > 0
      ? ((reservationsThisMonth - reservationsLastMonth) / reservationsLastMonth * 100).toFixed(1)
      : 0

    const variationRevenu = revenuLastMonth > 0
      ? ((revenuThisMonth - revenuLastMonth) / revenuLastMonth * 100).toFixed(1)
      : 0

    // Répartition par espace
    const espacesStats = espaces.map(espace => {
      const reservationsEspace = reservations.filter(r => r.espace?.id === espace.id)
      const revenuEspace = reservationsEspace
        .filter(r => r.statut === 'confirmee')
        .reduce((sum, r) => sum + r.montantTotal, 0)

      return {
        nom: espace.nom,
        reservations: reservationsEspace.length,
        revenu: revenuEspace
      }
    }).sort((a, b) => b.revenu - a.revenu)

    // Répartition par statut
    const reservationsConfirmees = reservations.filter(r => r.statut === 'confirmee').length
    const reservationsEnAttente = reservations.filter(r => r.statut === 'en_attente').length
    const reservationsAnnulees = reservations.filter(r => r.statut === 'annulee').length

    return {
      totalReservations,
      reservationsThisMonth,
      reservationsLastMonth,
      variationReservations,
      revenuTotal,
      revenuThisMonth,
      revenuLastMonth,
      variationRevenu,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalEspaces,
      espacesDisponibles,
      tauxOccupation,
      domiciliationsActives,
      revenuDomiciliation,
      espacesStats,
      reservationsConfirmees,
      reservationsEnAttente,
      reservationsAnnulees
    }
  }, [reservations, users, espaces, domiciliationServices])

  const kpiCards = [
    {
      title: 'Chiffre d\'Affaires Total',
      value: formatCurrency(stats.revenuTotal),
      subtitle: `${formatCurrency(stats.revenuThisMonth)} ce mois`,
      variation: stats.variationRevenu,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Réservations Total',
      value: stats.totalReservations,
      subtitle: `${stats.reservationsThisMonth} ce mois`,
      variation: stats.variationReservations,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Utilisateurs Actifs',
      value: `${stats.activeUsers}/${stats.totalUsers}`,
      subtitle: `+${stats.newUsersThisMonth} ce mois`,
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Taux d\'Occupation',
      value: `${stats.tauxOccupation}%`,
      subtitle: `${stats.espacesDisponibles} espaces libres`,
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const exportReport = () => {
    const data = {
      date: new Date().toISOString(),
      periode,
      stats
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble des performances</p>
        </div>
        <div className="flex gap-3">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="annee">Cette année</option>
          </select>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                {kpi.variation && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    Number(kpi.variation) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Number(kpi.variation) >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(Number(kpi.variation))}%
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.subtitle}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Performance par Espace
          </h2>
          <div className="space-y-4">
            {stats.espacesStats.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune donnée</p>
            ) : (
              stats.espacesStats.map((espace, index) => {
                const maxRevenu = Math.max(...stats.espacesStats.map(e => e.revenu))
                const percentage = maxRevenu > 0 ? (espace.revenu / maxRevenu * 100) : 0

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-900">{espace.nom}</span>
                      <span className="font-bold text-accent">{formatCurrency(espace.revenu)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-accent to-accent/80 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{espace.reservations} réservation(s)</p>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Répartition des Réservations
          </h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-gray-700">Confirmées</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.reservationsConfirmees}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalReservations > 0 ? (stats.reservationsConfirmees / stats.totalReservations * 100) : 0}%` }}
                  transition={{ duration: 1 }}
                  className="bg-green-500 h-2 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-gray-700">En attente</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.reservationsEnAttente}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalReservations > 0 ? (stats.reservationsEnAttente / stats.totalReservations * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-amber-500 h-2 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-gray-700">Annulées</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.reservationsAnnulees}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalReservations > 0 ? (stats.reservationsAnnulees / stats.totalReservations * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="bg-red-500 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Revenus Domiciliation</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-teal-600">
              {formatCurrency(stats.revenuDomiciliation)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Revenu mensuel recurrent</p>
            <p className="text-sm font-medium text-gray-700 mt-4">
              {stats.domiciliationsActives} domiciliation(s) active(s)
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Taux de Conversion</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">
              {stats.totalReservations > 0
                ? ((stats.reservationsConfirmees / stats.totalReservations * 100).toFixed(1))
                : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Réservations confirmées</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">{stats.totalReservations}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Confirmées</span>
                <span className="font-medium text-green-600">{stats.reservationsConfirmees}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Revenus Moyens</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">
              {stats.reservationsConfirmees > 0
                ? formatCurrency(stats.revenuTotal / stats.reservationsConfirmees)
                : formatCurrency(0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Par réservation</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ce mois</span>
                <span className="font-medium">{formatCurrency(stats.revenuThisMonth)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Mois dernier</span>
                <span className="font-medium">{formatCurrency(stats.revenuLastMonth)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Reports
