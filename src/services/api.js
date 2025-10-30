import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta?.env?.VITE_API_URL) || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate axios instance for refresh to avoid interceptor recursion
const refreshClient = axios.create({
  baseURL: (import.meta?.env?.VITE_API_URL) || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Single-flight token refresh state
let isRefreshing = false
let pendingRequests = []

function subscribeTokenRefresh(cb) { pendingRequests.push(cb) }
function onRefreshed(token) {
  pendingRequests.forEach((cb) => {
    try { cb(token) } catch (_) { }
  })
  pendingRequests = []
}

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}

    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''
    const isRefreshCall = requestUrl.includes('/auth/refresh')

    if ((status === 401 || status === 403) && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        // No refresh token, reject and let caller handle navigation
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request to run after refresh finishes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) return reject(error)
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      // Start refresh
      isRefreshing = true
      try {
        const response = await refreshClient.post(
          '/auth/refresh',
          { refreshToken },
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        )

        const token = response?.data?.accessToken || response?.data?.token
        const newRefresh = response?.data?.refreshToken
        if (!token) throw new Error('No token in refresh response')
        localStorage.setItem('auth_token', token)
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)

        onRefreshed(token)
        // Retry the original request
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        onRefreshed(null)
        // 🔥 Emit event instead of direct logout to let auth store handle it
        window.dispatchEvent(new CustomEvent('auth:token-expired', {
          detail: { error: refreshError }
        }))
        
        // Cleanup tokens but do not hard redirect here to avoid UX disruption
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Authentication APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  refreshToken: (refreshToken) => refreshClient.post('/auth/refresh', { refreshToken }),
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    // Don't force redirect, let the app handle it
  }
}

// Chat APIs
export const chatAPI = {
  getChats: (params = {}) => api.get('/chats', { params }),
  createChat: (chatData) => api.post('/chats', chatData),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  updateChat: (chatId, updates) => api.put(`/chats/${chatId}`, updates),
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
  getParticipants: (chatId) => api.get(`/chats/${chatId}/participants`),
  addParticipants: (chatId, participantIds) => api.post(`/chats/${chatId}/participants`, { participantIds }),
  updateParticipantRole: (chatId, userId, role) => api.put(`/chats/${chatId}/participants/${userId}`, { role }),
  removeParticipant: (chatId, userId) => api.delete(`/chats/${chatId}/participants/${userId}`)
}

// Message APIs
export const messageAPI = {
  getMessages: (chatId, params = {}) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, messageData) => api.post(`/chats/${chatId}/messages`, messageData),
  editMessage: (messageId, updates) => api.put(`/messages/${messageId}`, updates),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/reactions`, { emoji }),
  removeReaction: (messageId, emoji) => api.delete(`/messages/${messageId}/reactions/${emoji}`)
}

// File APIs
export const fileAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          const percent = Math.round((e.loaded * 100) / e.total)
          onProgress(percent)
        }
      }
    })
  },
  getFile: (fileId) => api.get(`/files/${fileId}`),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`)
}

// Search APIs
export const searchAPI = {
  searchMessages: (params) => api.get('/search/messages', { params }),
  searchChats: (params) => api.get('/search/chats', { params }),
  searchUsers: (params) => api.get('/search/users', { params })
}

// Contacts APIs
export const contactsAPI = {
  getContacts: (params = {}) => api.get('/contacts', { params }),
  searchContacts: (q, extraParams = {}) => api.get('/contacts', { params: { q, ...extraParams } })
}

// Notification APIs
export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
}

// WebSocket Service - Using STOMP protocol
// Import the STOMP service for WebSocket connections
export { stompService as wsService } from './stompService'