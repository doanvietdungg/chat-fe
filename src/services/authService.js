import api from './api.js'

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        bio: userData.bio
      })

      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    'Đăng ký thất bại'
      throw new Error(message)
    }
  },

  // Login user
  async login(usernameOrEmail, password) {
    try {
      const response = await api.post('/auth/login', {
        usernameOrEmail,
        password
      })

      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    'Đăng nhập thất bại'
      throw new Error(message)
    }
  },

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken
      })

      console.log('🔐 AuthService refresh response:', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    'Làm mới token thất bại'
      throw new Error(message)
    }
  },

  // Logout (if backend has logout endpoint)
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore logout errors, just clear local storage
      console.warn('Logout request failed:', error)
    }
  }
}