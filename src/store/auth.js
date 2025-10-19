import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'

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
      const token = payload?.token
      const userObj = payload?.user

      if (!token || !userObj) {
        throw new Error('Phản hồi đăng nhập không hợp lệ')
      }

      user.value = userObj
      isAuthenticated.value = true

      localStorage.setItem('auth_user', JSON.stringify(userObj))
      localStorage.setItem('auth_token', token)

      return userObj
    } catch (err) {
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
      const res = await authAPI.register(apiBody)
      const outer = res?.data || res
      const payload = outer?.data || outer
      const token = payload?.token
      const userObj = payload?.user

      if (!token || !userObj) {
        throw new Error('Phản hồi đăng ký không hợp lệ')
      }

      user.value = userObj
      isAuthenticated.value = true

      localStorage.setItem('auth_user', JSON.stringify(userObj))
      localStorage.setItem('auth_token', token)

      return userObj
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

  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')

      if (savedUser && savedToken) {
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error)
      logout()
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize
  const init = () => {
    loadUserFromStorage()
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
    init
  }
})