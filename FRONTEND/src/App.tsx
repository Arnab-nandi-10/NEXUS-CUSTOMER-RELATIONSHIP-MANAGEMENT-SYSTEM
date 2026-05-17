import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import { validateAuthStorage, checkRedirectLoop } from './lib/storage'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import OAuthCallback from './pages/OAuthCallback'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import MyClients from './pages/MyClients'
import Analytics from './pages/Analytics'
import Activity from './pages/Activity'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import ResetPage from './pages/ResetPage'
import Team from './pages/Team'
import Tasks from './pages/Tasks'
import Reminders from './pages/Reminders'

// Components
import DashboardLayout from './components/layout/DashboardLayout'
import RoleGuard from './components/RoleGuard'

function App() {
  // Validate storage on mount
  useEffect(() => {
    validateAuthStorage()
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Admin only */}
          <Route path="customers" element={<RoleGuard allowedRoles={['admin']}><Customers /></RoleGuard>} />
          <Route path="team" element={<RoleGuard allowedRoles={['admin']}><Team /></RoleGuard>} />
          <Route path="analytics" element={<RoleGuard allowedRoles={['admin']}><Analytics /></RoleGuard>} />

          {/* Sales & Support — assigned clients */}
          <Route path="my-clients" element={<RoleGuard allowedRoles={['sales', 'support']}><MyClients /></RoleGuard>} />

          {/* All roles */}
          <Route path="tasks" element={<Tasks />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        
        {/* Reset/Debug route */}
        <Route path="/reset" element={<ResetPage />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  
  // Check for redirect loops
  useEffect(() => {
    if (!isAuthenticated) {
      checkRedirectLoop()
    }
  }, [isAuthenticated])
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Ensure user data exists
  if (!user) {
    console.error('User authenticated but no user data found')
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default App
