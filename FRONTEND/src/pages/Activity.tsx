import { useState, useEffect } from 'react'
import { Clock, UserPlus, Building2, TrendingUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { clientAPI } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

interface Client {
  _id: string
  fullname: string
  companyName: string
  leadStatus: string
  createdAt: string
  updatedAt: string
}

export default function Activity() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientAPI.getAll(1)
        const all = res.data?.clients || res.data?.allClients || []
        setClients(all.sort((a: Client, b: Client) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()))
      } catch { setClients([]) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const getIcon = (status: string) => {
    switch(status) {
      case 'New': return <UserPlus size={16} className="text-blue-500" />
      case 'In Progress': return <Clock size={16} className="text-amber-500" />
      case 'Converted': return <TrendingUp size={16} className="text-emerald-500" />
      default: return <Building2 size={16} className="text-dark-400" />
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-3 text-dark-500">Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50">Activity</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Recent changes and updates</p>
      </div>

      <div className="card">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-dark-300 dark:text-dark-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-dark-700 dark:text-dark-300 mb-2">No activity yet</h3>
            <p className="text-dark-500">Activity will appear here as you add and manage clients.</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-200 dark:divide-dark-800">
            {clients.map((client) => (
              <div key={client._id} className="p-4 md:p-5 flex items-start gap-4 hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center shrink-0">
                  {getIcon(client.leadStatus)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-medium text-dark-900 dark:text-dark-50 text-sm truncate">
                      Client <span className="text-primary-600">{client.fullname || 'Unknown'}</span>
                      {client.companyName && <span className="text-dark-400"> from {client.companyName}</span>}
                    </p>
                    <Badge variant={({'New':'info','In Progress':'warning','Converted':'success','Lost':'danger'}[client.leadStatus] || 'default') as any} className="text-xs shrink-0">
                      {client.leadStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-dark-400 mt-1">{formatDateTime(client.updatedAt || client.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
