// API Service Layer for Chat App
import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api/v1',
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// Authentication APIs
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Logout (client-side only, server doesn't need endpoint)
  logout: () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }
}

// Chat APIs
export const chatAPI = {
  // Get all chats for user
  getChats: (params = {}) => api.get('/chats', { params }),
  
  // Create new chat
  createChat: (chatData) => api.post('/chats', chatData),
  
  // Get specific chat
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  
  // Update chat settings
  updateChat: (chatId, updates) => api.put(`/chats/${chatId}`, updates),
  
  // Delete/leave chat
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
  
  // Get chat participants
  getParticipants: (chatId) => api.get(`/chats/${chatId}/participants`),
  
  // Add participants to chat
  addParticipants: (chatId, participantIds) => 
    api.post(`/chats/${chatId}/participants`, { participantIds }),
  
  // Update participant role
  updateParticipantRole: (chatId, userId, role) => 
    api.put(`/chats/${chatId}/participants/${userId}`, { role }),
  
  // Remove participant from chat
  removeParticipant: (chatId, userId) => 
    api.delete(`/chats/${chatId}/participants/${userId}`)
}

// Message APIs
export const messageAPI = {
  // Get messages for a chat
  getMessages: (chatId, params = {}) => 
    api.get(`/chats/${chatId}/messages`, { params }),
  
  // Send message
  sendMessage: (chatId, messageData) => 
    api.post(`/chats/${chatId}/messages`, messageData),
  
  // Edit message
  editMessage: (messageId, updates) => 
    api.put(`/messages/${messageId}`, updates),
  
  // Delete message
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // Add reaction to message
  addReaction: (messageId, emoji) => 
    api.post(`/messages/${messageId}/reactions`, { emoji }),
  
  // Remove reaction from message
  removeReaction: (messageId, emoji) => 
    api.delete(`/messages/${messageId}/reactions/${emoji}`)
}

// File APIs
export const fileAPI = {
  // Upload file
  uploadFile: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      },
    })
  },
  
  // Get file info
  getFile: (fileId) => api.get(`/files/${fileId}`),
  
  // Delete file
  deleteFile: (fileId) => api.delete(`/files/${fileId}`)
}

// Search APIs
export const searchAPI = {
  // Search messages
  searchMessages: (params) => api.get('/search/messages', { params }),
  
  // Search chats
  searchChats: (params) => api.get('/search/chats', { params }),
  
  // Search users
  searchUsers: (params) => api.get('/search/users', { params })
}

// Notification APIs
export const notificationAPI = {
  // Get notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  
  // Mark notification as read
  markAsRead: (notificationId) => 
    api.put(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
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
    if (this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    const wsUrl = `${process.env.VUE_APP_WS_URL || 'ws://localhost:3000/ws'}?token=${token}`
    
    try {
      this.socket = new WebSocket(wsUrl)
      
      this.socket.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connected')
      }
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit(data.type, data.data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected')
        this.emit('disconnected')
        this.attemptReconnect(token)
      }
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
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
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect(token)
      }, delay)
    }
  }

  // Convenience methods for common events
  joinChat(chatId) {
    this.send('join_chat', { chatId })
  }

  leaveChat(chatId) {
    this.send('leave_chat', { chatId })
  }

  startTyping(chatId) {
    this.send('typing_start', { chatId })
  }

  stopTyping(chatId) {
    this.send('typing_stop', { chatId })
  }

  markMessageAsRead(messageId) {
    this.send('message_read', { messageId })
  }
}

// Create singleton instance
export const wsService = new WebSocketService()

// Export default API instance for custom requests
export default api


