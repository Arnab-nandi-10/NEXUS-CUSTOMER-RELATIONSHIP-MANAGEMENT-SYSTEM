import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean | null
type AnalyticsProperties = Record<string, AnalyticsValue>

const trackEvent = (name: string, properties?: AnalyticsProperties) => {
  try {
    track(name, properties)
  } catch {
    // Analytics must never interrupt the product flow.
  }
}

export const analyticsEvents = {
  loginSucceeded: (role: string) => {
    trackEvent('Login Succeeded', { role })
  },
  registrationCompleted: (role: string) => {
    trackEvent('Registration Completed', { role })
  },
  logoutCompleted: () => {
    trackEvent('Logout Completed')
  },
}
