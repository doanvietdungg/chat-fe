import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import { stompService } from '../services/stompService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isAuthenticated = ref(false)

  // Computed
  const currentUser = computed(() => user.value)
  const userInitials = computed(() => {
    if (!user.value?.name) return '?'
    const words = user.value.name.trim().split(' ')
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  })

  // Actions
  const login = async (email, password) => {
    isLoading.value = true
    error.value = null

    try {
      const res = await authAPI.login({ email, password })
      const outer = res?.data || res
      const payload = outer?.data || outer
      const accessToken = payload?.accessToken || payload?.token
      const refreshToken = payload?.refreshToken || null

      if (!accessToken) {
        throw new Error('Phản hồi đăng nhập không hợp lệ')
      }

      localStorage.setItem('auth_token', accessToken)
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken)

      // Use user from payload if present; otherwise fetch /auth/me
      let userObj = payload?.user || null
      if (!userObj) {
        try {
          const meRes = await authAPI.getMe()
          const meOuter = meRes?.data || meRes
          userObj = meOuter?.data || meOuter
        } catch (_) {
          userObj = null
        }
      }

      if (!userObj) {
        // Still proceed authenticated but with minimal user shape
        userObj = { id: null }
      }

      user.value = userObj
      isAuthenticated.value = true

      localStorage.setItem('auth_user', JSON.stringify(userObj))

      // Start periodic token check
      startTokenCheck()

      // Connect STOMP (SockJS)
      try {
        stompService.connect()
      } catch (_) { /* noop */ }

      return userObj
    } catch (err) {
      console.error(err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      // Map name -> displayName for backend compatibility
      const apiBody = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
        phone: userData.phone
      }
      await authAPI.register(apiBody)
      // Do not set user/auth state here. Redirect to login will be handled by UI.
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    user.value = null
    isAuthenticated.value = false
    error.value = null
    
    // Stop periodic token check
    stopTokenCheck()
    
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    try { stompService.disconnect() } catch (_) { /* noop */ }
  }

  const updateProfile = async (updates) => {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update user data
      const updatedUser = { ...user.value, ...updates }
      user.value = updatedUser

      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))

      return updatedUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (_currentPassword, _newPassword) => {
    // Placeholder: implement when backend endpoint is available
    // For now, just simulate success after short delay
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      return true
    } finally {
      isLoading.value = false
    }
  }

  const loadUserFromStorage = async () => {
    try {
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')

      console.log('Loading user from storage...')
      console.log('Saved user:', savedUser)
      console.log('Saved token exists:', !!savedToken)

      if (savedUser && savedToken) {
        // Check if token is expired or will expire soon (within 5 minutes)
        if (isTokenExpired(savedToken) || isTokenExpiringSoon(savedToken)) {
          console.log('🔐 Token expired or expiring soon, attempting refresh...')
          await attemptTokenRefresh()
          return
        }
        
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
        console.log('✅ User authenticated from storage:', user.value)
      } else {
        console.log('❌ No saved user or token found')
        isAuthenticated.value = false
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error)
      logout()
    }
  }

  // 🔥 Check if JWT token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error('Error parsing token:', error)
      return true // Treat invalid tokens as expired
    }
  }

  // 🔥 Check if JWT token will expire soon (within 5 minutes)
  const isTokenExpiringSoon = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      const fiveMinutesFromNow = currentTime + (5 * 60) // 5 minutes in seconds
      return payload.exp < fiveMinutesFromNow
    } catch (error) {
      console.error('Error parsing token:', error)
      return true // Treat invalid tokens as expiring soon
    }
  }

  // 🔥 Attempt to refresh token silently
  const attemptTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      console.log('🔐 No refresh token available')
      logout()
      return
    }

    try {
      isLoading.value = true
      const response = await authAPI.refreshToken(refreshToken)
      
      console.log('🔐 Auth store refresh response:', response)
      
      // AuthService returns full response.data, so we need to access nested data
      // Response structure: { success: true, data: { accessToken, refreshToken } }
      const responseData = response?.data || response
      const newToken = responseData?.accessToken || responseData?.token
      const newRefresh = responseData?.refreshToken
      
      console.log('🔐 Auth store parsed tokens:', { newToken: !!newToken, newRefresh: !!newRefresh })

      if (newToken) {
        localStorage.setItem('auth_token', newToken)
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)
        
        // Reload user data
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          user.value = JSON.parse(savedUser)
          isAuthenticated.value = true
          
          console.log('🔐 Token refreshed successfully - isAuthenticated:', isAuthenticated.value)
          console.log('🔐 User after refresh:', user.value)
          
          // Restart token check
          startTokenCheck()
        } else {
          console.log('🔐 No saved user found after token refresh')
        }
      } else {
        console.log('🔐 No new token received in refresh response')
        throw new Error('No token in refresh response')
      }
    } catch (error) {
      console.error('🔐 Token refresh failed:', error)
      logout()
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // 🔥 Handle token refresh success events
  const handleTokenRefreshed = (event) => {
    console.log('🔐 Token refreshed event received:', event.detail)
    // Could show a subtle notification here if needed
    // For now, just clear any existing error
    error.value = null
  }

  // 🔥 Handle token refresh success from API interceptor
  const handleTokenRefreshSuccess = (event) => {
    console.log('🔐 Token refresh success event received:', event.detail)
    
    // Ensure auth store state is correct after API interceptor refresh
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser && !isAuthenticated.value) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
      console.log('🔐 Updated auth store state from API interceptor refresh')
      
      // Restart token check
      startTokenCheck()
    }
    
    // Clear any existing error
    error.value = null
  }

  // 🔥 Handle token expiry events
  const handleTokenExpiry = async (event) => {
    console.log('🔐 Token expired event received:', event.detail)
    
    // Try to refresh token one more time before logging out
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      console.log('🔐 Attempting final token refresh...')
      try {
        await attemptTokenRefresh()
        console.log('🔐 Final token refresh successful, staying logged in')
        return // Stay logged in
      } catch (refreshError) {
        console.error('🔐 Final token refresh failed:', refreshError)
      }
    }
    
    // Only logout if refresh fails or no refresh token
    console.log('🔐 Logging out due to token expiry')
    error.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    isAuthenticated.value = false
    user.value = null
  }

  // 🔥 Periodic token check
  let tokenCheckInterval = null

  const startTokenCheck = () => {
    // Check token every 2 minutes
    tokenCheckInterval = setInterval(async () => {
      const token = localStorage.getItem('auth_token')
      if (token && isAuthenticated.value && isTokenExpiringSoon(token)) {
        console.log('🔐 Token expiring soon, refreshing proactively...')
        try {
          await attemptTokenRefresh()
        } catch (error) {
          console.error('🔐 Proactive token refresh failed:', error)
        }
      }
    }, 2 * 60 * 1000) // 2 minutes
  }

  const stopTokenCheck = () => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval)
      tokenCheckInterval = null
    }
  }

  // Initialize
  const init = async () => {
    console.log('Initializing auth store...')
    await loadUserFromStorage()
    
    // Listen for token events
    window.addEventListener('auth:token-expired', handleTokenExpiry)
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed)
    window.addEventListener('auth:token-refresh-success', handleTokenRefreshSuccess)
    
    // Start periodic token check if authenticated
    if (isAuthenticated.value) {
      startTokenCheck()
    }
    
    console.log('Auth store initialized')
  }

  // 🔥 Cleanup event listeners
  const cleanup = () => {
    window.removeEventListener('auth:token-expired', handleTokenExpiry)
    window.removeEventListener('auth:token-refreshed', handleTokenRefreshed)
    window.removeEventListener('auth:token-refresh-success', handleTokenRefreshSuccess)
    stopTokenCheck()
  }

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,

    // Computed
    currentUser,
    userInitials,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    init,
    cleanup,
    attemptTokenRefresh,
    isTokenExpired,
    isTokenExpiringSoon,
    startTokenCheck,
    stopTokenCheck
  }
})