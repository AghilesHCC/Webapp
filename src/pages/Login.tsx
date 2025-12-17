import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { validationRules } from '../utils/validation'
import Logo from '../components/Logo'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const Login = () => {
  const navigate = useNavigate()
  const { login, loginWithGoogle, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>()

  const handleGoogleResponse = useCallback(async (response: any) => {
    if (response.credential) {
      setIsGoogleLoading(true)
      try {
        await loginWithGoogle(response.credential)
        navigate('/app')
      } catch (error) {
      } finally {
        setIsGoogleLoading(false)
      }
    }
  }, [loginWithGoogle, navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('session_expired') === '1') {
      window.history.replaceState({}, '', '/connexion')
    }
  }, [])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || user) return

    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) {
        if (window.google) {
          initializeGoogle()
        }
        return
      }

      const script = document.createElement('script')
      script.id = 'google-identity-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeGoogle()
      }
      document.body.appendChild(script)
    }

    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        })
        setGoogleLoaded(true)

        const buttonContainer = document.getElementById('google-signin-button')
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'center'
          })
        }
      }
    }

    loadGoogleScript()
  }, [GOOGLE_CLIENT_ID, user, handleGoogleResponse])

  if (user) {
    return <Navigate to="/app" replace />
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/app')
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo className="h-16 mx-auto" />
          </Link>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-display font-bold text-primary mb-2 text-center">
            Connexion
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Accedez a votre espace membre
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="votre@email.com"
              autoComplete="email"
              {...register('email', validationRules.email)}
              error={errors.email?.message}
            />

            <Input
              label="Mot de passe"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="********"
              autoComplete="current-password"
              {...register('password', validationRules.password)}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                  {...register('rememberMe')}
                />
                <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-accent hover:text-accent/80">
                Mot de passe oublie ?
              </a>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
            >
              Se connecter
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OU</span>
                </div>
              </div>

              <div className="w-full">
                {isGoogleLoading ? (
                  <Button
                    type="button"
                    variant="outline"
                    loading={true}
                    className="w-full"
                  >
                    Connexion en cours...
                  </Button>
                ) : googleLoaded ? (
                  <div id="google-signin-button" className="flex justify-center"></div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Chargement...
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-accent hover:text-accent/80 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
            &larr; Retour a l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
