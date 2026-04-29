import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-dark-50 dark:bg-dark-950">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="container-custom py-4 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
