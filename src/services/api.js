import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken
          })

          const { token } = response.data
          const wsUrl = `${(import.meta?.env?.VITE_WS_URL) || 'ws://localhost:3000/ws'}?token=${token}`
          localStorage.setItem('auth_token', token)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/login'
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
  logout: () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
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

// Notification APIs
export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
}

// WebSocket Service
export class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  connect(token) {
    if (this.socket?.readyState === WebSocket.OPEN) return
    const wsUrl = `${(import.meta?.env?.VITE_WS_URL) || 'ws://localhost:3000/ws'}?token=${token}`
    try {
      this.socket = new WebSocket(wsUrl)
      this.socket.onopen = () => {
        this.reconnectAttempts = 0
        this.emit('connected')
      }
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit(data.type, data.data)
        } catch (err) { /* noop */ }
      }
      this.socket.onclose = () => {
        this.emit('disconnected')
        this.attemptReconnect(token)
      }
      this.socket.onerror = (err) => this.emit('error', err)
    } catch (_) { /* noop */ }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  send(type, data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }))
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const list = this.listeners.get(event)
      const i = list.indexOf(callback)
      if (i > -1) list.splice(i, 1)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data))
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      setTimeout(() => this.connect(token), delay)
    }
  }

  joinChat(chatId) { this.send('join_chat', { chatId }) }
  leaveChat(chatId) { this.send('leave_chat', { chatId }) }
  startTyping(chatId) { this.send('typing_start', { chatId }) }
  stopTyping(chatId) { this.send('typing_stop', { chatId }) }
  markMessageAsRead(messageId) { this.send('message_read', { messageId }) }
}

export const wsService = new WebSocketService()