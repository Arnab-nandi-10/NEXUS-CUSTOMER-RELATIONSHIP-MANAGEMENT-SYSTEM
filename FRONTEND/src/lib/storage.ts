// Utility to clear all app data and refresh
export const clearAppData = () => {
  try {
    // Clear all localStorage
    const keys = ['auth-storage', 'theme-storage']
    keys.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Failed to remove ${key}:`, e)
      }
    })
    
    // Reload the page
    window.location.href = '/'
  } catch (error) {
    console.error('Error clearing app data:', error)
    // Force reload anyway
    window.location.reload()
  }
}

// Validate auth storage
export const validateAuthStorage = () => {
  try {
    const authData = localStorage.getItem('auth-storage')
    if (!authData) return true
    
    const parsed = JSON.parse(authData)
    if (!parsed.state) {
      localStorage.removeItem('auth-storage')
      return false
    }
    
    // Check if state has required fields
    const { user, token, isAuthenticated } = parsed.state
    if (isAuthenticated && (!user || !token)) {
      // Corrupted state - authenticated but missing data
      localStorage.removeItem('auth-storage')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Auth storage validation failed:', error)
    localStorage.removeItem('auth-storage')
    return false
  }
}

// Check if we're in a redirect loop
export const checkRedirectLoop = () => {
  const key = 'redirect-check'
  const now = Date.now()
  const data = sessionStorage.getItem(key)
  
  if (data) {
    const { count, timestamp } = JSON.parse(data)
    // If more than 3 redirects in last 5 seconds, clear everything
    if (count > 3 && now - timestamp < 5000) {
      console.error('Redirect loop detected, clearing app data')
      clearAppData()
      return true
    }
  }
  
  sessionStorage.setItem(key, JSON.stringify({ count: (data ? JSON.parse(data).count + 1 : 1), timestamp: now }))
  
  // Clear counter after 10 seconds
  setTimeout(() => sessionStorage.removeItem(key), 10000)
  
  return false
}
