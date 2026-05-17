import axios from 'axios'

const normalizeApiUrl = (url: string) => {
  const trimmedUrl = url.trim().replace(/\/+$/, '')
  if (/\/api(\/v1)?$/.test(trimmedUrl)) {
    return trimmedUrl
  }

  return `${trimmedUrl}/api`
}

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (!envUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  return normalizeApiUrl(envUrl)
}

const API_URL = getApiUrl()

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const { state } = JSON.parse(authData)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch { /* ignore */ }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 with automatic token refresh
let isRefreshing = false
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip refresh logic for auth routes or already-retried requests
    const isAuthRoute = originalRequest?.url?.includes('/auth/')
    if (error.response?.status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Call refresh-token endpoint
      const res = await api.post('/auth/refresh-token')
      const newAccessToken = res.data?.data?.accessToken

      if (newAccessToken) {
        // Update stored token
        const authData = localStorage.getItem('auth-storage')
        if (authData) {
          try {
            const parsed = JSON.parse(authData)
            parsed.state.token = newAccessToken
            localStorage.setItem('auth-storage', JSON.stringify(parsed))
          } catch { /* ignore */ }
        }

        // Retry original request + queued requests
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        return api(originalRequest)
      } else {
        throw new Error('No access token in refresh response')
      }
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ─── Auth ──────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register-admin', { fullname: name, email, password })
    return res.data
  },
  registerUser: async (fullname: string, email: string, role: string, password: string) => {
    const res = await api.post('/auth/register', { fullname, email, role, password })
    return res.data
  },
  logout: async () => {
    const res = await api.post('/auth/logout')
    return res.data
  },
  refreshToken: async () => {
    const res = await api.post('/auth/refresh-token')
    return res.data
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.post('/auth/change-password', { oldPassword, newPassword })
    return res.data
  },
}

// ─── Clients ───────────────────────────────────────
export const clientAPI = {
  getAll: async (page = 1) => {
    const res = await api.get(`/clients/get-all-clients?page=${page}`)
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/clients/get-client/${id}`)
    return res.data
  },
  getAssigned: async (page = 1) => {
    const res = await api.get(`/clients/assigned?page=${page}`)
    return res.data
  },
  search: async (params: { q?: string; leadStatus?: string; assignedTo?: string; page?: number; sortBy?: string; sortOrder?: string }) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, String(v)) })
    const res = await api.get(`/clients/search?${query.toString()}`)
    return res.data
  },
  getDeleted: async (page = 1) => {
    const res = await api.get(`/clients/deleted?page=${page}`)
    return res.data
  },
  create: async (data: any) => {
    const res = await api.post('/clients/create-client', data)
    return res.data
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/clients/update-client-details/${id}`, data)
    return res.data
  },
  updateLead: async (id: string, leadStatus: string) => {
    const res = await api.patch(`/clients/update-lead/${id}`, { leadStatus })
    return res.data
  },
  assign: async (id: string, assignedTo: string) => {
    const res = await api.patch(`/clients/assign/${id}`, { userId: assignedTo })
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/clients/delete/${id}`)
    return res.data
  },
  restore: async (id: string) => {
    const res = await api.patch(`/clients/restore/${id}`)
    return res.data
  },
}

// ─── Users ─────────────────────────────────────────
export const userAPI = {
  getCurrent: async () => {
    const res = await api.get('/users/current-user')
    return res.data
  },
  getAll: async (page = 1) => {
    const res = await api.get(`/users/get-all-users?page=${page}`)
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/users/get-single-user/${id}`)
    return res.data
  },
  updateAdmin: async (data: { fullname: string; email: string }) => {
    const res = await api.patch('/users/update-admin-account', data)
    return res.data
  },
  updateUser: async (id: string, data: any) => {
    const res = await api.patch(`/users/update-user-details/${id}`, data)
    return res.data
  },
  toggleStatus: async (id: string) => {
    const res = await api.patch(`/users/status/${id}`)
    return res.data
  },
  updateRole: async (id: string, role: string) => {
    const res = await api.patch(`/users/role/${id}`, { role })
    return res.data
  },
}

// ─── Communications ────────────────────────────────
export const commAPI = {
  create: async (data: { clientId: string; type: string; message: string }) => {
    const res = await api.post('/communications/create', data)
    return res.data
  },
  getByClient: async (clientId: string) => {
    const res = await api.get(`/communications/client/${clientId}`)
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/communications/${id}`)
    return res.data
  },
}

// ─── Reminders ─────────────────────────────────────
export const reminderAPI = {
  create: async (data: any) => {
    const res = await api.post('/reminders/create', data)
    return res.data
  },
  getAll: async (page = 1, status?: string) => {
    const query = status ? `?page=${page}&status=${status}` : `?page=${page}`
    const res = await api.get(`/reminders${query}`)
    return res.data
  },
  getMine: async (page = 1, status?: string) => {
    const query = status ? `?page=${page}&status=${status}` : `?page=${page}`
    const res = await api.get(`/reminders/my-reminders${query}`)
    return res.data
  },
  getByClient: async (clientId: string) => {
    const res = await api.get(`/reminders/client/${clientId}`)
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/reminders/${id}`)
    return res.data
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/reminders/${id}`, data)
    return res.data
  },
  markSent: async (id: string) => {
    const res = await api.patch(`/reminders/${id}/mark-sent`)
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/reminders/${id}`)
    return res.data
  },
}

// ─── Tasks ─────────────────────────────────────────
export const taskAPI = {
  create: async (data: any) => {
    const res = await api.post('/tasks/create', data)
    return res.data
  },
  getAll: async (page = 1, filters?: { status?: string; priority?: string; assignedTo?: string }) => {
    const query = new URLSearchParams({ page: String(page) })
    if (filters?.status) query.append('status', filters.status)
    if (filters?.priority) query.append('priority', filters.priority)
    if (filters?.assignedTo) query.append('assignedTo', filters.assignedTo)
    const res = await api.get(`/tasks/all?${query.toString()}`)
    return res.data
  },
  getMine: async (page = 1, filters?: { status?: string; priority?: string }) => {
    const query = new URLSearchParams({ page: String(page) })
    if (filters?.status) query.append('status', filters.status)
    if (filters?.priority) query.append('priority', filters.priority)
    const res = await api.get(`/tasks/my-tasks?${query.toString()}`)
    return res.data
  },
  getByClient: async (clientId: string) => {
    const res = await api.get(`/tasks/client/${clientId}`)
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/tasks/${id}`)
    return res.data
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/tasks/${id}`, data)
    return res.data
  },
  toggleStatus: async (id: string) => {
    const res = await api.patch(`/tasks/${id}/toggle-status`)
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`)
    return res.data
  },
}

// ─── Dashboard ─────────────────────────────────────
export const dashboardAPI = {
  getAdmin: async () => {
    const res = await api.get('/dashboard/admin')
    return res.data
  },
  getSales: async () => {
    const res = await api.get('/dashboard/sales')
    return res.data
  },
  getSupport: async () => {
    const res = await api.get('/dashboard/support')
    return res.data
  },
  getAnalytics: async () => {
    const res = await api.get('/dashboard/analytics')
    return res.data
  },
}

export default api
