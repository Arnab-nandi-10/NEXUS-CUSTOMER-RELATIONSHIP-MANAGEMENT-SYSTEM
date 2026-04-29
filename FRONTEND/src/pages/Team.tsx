import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, UserCog, Shield, Briefcase, Headphones, ToggleLeft, ToggleRight, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { userAPI, authAPI } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface TeamUser {
  _id: string
  fullname: string
  email: string
  role: 'admin' | 'sales' | 'support'
  avatar?: string
  isActive: boolean
  createdAt: string
}

export default function Team() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const [form, setForm] = useState({ fullname: '', email: '', password: '', role: 'sales' as string })

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await userAPI.getAll(page)
      setUsers(res.data?.allUsers || [])
      setTotalPages(res.data?.totalPages || 1)
      setTotalUsers(res.data?.totalUsers || 0)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { loadUsers() }, [loadUsers])

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.fullname || !form.email || !form.password) { setError('All fields are required'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    try {
      await authAPI.registerUser(form.fullname, form.email, form.role, form.password)
      setSuccess('User created successfully!')
      setShowAddModal(false)
      setForm({ fullname: '', email: '', password: '', role: 'sales' })
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      await userAPI.toggleStatus(userId)
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle user status')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userAPI.updateRole(userId, newRole)
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role')
    }
  }

  const roleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={14} className="text-red-500" />
      case 'sales': return <Briefcase size={14} className="text-blue-500" />
      case 'support': return <Headphones size={14} className="text-emerald-500" />
      default: return null
    }
  }

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger'
      case 'sales': return 'info'
      case 'support': return 'success'
      default: return 'default'
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-3 text-dark-500">Loading team...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
            <UserCog size={28} /> Team Management
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{totalUsers} team members</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setError(''); setSuccess('') }} className="flex items-center gap-2 shrink-0">
          <Plus size={18} /> Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'sales', label: 'Sales' },
          { key: 'support', label: 'Support' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400'
                : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && <div className="p-3 bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 rounded-lg text-sm text-danger-700 dark:text-danger-400">{error}</div>}
      {success && <div className="p-3 bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800 rounded-lg text-sm text-success-700 dark:text-success-400">{success}</div>}

      {/* User List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200 dark:divide-dark-800">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} alt={u.fullname} size="md" />
                      <div>
                        <p className="font-medium text-dark-900 dark:text-dark-50 text-sm">{u.fullname}</p>
                        <p className="text-xs text-dark-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingUser?._id === u._id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        onBlur={() => setEditingUser(null)}
                        className="text-sm border border-dark-300 dark:border-dark-600 rounded-lg px-2 py-1 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100"
                        autoFocus
                      >
                        <option value="sales">Sales</option>
                        <option value="support">Support</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={roleBadgeVariant(u.role) as any} className="text-xs capitalize">
                          {roleIcon(u.role)} {u.role}
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isActive ? 'success' : 'danger'} className="text-xs">
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(u)}
                        title="Change Role"
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-dark-500 hover:text-primary-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        {u.isActive
                          ? <ToggleRight size={20} className="text-success-500" />
                          : <ToggleLeft size={20} className="text-dark-400" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-dark-500">No team members found</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-800">
            <p className="text-sm text-dark-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-dark-200 dark:border-dark-800">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4">Add Team Member</h2>
              
              {error && <div className="p-3 mb-4 bg-danger-50 dark:bg-danger-950 rounded-lg text-sm text-danger-700 dark:text-danger-400">{error}</div>}

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name</label>
                  <input
                    type="text" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
                  <input
                    type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Password</label>
                  <input
                    type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Role</label>
                  <select
                    value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">Create User</Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
