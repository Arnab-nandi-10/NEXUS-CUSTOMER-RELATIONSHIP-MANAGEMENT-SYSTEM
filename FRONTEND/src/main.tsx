import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { useThemeStore } from './store/themeStore'

// Initialize theme from localStorage
const initTheme = () => {
  try {
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  } catch (error) {
    console.error('Error loading theme:', error)
  }
}

initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
