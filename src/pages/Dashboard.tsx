import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingScreen from '../components/LoadingScreen'
import DashboardLayout from '../components/dashboard/DashboardLayout'

// Import direct des composants
import DashboardHome from '../components/dashboard/DashboardHome'
import Reservations from './dashboard/Reservations'
import Profile from './dashboard/Profile'
import Domiciliation from './dashboard/Domiciliation'
import MyCompany from './dashboard/MyCompany'
import CodesPromo from './dashboard/CodesPromo'
// Admin pages
import AdminUsers from './dashboard/admin/Users'
import AdminSpaces from './dashboard/admin/Spaces'
import AdminReservations from './dashboard/admin/Reservations'
import AdminReports from './dashboard/admin/Reports'
import AdminDomiciliations from './dashboard/admin/Domiciliations'
import AdminCodesPromo from './dashboard/admin/CodesPromo'
import AdminParrainages from './dashboard/admin/Parrainages'
import AdminSettings from './dashboard/admin/Settings'
import AdminAnalytics from './dashboard/admin/Analytics'
import AdminAuditLogs from './dashboard/admin/AuditLogs'
import AdminAbonnements from './dashboard/admin/Abonnements'

const Dashboard = () => {
  const { user } = useAuthStore()

  // Redirection si non authentifié
  if (!user) {
    return <Navigate to="/connexion" replace />
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Page d'accueil du dashboard */}
          <Route index element={<DashboardHome />} />

          {/* Routes utilisateur standard */}
          <Route path="reservations" element={<Reservations />} />
          <Route path="domiciliation" element={<Domiciliation />} />
          <Route path="codes-promo" element={<CodesPromo />} />
          <Route path="mon-entreprise" element={<MyCompany />} />
          <Route path="profil" element={<Profile />} />

          {/* Routes admin */}
          {user?.role === 'admin' && (
            <>
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/spaces" element={<AdminSpaces />} />
              <Route path="admin/reservations" element={<AdminReservations />} />
              <Route path="admin/domiciliations" element={<AdminDomiciliations />} />
              <Route path="admin/codes-promo" element={<AdminCodesPromo />} />
              <Route path="admin/parrainages" element={<AdminParrainages />} />
              <Route path="admin/abonnements" element={<AdminAbonnements />} />
              <Route path="admin/analytics" element={<AdminAnalytics />} />
              <Route path="admin/reports" element={<AdminReports />} />
              <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="admin/settings" element={<AdminSettings />} />
            </>
          )}

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  )
}

export default Dashboard