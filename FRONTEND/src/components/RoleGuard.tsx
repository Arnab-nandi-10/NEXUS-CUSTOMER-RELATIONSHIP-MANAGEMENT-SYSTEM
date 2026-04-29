import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: string
}

/**
 * Restricts access to specific user roles.
 * Redirects to fallback route if current user role is not allowed.
 */
export default function RoleGuard({ children, allowedRoles, fallback = '/app/dashboard' }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
