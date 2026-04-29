import { useState, useEffect } from 'react'
import {
  Users, UserPlus, TrendingUp, Clock, Plus, ArrowRight,
  Building2, Mail, CheckCircle, AlertTriangle, ListTodo, Bell, Shield, Headphones, Briefcase
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { dashboardAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

interface Client {
  _id: string
  fullname: string
  companyName: string
  email: string
  phone: string
  leadStatus: string
  createdAt: string
  assignedTo?: { fullname: string }
  createdBy?: { fullname: string }
}

interface TaskItem {
  _id: string
  title: string
  status: string
  priority: string
  dueDate?: string
  clientId?: { fullname: string; companyName?: string }
  assignedTo?: { fullname: string }
}

// ────────────────────────────────────────────────────
// Role-aware Dashboard
// ────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore()
  const role = user?.role || 'support'

  if (role === 'admin') return <AdminDashboard />
  if (role === 'sales') return <SalesDashboard />
  return <SupportDashboard />
}

// ════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════
function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardAPI.getAdmin()
        setData(res.data)
      } catch { /* fallback below */ }
      finally { setLoading(false) }
    })()
  }, [])

  const s = data?.stats
  const clients = s?.clients || { total: 0, active: 0 }
  const users = s?.users || { total: 0, sales: 0, support: 0 }
  const tasks = s?.tasks || { total: 0, pending: 0, completed: 0, overdue: 0 }
  const reminders = s?.reminders || { total: 0, pending: 0 }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50 flex items-center gap-3">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mt-2">
            <Badge variant="danger" className="text-xs mr-2"><Shield size={12} className="mr-1" /> Admin</Badge>
            Full system overview
          </p>
        </div>
        <Button onClick={() => navigate('/app/customers')} className="flex items-center gap-2 shrink-0 shadow-lg">
          <Plus size={18} /> Add Client
        </Button>
      </div>

      {loading ? <DashboardSkeleton /> : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label="Total Clients" value={clients.total} accent="primary" tag={`${clients.active} active`} />
            <StatCard icon={<Briefcase />} label="Team Members" value={users.total} accent="blue" tag={`${users.sales}S / ${users.support}Sup`} />
            <StatCard icon={<ListTodo />} label="Tasks" value={tasks.total} accent="amber" tag={`${tasks.pending} pending`} />
            <StatCard icon={<Bell />} label="Reminders" value={reminders.total} accent="emerald" tag={`${reminders.pending} pending`} />
          </div>

          {/* Overdue & Lead Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Breakdown */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Lead Pipeline</h2>
              <div className="space-y-3">
                {(data?.leadBreakdown || []).map((item: any) => {
                  const pct = clients.total > 0 ? Math.round((item.count / clients.total) * 100) : 0
                  const colorMap: Record<string, string> = { 'New': 'bg-blue-500', 'In Progress': 'bg-amber-500', 'Converted': 'bg-emerald-500', 'Lost': 'bg-red-500' }
                  return (
                    <div key={item._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-700 dark:text-dark-300">{item._id}</span>
                        <span className="text-dark-500">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colorMap[item._id] || 'bg-dark-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-500" /> Overdue Tasks
                </h2>
                <Badge variant="warning">{tasks.overdue}</Badge>
              </div>
              {(data?.overdueTasks || []).length === 0 ? (
                <p className="text-dark-500 text-sm py-4 text-center">No overdue tasks — great job!</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(data?.overdueTasks || []).slice(0, 6).map((t: TaskItem) => (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">{t.title}</p>
                        <p className="text-xs text-dark-500">{t.clientId?.fullname} · Due {t.dueDate ? formatDate(t.dueDate) : 'N/A'}</p>
                      </div>
                      <Badge variant="danger" className="text-xs shrink-0">{t.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Clients */}
          <RecentClientsList clients={data?.recentClients || []} loading={false} onViewAll={() => navigate('/app/customers')} />

          {/* Recent Tasks */}
          <RecentTasksList tasks={data?.recentTasks || []} onViewAll={() => navigate('/app/tasks')} />
        </>
      )}
    </div>
  )
}


// ════════════════════════════════════════════════════
// SALES DASHBOARD
// ════════════════════════════════════════════════════
function SalesDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try { const res = await dashboardAPI.getSales(); setData(res.data) }
      catch { /* handled */ }
      finally { setLoading(false) }
    })()
  }, [])

  const s = data?.stats
  const clients = s?.clients || { total: 0, newLeads: 0, inProgress: 0, converted: 0 }
  const tasks = s?.tasks || { total: 0, pending: 0, completed: 0, overdue: 0 }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50">
          Hey, {user?.name?.split(' ')[0] || 'Sales'}! 👋
        </h1>
        <p className="text-dark-600 dark:text-dark-400 mt-2">
          <Badge variant="info" className="text-xs mr-2"><Briefcase size={12} className="mr-1" /> Sales</Badge>
          Your pipeline at a glance
        </p>
      </div>

      {loading ? <DashboardSkeleton /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label="My Clients" value={clients.total} accent="primary" />
            <StatCard icon={<UserPlus />} label="New Leads" value={clients.newLeads} accent="blue" />
            <StatCard icon={<Clock />} label="In Progress" value={clients.inProgress} accent="amber" />
            <StatCard icon={<TrendingUp />} label="Converted" value={clients.converted} accent="emerald" tag={clients.total > 0 ? `${((clients.converted / clients.total) * 100).toFixed(0)}%` : '0%'} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniStat label="Tasks Pending" value={tasks.pending} icon={<ListTodo size={18} />} color="text-amber-600" />
            <MiniStat label="Tasks Completed" value={tasks.completed} icon={<CheckCircle size={18} />} color="text-emerald-600" />
            <MiniStat label="Pending Reminders" value={s?.pendingReminders || 0} icon={<Bell size={18} />} color="text-blue-600" />
          </div>

          {/* Overdue warning */}
          {tasks.overdue > 0 && (
            <div className="card p-4 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={22} />
              <div>
                <p className="font-medium text-dark-900 dark:text-dark-50">You have {tasks.overdue} overdue task{tasks.overdue > 1 ? 's' : ''}</p>
                <p className="text-sm text-dark-500">Check your tasks to stay on track.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/app/tasks')} className="ml-auto shrink-0">View Tasks</Button>
            </div>
          )}

          <RecentClientsList clients={data?.recentClients || []} loading={false} onViewAll={() => navigate('/app/my-clients')} />
          <RecentTasksList tasks={data?.upcomingTasks || []} onViewAll={() => navigate('/app/tasks')} title="Upcoming Tasks" />
        </>
      )}
    </div>
  )
}


// ════════════════════════════════════════════════════
// SUPPORT DASHBOARD
// ════════════════════════════════════════════════════
function SupportDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try { const res = await dashboardAPI.getSupport(); setData(res.data) }
      catch { /* handled */ }
      finally { setLoading(false) }
    })()
  }, [])

  const s = data?.stats
  const tasks = s?.tasks || { total: 0, pending: 0, completed: 0 }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50">
          Hey, {user?.name?.split(' ')[0] || 'Support'}! 👋
        </h1>
        <p className="text-dark-600 dark:text-dark-400 mt-2">
          <Badge variant="success" className="text-xs mr-2"><Headphones size={12} className="mr-1" /> Support</Badge>
          Your support overview
        </p>
      </div>

      {loading ? <DashboardSkeleton /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label="My Clients" value={s?.clients || 0} accent="primary" />
            <StatCard icon={<ListTodo />} label="Tasks" value={tasks.total} accent="blue" />
            <StatCard icon={<CheckCircle />} label="Completed" value={tasks.completed} accent="emerald" />
            <StatCard icon={<Bell />} label="Pending Reminders" value={s?.pendingReminders || 0} accent="amber" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="Communications Sent" value={s?.communications || 0} icon={<Mail size={18} />} color="text-primary-600" />
            <MiniStat label="Tasks Pending" value={tasks.pending} icon={<Clock size={18} />} color="text-amber-600" />
          </div>

          <RecentClientsList clients={data?.recentClients || []} loading={false} onViewAll={() => navigate('/app/my-clients')} />
          <RecentTasksList tasks={data?.upcomingTasks || []} onViewAll={() => navigate('/app/tasks')} title="Upcoming Tasks" />
        </>
      )}
    </div>
  )
}


// ════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card p-6 h-32 animate-pulse bg-dark-100 dark:bg-dark-800 rounded-xl" />)}
      </div>
      <div className="card p-6 h-64 animate-pulse bg-dark-100 dark:bg-dark-800 rounded-xl" />
    </div>
  )
}

function StatCard({ icon, label, value, accent, tag }: { icon: React.ReactNode; label: string; value: number; accent: string; tag?: string }) {
  const gradients: Record<string, string> = {
    primary: 'from-primary-500 to-primary-600',
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }
  const borders: Record<string, string> = {
    primary: 'border-primary-500',
    blue: 'border-blue-500',
    amber: 'border-amber-500',
    emerald: 'border-emerald-500',
  }
  return (
    <div className={`card p-5 hover:shadow-lg transition-all border-l-4 ${borders[accent] || 'border-primary-500'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[accent] || gradients.primary} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {tag && <span className={`text-xs font-medium text-${accent}-600 bg-${accent}-50 dark:bg-${accent}-900/20 px-2 py-0.5 rounded-full`}>{tag}</span>}
      </div>
      <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">{value}</p>
      <p className="text-xs text-dark-500 dark:text-dark-400 font-medium mt-1">{label}</p>
    </div>
  )
}

function MiniStat({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`${color} shrink-0`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-dark-900 dark:text-dark-50">{value}</p>
        <p className="text-xs text-dark-500">{label}</p>
      </div>
    </div>
  )
}

function RecentClientsList({ clients, onViewAll }: { clients: Client[]; loading?: boolean; onViewAll: () => void }) {
  const statusColor = (s: string) => {
    const m: Record<string, string> = { 'New': 'info', 'In Progress': 'warning', 'Converted': 'success', 'Lost': 'danger' }
    return (m[s] || 'default') as any
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-dark-200 dark:border-dark-700">
        <h2 className="text-lg font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
          <Building2 size={20} className="text-primary-600" /> Recent Clients
        </h2>
        <Button variant="outline" size="sm" onClick={onViewAll} className="flex items-center gap-1.5">View All <ArrowRight size={14} /></Button>
      </div>
      {clients.length === 0 ? (
        <div className="p-8 text-center text-dark-500 text-sm">No clients yet</div>
      ) : (
        <div className="divide-y divide-dark-100 dark:divide-dark-800">
          {clients.slice(0, 5).map((c: Client) => (
            <div key={c._id} className="px-5 py-3 flex items-center justify-between hover:bg-dark-50 dark:hover:bg-dark-900/30 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(c.fullname || 'N')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-dark-900 dark:text-dark-50 text-sm truncate">{c.fullname}</p>
                  <p className="text-xs text-dark-500">{c.companyName || c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={statusColor(c.leadStatus)} className="text-xs">{c.leadStatus}</Badge>
                <span className="text-xs text-dark-400 hidden sm:block">{formatDate(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecentTasksList({ tasks, onViewAll, title = 'Recent Tasks' }: { tasks: TaskItem[]; onViewAll: () => void; title?: string }) {
  const priorityColor = (p: string) => {
    const m: Record<string, string> = { 'High': 'danger', 'Medium': 'warning', 'Low': 'info' }
    return (m[p] || 'default') as any
  }

  if (tasks.length === 0) return null

  return (
    <div className="card overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-dark-200 dark:border-dark-700">
        <h2 className="text-lg font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
          <ListTodo size={20} className="text-amber-600" /> {title}
        </h2>
        <Button variant="outline" size="sm" onClick={onViewAll} className="flex items-center gap-1.5">View All <ArrowRight size={14} /></Button>
      </div>
      <div className="divide-y divide-dark-100 dark:divide-dark-800">
        {tasks.slice(0, 5).map((t: TaskItem) => (
          <div key={t._id} className="px-5 py-3 flex items-center justify-between hover:bg-dark-50 dark:hover:bg-dark-900/30 transition-all">
            <div className="min-w-0">
              <p className="font-medium text-dark-900 dark:text-dark-50 text-sm truncate">{t.title}</p>
              <p className="text-xs text-dark-500">{t.clientId?.fullname || 'No client'}{t.dueDate ? ` · Due ${formatDate(t.dueDate)}` : ''}</p>
            </div>
            <Badge variant={priorityColor(t.priority)} className="text-xs shrink-0">{t.priority}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
