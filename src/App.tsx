import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'

// Components (chargés immédiatement)
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

// Hooks
import { useScrollAnimation } from './hooks/useScrollAnimation'
import { useAuthStore } from './store/authStore'

// Pages (lazy loaded)
const Home = lazy(() => import('./pages/Home'))
const SpacesAndPricing = lazy(() => import('./pages/SpacesAndPricing'))
const About = lazy(() => import('./pages/About'))
const DomiciliationPublic = lazy(() => import('./pages/Domiciliation'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Legal = lazy(() => import('./pages/Legal'))

function App() {
  useScrollAnimation()
  const authStore = useAuthStore()
  const initRef = React.useRef(false)

  React.useEffect(() => {
    // Initialiser UNE SEULE FOIS au montage de l'application
    if (initRef.current) return
    initRef.current = true

    const initApp = async () => {
      await authStore.initialize()
    }

    initApp()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!authStore.isInitialized) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <ScrollToTop />

        <Suspense fallback={<LoadingScreen />}>
          <Routes>
          {/* Pages publiques avec navigation */}
          <Route path="/" element={
            <>
              <Navbar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Home />
              </motion.main>
              <Footer />
            </>
          } />
          
          <Route path="/espaces" element={
            <>
              <Navbar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <SpacesAndPricing />
              </motion.main>
              <Footer />
            </>
          } />

          <Route path="/tarifs" element={
            <>
              <Navbar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <SpacesAndPricing />
              </motion.main>
              <Footer />
            </>
          } />
          
          <Route path="/a-propos" element={
            <>
              <Navbar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <About />
              </motion.main>
              <Footer />
            </>
          } />

          <Route path="/domiciliation" element={
            <>
              <Navbar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <DomiciliationPublic />
              </motion.main>
              <Footer />
            </>
          } />

          <Route path="/mentions-legales" element={
            <>
              <Navbar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Legal />
              </motion.main>
              <Footer />
            </>
          } />
          
          {/* Pages d'authentification */}
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          
          {/* Dashboard (application) */}
          <Route path="/app/*" element={<Dashboard />} />

          {/* Page 404 - doit être en dernier */}
          <Route path="*" element={
            <>
              <Navbar />
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                  <a href="/" className="btn-primary">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
              <Footer />
            </>
          } />
        </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}

export default App