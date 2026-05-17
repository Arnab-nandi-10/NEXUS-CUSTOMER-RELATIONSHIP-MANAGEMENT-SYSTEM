import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

interface OAuthUserPayload {
  _id: string
  fullname: string
  email: string
  role: 'admin' | 'manager' | 'user' | 'sales' | 'support'
  avatar?: string
}

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export default function OAuthCallback() {
  const navigate = useNavigate()
  const completeOAuthLogin = useAuthStore((state) => state.completeOAuthLogin)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = params.get('accessToken')
      const encodedUser = params.get('user')

      if (!accessToken || !encodedUser) {
        throw new Error('OAuth sign-in did not return a session. Please try again.')
      }

      const payload = JSON.parse(decodeBase64Url(encodedUser)) as OAuthUserPayload
      completeOAuthLogin(accessToken, {
        id: payload._id,
        name: payload.fullname,
        email: payload.email,
        role: payload.role,
        avatar: payload.avatar,
      })

      window.history.replaceState(null, '', '/oauth/callback')
      navigate('/app/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'OAuth sign-in failed. Please try again.')
    }
  }, [completeOAuthLogin, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold gradient-text">Nexus CRM</span>
        </div>

        {error ? (
          <>
            <div className="bg-danger-50 dark:bg-danger-950/50 border border-danger-200 dark:border-danger-800 rounded-lg p-4 flex items-start gap-3 text-left">
              <AlertCircle className="text-danger-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-danger-700 dark:text-danger-400">{error}</p>
            </div>
            <Link to="/login">
              <Button fullWidth>Back to Sign In</Button>
            </Link>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 text-dark-600 dark:text-dark-300">
            <Loader2 className="animate-spin" size={20} />
            <span>Finishing sign in...</span>
          </div>
        )}
      </div>
    </div>
  )
}
