import { useState, useEffect, useCallback } from 'react'
import { Search, Building2, Mail, Phone, MapPin, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { clientAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

interface Client {
  _id: string
  fullname: string
  companyName: string
  email: string
  phone: string
  address: string
  notes: string
  leadStatus: string
  createdAt: string
  assignedTo?: { _id: string; fullname: string; email: string }
}

export default function MyClients() {
  const { user } = useAuthStore()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDetail, setShowDetail] = useState<Client | null>(null)

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      if (search || statusFilter) {
        const res = await clientAPI.search({ q: search || undefined, leadStatus: statusFilter || undefined, assignedTo: user?.id, page })
        setClients(res.data?.clients || [])
        setTotalPages(res.data?.totalPages || 1)
        setTotal(res.data?.totalClients || 0)
      } else {
        const res = await clientAPI.getAssigned(page)
        const d = res.data
        setClients(d?.clients || d?.allClients || [])
        setTotalPages(d?.totalPages || 1)
        setTotal(d?.totalClients || d?.clients?.length || 0)
      }
    } catch { setClients([]) }
    finally { setLoading(false) }
  }, [page, search, statusFilter, user?.id])

  useEffect(() => { loadClients() }, [loadClients])

  const handleLeadChange = async (id: string, status: string) => {
    try {
      await clientAPI.updateLead(id, status)
      loadClients()
    } catch (err: any) { alert(err.response?.data?.message || 'Update failed') }
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { 'New': 'info', 'In Progress': 'warning', 'Converted': 'success', 'Lost': 'danger' }
    return (m[s] || 'default') as any
  }

  const filtered = clients

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50">My Clients</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">{total} clients assigned to you</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input type="text" placeholder="Search by name, email, company..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" />
        </div>
        <div className="flex gap-1 p-1 bg-dark-100 dark:bg-dark-800 rounded-lg">
          {['', 'New', 'In Progress', 'Converted', 'Lost'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 shadow-sm' : 'text-dark-500 hover:text-dark-700'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center card">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-dark-500">Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center card">
          <Building2 className="mx-auto text-dark-300 dark:text-dark-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-dark-700 dark:text-dark-300 mb-2">
            {search || statusFilter ? 'No results found' : 'No clients assigned'}
          </h3>
          <p className="text-dark-500">{search || statusFilter ? 'Try different search criteria.' : 'Clients assigned to you will appear here.'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-800">
                  <th className="text-left p-4 text-sm font-medium text-dark-500">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-500">Company</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-500">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-500">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-500">Added</th>
                  <th className="text-right p-4 text-sm font-medium text-dark-500">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id} className="border-b border-dark-100 dark:border-dark-800/50 hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                          {(c.fullname || 'N')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-dark-900 dark:text-dark-50">{c.fullname || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-dark-600 dark:text-dark-400">{c.companyName || '\u2014'}</td>
                    <td className="p-4 text-sm text-dark-500">{c.email || 'N/A'}</td>
                    <td className="p-4 text-sm text-dark-500">{c.phone || '\u2014'}</td>
                    <td className="p-4">
                      <select value={c.leadStatus} onChange={e => handleLeadChange(c._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-700 dark:text-dark-300 cursor-pointer">
                        <option>New</option><option>In Progress</option><option>Converted</option><option>Lost</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-dark-500">{formatDate(c.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setShowDetail(c)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 transition">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(c => (
              <div key={c._id} className="card p-4 space-y-3" onClick={() => setShowDetail(c)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                      {(c.fullname || 'N')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-dark-900 dark:text-dark-50">{c.fullname || 'N/A'}</p>
                      {c.companyName && <p className="text-xs text-dark-500 flex items-center gap-1"><Building2 size={10} />{c.companyName}</p>}
                    </div>
                  </div>
                  <Badge variant={statusColor(c.leadStatus)}>{c.leadStatus}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-dark-500">
                  <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>
                  {c.phone && <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(null)}>
          <div className="bg-white dark:bg-dark-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-800">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50">Client Details</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xl">
                  {showDetail.fullname.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">{showDetail.fullname}</h3>
                  {showDetail.companyName && <p className="text-dark-500 flex items-center gap-1"><Building2 size={14} />{showDetail.companyName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-dark-200 dark:border-dark-800">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-400 uppercase">Email</p>
                  <p className="text-dark-900 dark:text-dark-50 flex items-center gap-2"><Mail size={14} />{showDetail.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-400 uppercase">Phone</p>
                  <p className="text-dark-900 dark:text-dark-50 flex items-center gap-2"><Phone size={14} />{showDetail.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-400 uppercase">Address</p>
                  <p className="text-dark-900 dark:text-dark-50 flex items-center gap-2"><MapPin size={14} />{showDetail.address || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-400 uppercase">Lead Status</p>
                  <Badge variant={statusColor(showDetail.leadStatus)}>{showDetail.leadStatus}</Badge>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-medium text-dark-400 uppercase">Notes</p>
                  <p className="text-dark-700 dark:text-dark-300 text-sm">{showDetail.notes || 'No notes'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
