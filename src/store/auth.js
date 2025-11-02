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
        // Check if token is expired before setting authenticated
        if (isTokenExpired(savedToken)) {
          console.log('🔐 Token expired, attempting refresh...')
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
      const newToken = response?.data?.accessToken || response?.data?.token
      const newRefresh = response?.data?.refreshToken

      if (newToken) {
        localStorage.setItem('auth_token', newToken)
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)
        
        // Reload user data
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          user.value = JSON.parse(savedUser)
          isAuthenticated.value = true
          console.log('🔐 Token refreshed successfully')
        }
      } else {
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

  // 🔥 Handle token expiry events
  const handleTokenExpiry = (event) => {
    console.log('🔐 Token expired event received:', event.detail)
    error.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    isAuthenticated.value = false
    user.value = null
  }

  // Initialize
  const init = async () => {
    console.log('Initializing auth store...')
    await loadUserFromStorage()
    
    // Listen for token expiry events
    window.addEventListener('auth:token-expired', handleTokenExpiry)
    console.log('Auth store initialized')
  }

  // 🔥 Cleanup event listeners
  const cleanup = () => {
    window.removeEventListener('auth:token-expired', handleTokenExpiry)
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
    isTokenExpired
  }
})