import { Bell, Search, Moon, Sun, HelpCircle, LogOut, User as UserIcon, ChevronDown, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import Avatar from '@/components/ui/Avatar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between px-4 md:px-6">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors lg:hidden"
      >
        <Menu size={24} className="text-dark-600 dark:text-dark-400" />
      </button>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-600" size={20} />
          <input
            type="text"
            placeholder="Search customers, deals, activities..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-dark-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 placeholder:text-dark-400 dark:placeholder:text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun size={20} className="text-dark-400" />
          ) : (
            <Moon size={20} className="text-dark-600" />
          )}
        </button>

        {/* Help - Hidden on mobile */}
        <button
          className="hidden sm:block p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={20} className="text-dark-600 dark:text-dark-400" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-dark-600 dark:text-dark-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-dark-200 dark:bg-dark-800"></div>

        {/* User Profile with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg p-2 transition-colors"
          >
            <Avatar src={user?.avatar} alt={user?.name || 'User'} size="md" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{user?.name}</p>
              <p className="text-xs text-dark-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={16} className="hidden md:block text-dark-600 dark:text-dark-400" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-900 rounded-xl shadow-soft-xl border border-dark-200 dark:border-dark-800 py-2 z-50">
                <div className="px-4 py-3 border-b border-dark-200 dark:border-dark-800">
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{user?.name}</p>
                  <p className="text-xs text-dark-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate('/app/settings')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                >
                  <UserIcon size={16} />
                  <span>Profile Settings</span>
                </button>
                
                <div className="border-t border-dark-200 dark:border-dark-800 my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
