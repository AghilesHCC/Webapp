import { useAuthStore } from '../../store/authStore'
import { AdminDashboard } from './AdminDashboard'
import { UserDashboard } from './UserDashboard'

export default function DashboardHome() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur d'authentification</h2>
        <p className="text-gray-600">Veuillez vous reconnecter</p>
      </div>
    )
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />
}
