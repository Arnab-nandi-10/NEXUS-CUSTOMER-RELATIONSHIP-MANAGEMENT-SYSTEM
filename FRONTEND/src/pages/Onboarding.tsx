import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: `Welcome, ${user?.name?.split(' ')[0] || 'there'}!`,
      desc: 'Your Nexus CRM account is ready. Let us show you around.',
      content: (
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
            <Zap className="text-primary-600" size={40} />
          </div>
          <p className="text-dark-600 dark:text-dark-400 max-w-md mx-auto">
            Nexus CRM helps you manage your clients, track leads, and grow your business. Everything you need in one place.
          </p>
        </div>
      )
    },
    {
      title: 'Manage Your Clients',
      desc: 'Add, edit, and track all your clients from the Customers page.',
      content: (
        <div className="space-y-3">
          {['Add new clients with contact details', 'Track lead status (New, In Progress, Converted)', 'Edit client information anytime', 'Search and filter your client list'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-lg">
              <CheckCircle className="text-emerald-500 shrink-0" size={20} />
              <p className="text-dark-700 dark:text-dark-300 text-sm">{item}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Track Performance',
      desc: 'View analytics and activity to understand your CRM at a glance.',
      content: (
        <div className="space-y-3">
          {['Dashboard with real-time stats', 'Analytics with charts and conversion rates', 'Activity feed showing recent changes', 'Manage your profile in Settings'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-lg">
              <CheckCircle className="text-primary-500 shrink-0" size={20} />
              <p className="text-dark-700 dark:text-dark-300 text-sm">{item}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'You are all set!',
      desc: 'Start adding clients and growing your business.',
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <p className="text-dark-600 dark:text-dark-400 max-w-md mx-auto">
            Your CRM is ready to use. Head to the dashboard to get started!
          </p>
        </div>
      )
    }
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary-600' : 'bg-dark-200 dark:bg-dark-800'}`} />
          ))}
        </div>

        <div className="card p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">{current.title}</h1>
            <p className="text-dark-500 mt-2">{current.desc}</p>
          </div>

          <div className="py-4">{current.content}</div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            <Button className="flex-1 flex items-center justify-center gap-2"
              onClick={() => isLast ? navigate('/app/dashboard') : setStep(s => s + 1)}>
              {isLast ? 'Go to Dashboard' : 'Continue'} <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Skip */}
        {!isLast && (
          <button onClick={() => navigate('/app/dashboard')}
            className="block mx-auto mt-4 text-sm text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors">
            Skip onboarding
          </button>
        )}
      </div>
    </div>
  )
}
