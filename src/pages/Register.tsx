import React, { useEffect, useCallback } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight, Gift } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { UserForm } from '../types'
import { validationRules } from '../utils/validation'
import Logo from '../components/Logo'
import { apiClient } from '../lib/api-client'

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

interface RegisterForm extends UserForm {
  passwordConfirm?: string
  acceptTerms: boolean
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser, loginWithGoogle, user } = useAuthStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [validatingReferral, setValidatingReferral] = React.useState(false)
  const [referralValid, setReferralValid] = React.useState<boolean | null>(null)
  const [googleLoaded, setGoogleLoaded] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>()

  const password = watch('password')

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

        const buttonContainer = document.getElementById('google-signup-button')
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
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

  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferralValid(null)
      return
    }

    setValidatingReferral(true)
    try {
      const response = await apiClient.verifyCodeParrainage(code)

      if (response.success && response.data) {
        setReferralValid(true)
        toast.success('Code de parrainage valide! Vous recevrez 3000 DA')
      } else {
        setReferralValid(false)
        toast.error('Code de parrainage invalide')
      }
    } catch (error) {
      setReferralValid(false)
    } finally {
      setValidatingReferral(false)
    }
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        profession: data.profession,
        entreprise: data.entreprise,
        codeParrainage: data.codeParrainage,
      })
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
            Inscription
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Creez votre compte Coffice
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prenom"
                icon={<User className="w-5 h-5" />}
                placeholder="Prenom"
                autoComplete="given-name"
                {...register('prenom', validationRules.prenom)}
                error={errors.prenom?.message}
              />
              <Input
                label="Nom"
                placeholder="Nom"
                autoComplete="family-name"
                {...register('nom', validationRules.nom)}
                error={errors.nom?.message}
              />
            </div>

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
              label="Telephone"
              type="tel"
              icon={<Phone className="w-5 h-5" />}
              placeholder="+213 55 123 4567"
              autoComplete="tel"
              {...register('telephone', validationRules.phone)}
              error={errors.telephone?.message}
            />

            <Input
              label="Mot de passe"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="********"
              autoComplete="new-password"
              {...register('password', validationRules.password)}
              error={errors.password?.message}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="********"
              autoComplete="new-password"
              {...register('passwordConfirm', validationRules.passwordConfirm(password))}
              error={errors.passwordConfirm?.message}
            />

            <div className="relative">
              <Input
                label="Code de parrainage (optionnel)"
                type="text"
                icon={<Gift className="w-5 h-5" />}
                placeholder="COFFICE-XXXXXX"
                {...register('codeParrainage')}
                onBlur={(e) => validateReferralCode(e.target.value)}
              />
              {validatingReferral && (
                <div className="absolute right-3 top-10">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                </div>
              )}
              {referralValid === true && (
                <p className="text-sm text-green-600 mt-1">Code valide! Bonus de 3000 DA a l'inscription</p>
              )}
              {referralValid === false && (
                <p className="text-sm text-red-600 mt-1">Code invalide</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Si vous avez un code de parrainage, vous recevrez 3000 DA de credit gratuit
              </p>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-accent focus:ring-accent mt-1"
                {...register('acceptTerms', validationRules.acceptTerms)}
              />
              <span className="ml-2 text-sm text-gray-600">
                J'accepte les{' '}
                <Link to="/mentions-legales" className="text-accent hover:text-accent/80">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/mentions-legales" className="text-accent hover:text-accent/80">
                  politique de confidentialite
                </Link>
              </span>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-600 text-sm">{errors.acceptTerms.message}</p>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
            >
              Creer mon compte
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
                    Inscription en cours...
                  </Button>
                ) : googleLoaded ? (
                  <div id="google-signup-button" className="flex justify-center"></div>
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
              Deja un compte ?{' '}
              <Link to="/connexion" className="text-accent hover:text-accent/80 font-medium">
                Se connecter
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

export default Register
