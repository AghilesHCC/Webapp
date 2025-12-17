import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Building,
  FileText,
  BarChart3,
  RefreshCw,
  Tag,
  Gift,
  Activity,
  Shield,
  CreditCard
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import NotificationCenter from '../ui/NotificationCenter'
import toast from 'react-hot-toast'
import Logo from '../Logo'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, loadUser } = useAuthStore()
  const { loadEspaces, loadReservations, loadAbonnements, loadDemandesDomiciliation } = useAppStore()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        loadUser(),
        loadEspaces(),
        loadReservations(),
        loadAbonnements(),
        loadDemandesDomiciliation()
      ])
      toast.success('Données actualisées')
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation')
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/connexion', { replace: true })
    } catch (error) {
      navigate('/connexion', { replace: true })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Link to="/connexion" className="btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  const userNavigation = [
    { name: 'Tableau de bord', href: '/app', icon: Home },
    { name: 'Réservations', href: '/app/reservations', icon: Calendar },
    { name: 'Domiciliation', href: '/app/domiciliation', icon: Building },
    { name: 'Codes Promo', href: '/app/codes-promo', icon: Tag },
    { name: 'Profil', href: '/app/profil', icon: User },
  ]

  const adminNavigation = [
    { name: 'Tableau de bord', href: '/app', icon: Home },
    { name: 'Utilisateurs', href: '/app/admin/users', icon: Users },
    { name: 'Espaces', href: '/app/admin/spaces', icon: Building },
    { name: 'Réservations', href: '/app/admin/reservations', icon: Calendar },
    { name: 'Domiciliations', href: '/app/admin/domiciliations', icon: FileText },
    { name: 'Abonnements', href: '/app/admin/abonnements', icon: CreditCard },
    { name: 'Codes Promo', href: '/app/admin/codes-promo', icon: Tag },
    { name: 'Parrainages', href: '/app/admin/parrainages', icon: Gift },
    { name: 'Analytics', href: '/app/admin/analytics', icon: Activity },
    { name: 'Rapports', href: '/app/admin/reports', icon: BarChart3 },
    { name: 'Diagnostics', href: '/app/admin/diagnostics', icon: Activity },
    { name: 'Audit Logs', href: '/app/admin/audit-logs', icon: Shield },
    { name: 'Paramètres', href: '/app/admin/settings', icon: Settings },
  ]

  const navigation = user.role === 'admin' ? adminNavigation : userNavigation

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app'
    }
    return location.pathname.startsWith(path)
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <Link to="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${active
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-accent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getInitials(user.prenom, user.nom)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent text-white mt-1">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>Coffice</span>
                <span>/</span>
                <span className="text-primary font-medium">
                  {user.role === 'admin' ? 'Administration' : 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <NotificationCenter />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
