import { useState } from 'react'
import { User, Lock, Palette, Save, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { userAPI, authAPI } from '@/lib/api'
import { useThemeStore } from '@/store/themeStore'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [tab, setTab] = useState<'profile' | 'password' | 'appearance'>('profile')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleProfileSave = async () => {
    setError(''); setSuccess('')
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return }
    try {
      setSaving(true)
      const res = await userAPI.updateAdmin({ fullname: name, email })
      updateUser({ name: res.data.fullname, email: res.data.email })
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async () => {
    setError(''); setSuccess('')
    if (!oldPassword || !newPassword) { setError('All password fields are required'); return }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    try {
      setSaving(true)
      await authAPI.changePassword(oldPassword, newPassword)
      setSuccess('Password changed successfully!')
      setOldPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-dark-50">Settings</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-100 dark:bg-dark-800 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(''); setSuccess('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 shadow-sm' : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
            }`}>
            <t.icon size={16} /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 rounded-lg flex items-center gap-2 text-sm text-danger-700 dark:text-danger-400">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card p-6 space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-2xl">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="font-semibold text-dark-900 dark:text-dark-50">{user?.name}</h3>
              <p className="text-sm text-dark-500">{user?.role} account</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={saving} className="flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Current Password</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <Button onClick={handlePasswordChange} disabled={saving} className="flex items-center gap-2">
            <Lock size={16} /> {saving ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      )}

      {/* Appearance Tab */}
      {tab === 'appearance' && (
        <div className="card p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-dark-900 dark:text-dark-50">Dark Mode</h3>
              <p className="text-sm text-dark-500">Toggle between light and dark theme</p>
            </div>
            <button onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-dark-300'}`}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
