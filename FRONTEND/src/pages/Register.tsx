import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/lib/api'

export default function Register() {
  const navigate = useNavigate()
  const { register, error: authError, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    clearError()
  }, [clearError])

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setError('')
    clearError()
    window.location.href = authAPI.getOAuthUrl(provider)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    clearError()

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/onboarding')
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-dark-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-lg text-white space-y-8 relative z-10">
          <h2 className="text-5xl font-bold">
            Start your journey today
          </h2>
          <p className="text-xl text-white/90">
            Create your account and experience the future of customer relationship management.
          </p>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-2xl font-bold mb-2">14 days free</p>
              <p className="text-white/80">No credit card required</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-2xl font-bold mb-2">5-minute setup</p>
              <p className="text-white/80">Get started instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
              Create your account
            </h1>
            <p className="text-dark-600 dark:text-dark-400">
              Join thousands of businesses growing with Nexus
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
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User size={18} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              placeholder="Create a strong password"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be at least 8 characters"
              required
            />

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                required
                className="mt-1 w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500" 
              />
              <label className="text-sm text-dark-700 dark:text-dark-300">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-300 dark:border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-950 text-dark-500">Or sign up with</span>
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
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
