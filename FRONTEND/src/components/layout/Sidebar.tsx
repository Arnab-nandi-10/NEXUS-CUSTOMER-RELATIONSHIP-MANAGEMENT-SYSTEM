import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Activity, 
  Settings,
  Zap,
  CheckSquare,
  Bell,
  UserCog,
  Briefcase,
  Headphones,
  Shield,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  roles: string[] // which roles can see this
}

const navigation: NavItem[] = [
  // ── Dashboard (everyone gets their own) ──
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'support'] },

  // ── Admin-only ──
  { name: 'All Clients', href: '/app/customers', icon: Users, roles: ['admin'] },
  { name: 'Team', href: '/app/team', icon: UserCog, roles: ['admin'] },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3, roles: ['admin'] },

  // ── Sales-specific ──
  { name: 'My Clients', href: '/app/my-clients', icon: Briefcase, roles: ['sales'] },

  // ── Support-specific ──
  { name: 'My Clients', href: '/app/my-clients', icon: Headphones, roles: ['support'] },

  // ── Shared pages ──
  { name: 'Tasks', href: '/app/tasks', icon: CheckSquare, roles: ['admin', 'sales', 'support'] },
  { name: 'Reminders', href: '/app/reminders', icon: Bell, roles: ['admin', 'sales', 'support'] },
  { name: 'Activity', href: '/app/activity', icon: Activity, roles: ['admin', 'sales', 'support'] },
  { name: 'Settings', href: '/app/settings', icon: Settings, roles: ['admin', 'sales', 'support'] },
]

const roleBadge: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  admin: { label: 'Admin', color: 'from-red-500 to-rose-600', icon: Shield },
  sales: { label: 'Sales', color: 'from-blue-500 to-indigo-600', icon: Briefcase },
  support: { label: 'Support', color: 'from-emerald-500 to-teal-600', icon: Headphones },
}

export default function Sidebar() {
  const { user } = useAuthStore()
  const userRole = user?.role || 'sales'
  const badge = roleBadge[userRole] || roleBadge.sales

  const visibleNav = navigation.filter(item => item.roles.includes(userRole))

  return (
    <aside className="hidden lg:flex w-64 bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-dark-200 dark:border-dark-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Zap className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold gradient-text">Nexus CRM</span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 pt-4 pb-2">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-semibold',
          `bg-gradient-to-r ${badge.color}`
        )}>
          <badge.icon size={14} />
          <span>{badge.label} Panel</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => (
          <NavLink
            key={item.href + item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'text-dark-700 dark:text-dark-300',
                'hover:bg-primary-50 dark:hover:bg-primary-950/50',
                'hover:text-primary-700 dark:hover:text-primary-400',
                isActive && 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-medium'
              )
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-dark-200 dark:border-dark-800">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
            <span className="text-xs font-medium text-dark-700 dark:text-dark-300">
              All Systems Operational
            </span>
          </div>
          <p className="text-xs text-dark-500">
            Logged in as {user?.name}
          </p>
        </div>
      </div>
    </aside>
  )
}
