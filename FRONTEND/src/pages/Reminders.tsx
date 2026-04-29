import { useState, useEffect, useCallback } from 'react'
import { Bell, Plus, Clock, CheckCircle, Trash2, ChevronLeft, ChevronRight, Mail, MessageSquare } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { reminderAPI, clientAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

interface Reminder {
  _id: string
  channel: 'Email' | 'SMS'
  subject?: string
  message: string
  remindAt: string
  status: 'PENDING' | 'SENT'
  clientId?: { _id: string; fullname: string; companyName?: string; email?: string }
  createdBy?: { _id: string; fullname: string }
  createdAt?: string
}

interface SimpleClient {
  _id: string
  fullname: string
  companyName: string
  email: string
}

export default function Reminders() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [clients, setClients] = useState<SimpleClient[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ clientId: '', channel: 'Email' as string, subject: '', message: '', remindAt: '' })

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true)
      const res = isAdmin
        ? await reminderAPI.getAll(page, statusFilter || undefined)
        : await reminderAPI.getMine(page, statusFilter || undefined)
      setReminders(res.data?.reminders || [])
      setTotalPages(res.data?.totalPages || 1)
    } catch { setReminders([]) }
    finally { setLoading(false) }
  }, [page, statusFilter, isAdmin])

  useEffect(() => { loadReminders() }, [loadReminders])

  const loadClients = async () => {
    try {
      const res = isAdmin
        ? await clientAPI.getAll(1)
        : await clientAPI.getAssigned(1)
      setClients(res.data?.clients || res.data?.allClients || [])
    } catch { setClients([]) }
  }

  const openCreate = () => {
    setForm({ clientId: '', channel: 'Email', subject: '', message: '', remindAt: '' })
    setError('')
    loadClients()
    setShowModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.clientId) { setError('Please select a client'); return }
    if (!form.message) { setError('Message is required'); return }
    if (!form.remindAt) { setError('Reminder date/time is required'); return }
    if (form.channel === 'Email' && !form.subject) { setError('Subject is required for email'); return }
    try {
      await reminderAPI.create(form)
      setShowModal(false)
      loadReminders()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reminder')
    }
  }

  const handleMarkSent = async (id: string) => {
    try {
      await reminderAPI.markSent(id)
      loadReminders()
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return
    try {
      await reminderAPI.delete(id)
      loadReminders()
    } catch {}
  }

  const isPast = (dateStr: string) => new Date(dateStr) < new Date()

  if (loading && reminders.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-3 text-dark-500">Loading reminders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
            <Bell size={28} /> {isAdmin ? 'All Reminders' : 'My Reminders'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Schedule follow-up reminders</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 shrink-0">
          <Plus size={18} /> New Reminder
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-1 bg-dark-100 dark:bg-dark-800 rounded-lg w-fit">
        {['', 'PENDING', 'SENT'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              statusFilter === s ? 'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 shadow-sm' : 'text-dark-500 hover:text-dark-700'
            }`}>
            {s === '' ? 'All' : s === 'PENDING' ? 'Pending' : 'Sent'}
          </button>
        ))}
      </div>

      {/* Reminder List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell className="mx-auto text-dark-300 dark:text-dark-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-dark-700 dark:text-dark-300 mb-2">No reminders</h3>
            <p className="text-dark-500">Schedule a reminder to follow up with a client.</p>
          </div>
        ) : (
          reminders.map(r => (
            <div key={r._id} className={`card p-4 flex items-start gap-4 hover:shadow-md transition-all ${
              r.status === 'PENDING' && isPast(r.remindAt) ? 'border-l-4 border-amber-500' : ''
            }`}>
              <div className="mt-1 shrink-0">
                {r.channel === 'Email'
                  ? <Mail size={20} className="text-blue-500" />
                  : <MessageSquare size={20} className="text-emerald-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    {r.subject && <p className="font-medium text-sm text-dark-900 dark:text-dark-50">{r.subject}</p>}
                    <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">{r.message}</p>
                  </div>
                  <Badge variant={r.status === 'SENT' ? 'success' : 'warning'} className="text-xs shrink-0">
                    {r.status === 'SENT' ? 'Sent' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-dark-500">
                  {r.clientId && <span>To: <span className="text-dark-700 dark:text-dark-300">{r.clientId.fullname}</span></span>}
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatDate(r.remindAt)}
                    {r.status === 'PENDING' && isPast(r.remindAt) && <span className="text-amber-600 font-medium ml-1">Overdue!</span>}
                  </span>
                  {isAdmin && r.createdBy && <span>By: {r.createdBy.fullname}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {r.status === 'PENDING' && (
                  <button onClick={() => handleMarkSent(r._id)} title="Mark as Sent"
                    className="p-1.5 rounded-lg hover:bg-success-50 dark:hover:bg-success-950 transition-colors text-dark-400 hover:text-success-600">
                    <CheckCircle size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(r._id)} title="Delete"
                  className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors text-dark-400 hover:text-danger-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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

      {/* Create Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-dark-200 dark:border-dark-800">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4">New Reminder</h2>
              {error && <div className="p-3 mb-4 bg-danger-50 dark:bg-danger-950 rounded-lg text-sm text-danger-700 dark:text-danger-400">{error}</div>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Client *</label>
                  <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.fullname} - {c.companyName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Channel</label>
                    <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Remind At *</label>
                    <input type="datetime-local" value={form.remindAt} onChange={e => setForm({ ...form, remindAt: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                </div>
                {form.channel === 'Email' && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Subject *</label>
                    <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Follow-up email" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Reminder message..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">Create Reminder</Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
