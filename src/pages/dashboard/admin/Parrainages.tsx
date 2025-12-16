import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Users, TrendingUp, Award, DollarSign, Calendar, Search, Download } from 'lucide-react'
import { apiClient } from '../../../lib/api-client'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Parrainage {
  id: string
  parrain_id: string
  parrain_nom: string
  parrain_prenom: string
  parrain_email: string
  filleul_id: string
  filleul_nom: string
  filleul_prenom: string
  filleul_email: string
  statut: string
  credits_accordes: number
  date_parrainage: string
}

interface Stats {
  total_parrainages: number
  total_credits_distribues: number
  parrainages_actifs: number
  meilleurs_parrains: any[]
}

const Parrainages = () => {
  const [parrainages, setParrainages] = useState<Parrainage[]>([])
  const [stats, setStats] = useState<Stats>({
    total_parrainages: 0,
    total_credits_distribues: 0,
    parrainages_actifs: 0,
    meilleurs_parrains: []
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getParrainages()
      const data = (response.data || []) as any[]
      setParrainages(data)

      // Calculer les stats
      const statsData = {
        total_parrainages: data.length,
        total_credits_distribues: data.reduce((sum: number, p: Parrainage) => sum + p.credits_accordes, 0),
        parrainages_actifs: data.filter((p: Parrainage) => p.statut === 'valide').length,
        meilleurs_parrains: calculateTopSponsors(data)
      }
      setStats(statsData)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const calculateTopSponsors = (data: Parrainage[]) => {
    const sponsorMap = new Map()

    data.forEach(p => {
      if (!sponsorMap.has(p.parrain_id)) {
        sponsorMap.set(p.parrain_id, {
          id: p.parrain_id,
          nom: p.parrain_nom,
          prenom: p.parrain_prenom,
          email: p.parrain_email,
          count: 0,
          credits: 0
        })
      }
      const sponsor = sponsorMap.get(p.parrain_id)
      sponsor.count++
      sponsor.credits += p.credits_accordes
    })

    return Array.from(sponsorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const filteredParrainages = parrainages.filter(p =>
    p.parrain_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.parrain_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.filleul_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.filleul_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const exportData = () => {
    const csv = [
      ['Parrain', 'Email Parrain', 'Filleul', 'Email Filleul', 'Date', 'Crédits', 'Statut'],
      ...filteredParrainages.map(p => [
        `${p.parrain_prenom} ${p.parrain_nom}`,
        p.parrain_email,
        `${p.filleul_prenom} ${p.filleul_nom}`,
        p.filleul_email,
        format(new Date(p.date_parrainage), 'dd/MM/yyyy HH:mm'),
        `${p.credits_accordes} DA`,
        p.statut
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parrainages_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export réussi')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary">
          Programme de Parrainage
        </h1>
        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Parrainages</p>
              <p className="text-2xl font-bold text-primary">{stats.total_parrainages}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Crédits Distribués</p>
              <p className="text-2xl font-bold text-primary">{stats.total_credits_distribues} DA</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-teal" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Parrainages Actifs</p>
              <p className="text-2xl font-bold text-primary">{stats.parrainages_actifs}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Sponsors */}
      {stats.meilleurs_parrains.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent" />
            Meilleurs Parrains
          </h2>
          <div className="space-y-3">
            {stats.meilleurs_parrains.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {sponsor.prenom} {sponsor.nom}
                    </p>
                    <p className="text-sm text-gray-500">{sponsor.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{sponsor.count} parrainages</p>
                  <p className="text-sm text-gray-600">{sponsor.credits} DA distribués</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Rechercher un parrainage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Parrainages Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parrain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filleul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crédits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParrainages.map((parrainage) => (
                <tr key={parrainage.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {parrainage.parrain_prenom} {parrainage.parrain_nom}
                      </div>
                      <div className="text-sm text-gray-500">{parrainage.parrain_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {parrainage.filleul_prenom} {parrainage.filleul_nom}
                      </div>
                      <div className="text-sm text-gray-500">{parrainage.filleul_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(parrainage.date_parrainage), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-accent">{parrainage.credits_accordes} DA</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={parrainage.statut === 'valide' ? 'success' : 'warning'}>
                      {parrainage.statut}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredParrainages.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun parrainage trouvé</p>
        </div>
      )}
    </div>
  )
}

export default Parrainages
