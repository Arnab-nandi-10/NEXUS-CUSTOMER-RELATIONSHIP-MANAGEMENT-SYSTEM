import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@/lib/api'
import { analyticsEvents } from '@/lib/analytics'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user' | 'sales' | 'support'
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  completeOAuthLogin: (token: string, user: User) => void
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null })
          const response = await authAPI.login(email, password)
          
          const user: User = {
            id: response.data.user._id,
            name: response.data.user.fullname,
            email: response.data.user.email,
            role: response.data.user.role,
            avatar: response.data.user.avatar
          }
          
          set({
            user,
            isAuthenticated: true,
            token: response.data.accessToken,
            loading: false
          })
          analyticsEvents.loginSucceeded(user.role)
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          set({ 
            loading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null
          })
          throw new Error(errorMessage)
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ loading: true, error: null })

          // Just create the account — do NOT auto-login.
          // Auto-login was masking token errors as registration errors.
          await authAPI.register(name, email, password)

          set({ loading: false })
          analyticsEvents.registrationCompleted('sales')
        } catch (error: any) {
          let errorMessage = 'Registration failed'
          if (error.response?.status === 409) {
            errorMessage = 'An account with this email already exists. Please sign in instead.'
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.message && !error.message.startsWith('Request failed')) {
            errorMessage = error.message
          }
          set({
            loading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null
          })
          throw new Error(errorMessage)
        }
      },

      completeOAuthLogin: (token: string, user: User) => {
        set({
          user,
          isAuthenticated: true,
          token,
          loading: false,
          error: null
        })
        analyticsEvents.loginSucceeded(user.role)
      },

      logout: async () => {
        try {
          await authAPI.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          analyticsEvents.logoutCompleted()
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            error: null
          })
        }
      },

      updateUser: (updatedUser: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null
        }))
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Validate rehydrated state
        if (state && (!state.user || !state.token)) {
          state.isAuthenticated = false
          state.user = null
          state.token = null
        }
      },
    }
  )
)
