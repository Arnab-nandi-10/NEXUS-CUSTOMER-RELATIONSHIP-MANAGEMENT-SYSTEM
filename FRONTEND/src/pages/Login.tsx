import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, error: authError, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    clearError()
    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError(oauthError)
    }
  }, [clearError, searchParams])

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setError('')
    clearError()
    window.location.href = authAPI.getOAuthUrl(provider)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    clearError()

    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }

    setIsLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/app/dashboard')
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white dark:bg-dark-950">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold gradient-text">Nexus CRM</span>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-2">
              Welcome back
            </h1>
            <p className="text-dark-600 dark:text-dark-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="bg-danger-50 dark:bg-danger-950/50 border border-danger-200 dark:border-danger-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-danger-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-danger-700 dark:text-danger-400">{error || authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="john@company.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-dark-700 dark:text-dark-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-300 dark:border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-950 text-dark-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" onClick={() => handleOAuthLogin('google')}>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Google
              </Button>
              <Button variant="outline" type="button" onClick={() => handleOAuthLogin('github')}>
                <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5" />
                GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-dark-600 dark:text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-accent-600 p-12 items-center justify-center">
        <div className="max-w-lg text-white space-y-8">
          <h2 className="text-5xl font-bold">
            Transform your customer relationships
          </h2>
          <p className="text-xl text-white/90">
            Join thousands of businesses using Nexus CRM to grow faster and work smarter.
          </p>
          <div className="space-y-4">
            {[
              'Intuitive & modern interface',
              'Real-time analytics & insights',
              'Seamless team collaboration',
              'Enterprise-grade security'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
