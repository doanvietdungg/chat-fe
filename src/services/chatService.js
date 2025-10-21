import api from './api.js'

export const chatService = {
  // Get list of chats
  async getChats(page = 0, size = 20, sort = 'createdAt,desc') {
    try {
      const response = await api.get('/chats', {
        params: { page, size, sort }
      })
      return response.data
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể tải danh sách chat'
      throw new Error(message)
    }
  },

  // Create new chat
  async createChat(chatData) {
    try {
      const response = await api.post('/chats', chatData)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể tạo chat mới'
      throw new Error(message)
    }
  },

  // Get chat by ID
  async getChatById(chatId) {
    try {
      const response = await api.get(`/chats/${chatId}`)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể tải thông tin chat'
      throw new Error(message)
    }
  },

  // Get messages in chat
  async getMessages(chatId, page = 0, size = 50, sort = 'createdAt,desc') {
    try {
      const response = await api.get(`/chats/${chatId}/messages`, {
        params: { page, size, sort }
      })
      return response.data
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể tải tin nhắn'
      throw new Error(message)
    }
  },

  // Send message
  async sendMessage(chatId, messageData) {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, messageData)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể gửi tin nhắn'
      throw new Error(message)
    }
  },

  // Update message
  async updateMessage(messageId, messageData) {
    try {
      const response = await api.put(`/messages/${messageId}`, messageData)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể cập nhật tin nhắn'
      throw new Error(message)
    }
  },

  // Delete message
  async deleteMessage(messageId) {
    try {
      await api.delete(`/messages/${messageId}`)
      return true
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể xóa tin nhắn'
      throw new Error(message)
    }
  },

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      await api.post(`/messages/${messageId}/read`)
      return true
    } catch (error) {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể đánh dấu đã đọc'
      throw new Error(message)
    }
  }
}