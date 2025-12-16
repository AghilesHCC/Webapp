import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight, Gift } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { UserForm } from '../types'
import { apiClient } from '../lib/api-client'
import { validationRules } from '../utils/validation'
import Logo from '../components/Logo'

interface RegisterForm extends UserForm {
  passwordConfirm?: string
  acceptTerms: boolean
}

const Register = () => {
  const { register: registerUser, user } = useAuthStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [validatingReferral, setValidatingReferral] = React.useState(false)
  const [referralValid, setReferralValid] = React.useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>()

  const password = watch('password')

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
      const result = await apiClient.verifyCodeParrainage(code)
      setReferralValid(result.success)
      if (result.success) {
        toast.success('Code de parrainage valide! Vous recevrez 3000 DA')
      } else {
        toast.error(result.error || 'Code de parrainage invalide')
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
    } catch (error) {
      // L'erreur est déjà affichée par le store via toast
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo className="h-16 mx-auto" />
          </Link>
        </div>

        {/* Form */}
        <div className="card p-8">
          <h2 className="text-2xl font-display font-bold text-primary mb-2 text-center">
            Inscription
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Créez votre compte Coffice
          </p>

          {/* Info */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                icon={<User className="w-5 h-5" />}
                placeholder="Prénom"
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
              label="Téléphone"
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
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password', validationRules.password)}
              error={errors.password?.message}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
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
                <p className="text-sm text-green-600 mt-1">✓ Code valide! Bonus de 3000 DA à l'inscription</p>
              )}
              {referralValid === false && (
                <p className="text-sm text-red-600 mt-1">✗ Code invalide</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Si vous avez un code de parrainage, vous recevrez 3000 DA de crédit gratuit
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
                  politique de confidentialité
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
              Créer mon compte
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="text-accent hover:text-accent/80 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Register