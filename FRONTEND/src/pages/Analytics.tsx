import { useState, useEffect } from 'react'
import { Users, TrendingUp, UserCheck, Clock, Target, ArrowUpRight, ArrowDownRight, RefreshCw, Award, Zap, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { clientAPI } from '@/lib/api'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, CartesianGrid } from 'recharts'

interface Client {
  _id: string
  fullname: string
  companyName: string
  leadStatus: string
  createdAt: string
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year'

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  purple: '#8b5cf6',
  pink: '#ec4899'
}

const STATUS_COLORS = {
  'New': COLORS.info,
  'In Progress': COLORS.warning,
  'Converted': COLORS.success,
  'Lost': COLORS.danger
}

export default function Analytics() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<TimePeriod>('month')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await clientAPI.getAll(1)
      setClients(res.data?.clients || res.data?.allClients || [])
    } catch { setClients([]) }
    finally { setLoading(false) }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Calculate metrics
  const statusCounts = {
    'New': clients.filter(c => c.leadStatus === 'New').length,
    'In Progress': clients.filter(c => c.leadStatus === 'In Progress').length,
    'Converted': clients.filter(c => c.leadStatus === 'Converted').length,
    'Lost': clients.filter(c => c.leadStatus === 'Lost').length,
  }

  const totalClients = clients.length
  const conversionRate = totalClients > 0 ? ((statusCounts['Converted'] / totalClients) * 100) : 0
  const winRate = (statusCounts['Converted'] + statusCounts['Lost']) > 0 
    ? ((statusCounts['Converted'] / (statusCounts['Converted'] + statusCounts['Lost'])) * 100)
    : 0

  // Mock trend data (in production, compare with previous period)
  const trends = {
    clients: 12.5,
    conversion: 8.3,
    winRate: -2.1,
    revenue: 15.7
  }

  // Time-based data for charts
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayClients = clients.filter(c => {
        const clientDate = new Date(c.createdAt)
        return clientDate.toDateString() === date.toDateString()
      })
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        leads: dayClients.length,
        converted: dayClients.filter(c => c.leadStatus === 'Converted').length
      })
    }
    return days
  }

  const timelineData = getLast7Days()

  // Funnel data
  const funnelData = [
    { stage: 'Leads', count: totalClients, color: COLORS.info },
    { stage: 'Contacted', count: statusCounts['In Progress'] + statusCounts['Converted'] + statusCounts['Lost'], color: COLORS.warning },
    { stage: 'Qualified', count: statusCounts['Converted'] + statusCounts['Lost'], color: COLORS.purple },
    { stage: 'Converted', count: statusCounts['Converted'], color: COLORS.success }
  ]

  const pieData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-dark-500 font-medium">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-2">Track your sales performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 p-1 bg-dark-100 dark:bg-dark-800 rounded-lg">
            {(['week', 'month', 'quarter', 'year'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 shadow-sm' 
                    : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="text-white" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${trends.clients >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trends.clients >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(trends.clients)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">{totalClients}</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">Total Clients</p>
        </div>

        {/* Conversion Rate */}
        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="text-white" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${trends.conversion >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trends.conversion >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(trends.conversion)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">{conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">Conversion Rate</p>
        </div>

        {/* Win Rate */}
        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="text-white" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${trends.winRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trends.winRate >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(trends.winRate)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">{winRate.toFixed(1)}%</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">Win Rate</p>
        </div>

        {/* Active Leads */}
        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="text-white" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
              <Clock size={16} />
              Active
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">{statusCounts['New'] + statusCounts['In Progress']}</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">Active Leads</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Trends */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">Lead Activity</h2>
              <p className="text-sm text-dark-500 mt-1">Last 7 days performance</p>
            </div>
          </div>
          {timelineData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-dark-400">
              <AlertCircle size={48} className="mb-3 opacity-50" />
              <p>No data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="leads" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} name="Leads" />
                <Area type="monotone" dataKey="converted" stroke={COLORS.success} fillOpacity={1} fill="url(#colorConverted)" strokeWidth={2} name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline Distribution */}
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">Pipeline Status</h2>
            <p className="text-sm text-dark-500 mt-1">Current distribution</p>
          </div>
          {pieData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-dark-400">
              <AlertCircle size={48} className="mb-3 opacity-50" />
              <p>No data to display</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={85} 
                    paddingAngle={2} 
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 p-2 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name as keyof typeof STATUS_COLORS] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark-500 dark:text-dark-400">{d.name}</p>
                      <p className="text-sm font-semibold text-dark-900 dark:text-dark-50">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Funnel & Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">Sales Funnel</h2>
            <p className="text-sm text-dark-500 mt-1">Conversion pipeline stages</p>
          </div>
          <div className="space-y-3">
            {funnelData.map((stage) => {
              const percentage = totalClients > 0 ? (stage.count / totalClients) * 100 : 0
              return (
                <div key={stage.stage} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{stage.stage}</span>
                    <span className="text-sm font-semibold text-dark-900 dark:text-dark-50">{stage.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-12 bg-dark-100 dark:bg-dark-800 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-4 group-hover:opacity-90"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: stage.color,
                        minWidth: stage.count > 0 ? '40px' : '0'
                      }}
                    >
                      {stage.count > 0 && (
                        <span className="text-white font-semibold text-sm">{stage.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-900 dark:text-dark-50">Pipeline Health</p>
                <p className="text-xs text-dark-600 dark:text-dark-400">
                  {conversionRate > 30 ? 'Excellent' : conversionRate > 20 ? 'Good' : conversionRate > 10 ? 'Average' : 'Needs Improvement'} - 
                  {statusCounts['In Progress']} leads in progress
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers / Recent Activity */}
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">Recent Conversions</h2>
            <p className="text-sm text-dark-500 mt-1">Latest successful deals</p>
          </div>
          {clients.filter(c => c.leadStatus === 'Converted').length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-dark-400">
              <UserCheck size={48} className="mb-3 opacity-50" />
              <p className="font-medium mb-1">No conversions yet</p>
              <p className="text-sm">Your converted leads will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients
                .filter(c => c.leadStatus === 'Converted')
                .slice(0, 6)
                .map((c) => (
                  <div key={c._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-all group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        {(c.fullname || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-900 dark:text-dark-50 truncate">{c.fullname || 'Unknown'}</p>
                      <p className="text-sm text-dark-500 truncate">{c.companyName || 'No company'}</p>
                    </div>
                    <Badge variant="success" className="shrink-0">Won</Badge>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
