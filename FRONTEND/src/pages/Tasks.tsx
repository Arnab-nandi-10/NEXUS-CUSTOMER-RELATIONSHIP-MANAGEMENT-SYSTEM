import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, Plus, Clock, CheckCircle, AlertTriangle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { taskAPI, clientAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

interface Task {
  _id: string
  title: string
  description?: string
  status: 'Pending' | 'Completed'
  priority: 'Low' | 'Medium' | 'High'
  dueDate?: string
  clientId?: { _id: string; fullname: string; companyName: string }
  assignedTo?: { _id: string; fullname: string; email: string; avatar?: string }
  createdAt: string
}

interface SimpleClient {
  _id: string
  fullname: string
  companyName: string
}

export default function Tasks() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [clients, setClients] = useState<SimpleClient[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', clientId: '', priority: 'Medium', dueDate: '' })

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (statusFilter) filters.status = statusFilter
      if (priorityFilter) filters.priority = priorityFilter

      const res = isAdmin
        ? await taskAPI.getAll(page, filters)
        : await taskAPI.getMine(page, filters)

      setTasks(res.data?.tasks || [])
      setTotalPages(res.data?.totalPages || 1)
    } catch { setTasks([]) }
    finally { setLoading(false) }
  }, [page, statusFilter, priorityFilter, isAdmin])

  useEffect(() => { loadTasks() }, [loadTasks])

  const loadClients = async () => {
    try {
      const res = isAdmin
        ? await clientAPI.getAll(1)
        : await clientAPI.getAssigned(1)
      setClients(res.data?.clients || res.data?.allClients || [])
    } catch { setClients([]) }
  }

  const openCreate = () => {
    setForm({ title: '', description: '', clientId: '', priority: 'Medium', dueDate: '' })
    setError('')
    loadClients()
    setShowModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.clientId) { setError('Please select a client'); return }
    try {
      await taskAPI.create({
        ...form,
        dueDate: form.dueDate || undefined
      })
      setShowModal(false)
      loadTasks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task')
    }
  }

  const handleToggle = async (taskId: string) => {
    try {
      await taskAPI.toggleStatus(taskId)
      loadTasks()
    } catch {}
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await taskAPI.delete(taskId)
      loadTasks()
    } catch {}
  }

  const priorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'danger'
      case 'Medium': return 'warning'
      case 'Low': return 'info'
      default: return 'default'
    }
  }

  const isOverdue = (task: Task) => {
    return task.status === 'Pending' && task.dueDate && new Date(task.dueDate) < new Date()
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-3 text-dark-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
            <CheckSquare size={28} /> {isAdmin ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Manage and track your tasks</p>
        </div>
        {(isAdmin || user?.role === 'sales') && (
          <Button onClick={openCreate} className="flex items-center gap-2 shrink-0">
            <Plus size={18} /> New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 p-1 bg-dark-100 dark:bg-dark-800 rounded-lg">
          {['', 'Pending', 'Completed'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 shadow-sm' : 'text-dark-500 hover:text-dark-700'
              }`}>
              {s || 'All Status'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-dark-100 dark:bg-dark-800 rounded-lg">
          {['', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => { setPriorityFilter(p); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                priorityFilter === p ? 'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 shadow-sm' : 'text-dark-500 hover:text-dark-700'
              }`}>
              {p || 'All Priority'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckSquare className="mx-auto text-dark-300 dark:text-dark-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-dark-700 dark:text-dark-300 mb-2">No tasks found</h3>
            <p className="text-dark-500">Create a task to get started.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className={`card p-4 flex items-start gap-4 hover:shadow-md transition-all ${isOverdue(task) ? 'border-l-4 border-danger-500' : ''}`}>
              {/* Toggle */}
              <button onClick={() => handleToggle(task._id)} className="mt-1 shrink-0">
                {task.status === 'Completed' ? (
                  <CheckCircle size={22} className="text-success-500" />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full border-2 border-dark-300 dark:border-dark-600 hover:border-primary-500 transition-colors" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className={`font-medium text-sm ${task.status === 'Completed' ? 'line-through text-dark-400' : 'text-dark-900 dark:text-dark-50'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={priorityColor(task.priority) as any} className="text-xs">{task.priority}</Badge>
                    {isOverdue(task) && (
                      <Badge variant="danger" className="text-xs flex items-center gap-1">
                        <AlertTriangle size={10} /> Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                {task.description && <p className="text-xs text-dark-500 mt-1 line-clamp-1">{task.description}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-dark-500">
                  {task.clientId && <span>Client: <span className="text-dark-700 dark:text-dark-300">{task.clientId.fullname}</span></span>}
                  {task.assignedTo && isAdmin && <span>Assigned: <span className="text-dark-700 dark:text-dark-300">{task.assignedTo.fullname}</span></span>}
                  {task.dueDate && <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(task.dueDate)}</span>}
                </div>
              </div>

              {/* Delete */}
              {(isAdmin || user?.role === 'sales') && (
                <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors text-dark-400 hover:text-danger-600 shrink-0">
                  <Trash2 size={16} />
                </button>
              )}
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

      {/* Create Task Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-dark-200 dark:border-dark-800">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4">New Task</h2>
              {error && <div className="p-3 mb-4 bg-danger-50 dark:bg-danger-950 rounded-lg text-sm text-danger-700 dark:text-danger-400">{error}</div>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Follow up with client..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2} placeholder="Optional details..." />
                </div>
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
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">Create Task</Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
