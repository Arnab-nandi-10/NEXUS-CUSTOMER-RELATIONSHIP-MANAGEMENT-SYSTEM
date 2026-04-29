import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, X, Building2, Mail, Phone, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { clientAPI } from '@/lib/api'
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
  isDeleted?: boolean
  assignedTo?: { _id: string; fullname: string; email: string }
  createdBy?: { _id: string; fullname: string }
}

export default function Customers() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullname: '', companyName: '', email: '', phone: '', address: '', notes: '', leadStatus: 'New' })

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const res = await clientAPI.getAll(page)
      const d = res.data
      setClients(d?.clients || d?.allClients || [])
      setTotalPages(d?.totalPages || 1)
      setTotalClients(d?.totalClients || d?.clients?.length || 0)
    } catch {
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { loadClients() }, [loadClients])

  const resetForm = () => {
    setForm({ fullname: '', companyName: '', email: '', phone: '', address: '', notes: '', leadStatus: 'New' })
    setEditingClient(null)
    setError('')
  }

  const openCreate = () => { resetForm(); setShowModal(true) }
  const openEdit = (c: Client) => {
    setForm({ fullname: c.fullname, companyName: c.companyName || '', email: c.email, phone: c.phone || '', address: c.address || '', notes: c.notes || '', leadStatus: c.leadStatus })
    setEditingClient(c)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editingClient) {
        await clientAPI.update(editingClient._id, form)
      } else {
        await clientAPI.create(form)
      }
      setShowModal(false)
      resetForm()
      loadClients()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      await clientAPI.delete(id)
      loadClients()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleLeadChange = async (id: string, status: string) => {
    try {
      await clientAPI.updateLead(id, status)
      loadClients()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed')
    }
  }

  const filtered = (clients || []).filter(c =>
    !search || (
      (c?.fullname || '').toLowerCase().includes(search.toLowerCase()) ||
      (c?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c?.companyName || '').toLowerCase().includes(search.toLowerCase())
    )
  )

  const statusColor = (s: string) => {
    const m: Record<string, string> = { 'New': 'info', 'In Progress': 'warning', 'Converted': 'success', 'Lost': 'danger' }
    return (m[s] || 'default') as any
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50">Clients</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{totalClients} total clients</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 shrink-0">
          <Plus size={18} /> Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text" placeholder="Search clients..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="p-12 text-center card">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-dark-500">Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center card">
          <Building2 className="mx-auto text-dark-300 dark:text-dark-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-dark-700 dark:text-dark-300 mb-2">
            {search ? 'No results found' : 'No clients yet'}
          </h3>
          <p className="text-dark-500 mb-4">{search ? 'Try a different search term.' : 'Add your first client to get started.'}</p>
          {!search && <Button onClick={openCreate}><Plus size={18} className="mr-2" /> Add Client</Button>}
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
                  <th className="text-right p-4 text-sm font-medium text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id} className="border-b border-dark-100 dark:border-dark-800/50 hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="p-4 font-medium text-dark-900 dark:text-dark-50">{c.fullname || 'N/A'}</td>
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
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setShowDetail(c)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 transition"><Eye size={16} /></button>
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 transition"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950 text-danger-600 transition"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(c => (
              <div key={c._id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-dark-900 dark:text-dark-50">{c.fullname || 'N/A'}</p>
                    {c.companyName && <p className="text-sm text-dark-500 flex items-center gap-1 mt-0.5"><Building2 size={12} />{c.companyName}</p>}
                  </div>
                  <select value={c.leadStatus} onChange={e => handleLeadChange(c._id, e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-700 dark:text-dark-300">
                    <option>New</option><option>In Progress</option><option>Converted</option><option>Lost</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-dark-500">
                  <span className="flex items-center gap-1"><Mail size={12} />{c.email || 'N/A'}</span>
                  {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dark-100 dark:border-dark-800">
                  <span className="text-xs text-dark-400">{formatDate(c.createdAt)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setShowDetail(c)} className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"><Eye size={14} /></button>
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded hover:bg-danger-50 dark:hover:bg-danger-950 text-danger-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-dark-600 dark:text-dark-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="bg-white dark:bg-dark-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-800">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 rounded-lg text-sm text-danger-700 dark:text-danger-400">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name *</label>
                <input required value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Company Name</label>
                <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Lead Status</label>
                <select value={form.leadStatus} onChange={e => setForm({...form, leadStatus: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>New</option><option>In Progress</option><option>Converted</option><option>Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm() }}>Cancel</Button>
                <Button type="submit" className="flex-1">{editingClient ? 'Update Client' : 'Add Client'}</Button>
              </div>
            </form>
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
                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-400 uppercase">Added On</p>
                  <p className="text-dark-700 dark:text-dark-300 text-sm">{formatDate(showDetail.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dark-200 dark:border-dark-800">
                <Button variant="outline" className="flex-1" onClick={() => { setShowDetail(null); openEdit(showDetail) }}>
                  <Edit2 size={16} className="mr-2" /> Edit
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => { setShowDetail(null); handleDelete(showDetail._id) }}>
                  <Trash2 size={16} className="mr-2" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
