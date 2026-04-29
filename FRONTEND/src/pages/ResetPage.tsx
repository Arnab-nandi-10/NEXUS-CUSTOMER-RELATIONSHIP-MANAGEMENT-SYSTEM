import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { clearAppData } from '@/lib/storage'

export default function ResetPage() {
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle')

  const handleReset = () => {
    setStatus('clearing')
    try {
      setTimeout(() => {
        clearAppData()
      }, 1000)
      setStatus('success')
    } catch (error) {
      console.error('Reset failed:', error)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 rounded-xl shadow-xl p-8 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          status === 'success' ? 'bg-success-100 dark:bg-success-900/30' :
          status === 'error' ? 'bg-danger-100 dark:bg-danger-900/30' :
          'bg-warning-100 dark:bg-warning-900/30'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="text-success-600" size={32} />
          ) : status === 'error' ? (
            <AlertTriangle className="text-danger-600" size={32} />
          ) : (
            <RefreshCw className="text-warning-600" size={32} />
          )}
        </div>

        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
          {status === 'success' ? 'Reset Complete!' :
           status === 'error' ? 'Reset Failed' :
           'Reset App Data'}
        </h1>

        <p className="text-dark-600 dark:text-dark-400 mb-6">
          {status === 'idle' && 'This will clear all stored data (login info, preferences) and reset the app to defaults.'}
          {status === 'clearing' && 'Clearing app data...'}
          {status === 'success' && 'App data cleared. Redirecting to home...'}
          {status === 'error' && 'Failed to clear data. Please try refreshing the page manually.'}
        </p>

        {status === 'idle' && (
          <div className="space-y-3">
            <Button onClick={handleReset} variant="danger" fullWidth>
              <RefreshCw size={20} />
              Reset Everything
            </Button>
            <Button onClick={() => window.history.back()} variant="outline" fullWidth>
              Cancel
            </Button>
          </div>
        )}

        {status === 'clearing' && (
          <div className="flex items-center justify-center gap-2 text-dark-600">
            <RefreshCw className="animate-spin" size={20} />
            <span>Processing...</span>
          </div>
        )}

        {status === 'error' && (
          <Button onClick={() => window.location.reload()} variant="primary" fullWidth>
            Refresh Page
          </Button>
        )}
      </div>
    </div>
  )
}
