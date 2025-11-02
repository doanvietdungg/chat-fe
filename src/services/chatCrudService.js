import { chatAPI, messageAPI, fileAPI } from './api'
import { message } from 'ant-design-vue'

/**
 * Chat CRUD Service
 * Provides high-level chat management operations
 */
export class ChatCrudService {
  
  // ==================== CHAT OPERATIONS ====================
  
  /**
   * Get all chats for current user
   */
  async getChats(params = {}) {
    try {
      const defaultParams = {
        page: 0,
        size: 50,
        sort: 'updatedAt,desc'
      }
      
      const response = await chatAPI.getChats({ ...defaultParams, ...params })
      return this.handleResponse(response, 'Failed to load chats')
    } catch (error) {
      this.handleError(error, 'Error loading chats')
      throw error
    }
  }

  /**
   * Create new chat
   */
  async createChat(chatData) {
    try {
      const response = await chatAPI.createChat(chatData)
      const chat = this.handleResponse(response, 'Failed to create chat')
      
      message.success(`Chat "${chat.title || 'New Chat'}" created successfully`)
      return chat
    } catch (error) {
      this.handleError(error, 'Error creating chat')
      throw error
    }
  }

  /**
   * Get chat details
   */
  async getChatDetails(chatId) {
    try {
      const response = await chatAPI.getChat(chatId)
      return this.handleResponse(response, 'Failed to load chat details')
    } catch (error) {
      this.handleError(error, 'Error loading chat details')
      throw error
    }
  }

  /**
   * Update chat
   */
  async updateChat(chatId, updates) {
    try {
      const response = await chatAPI.updateChat(chatId, updates)
      const chat = this.handleResponse(response, 'Failed to update chat')
      
      message.success('Chat updated successfully')
      return chat
    } catch (error) {
      this.handleError(error, 'Error updating chat')
      throw error
    }
  }

  /**
   * Delete chat
   */
  async deleteChat(chatId) {
    try {
      await chatAPI.deleteChat(chatId)
      message.success('Chat deleted successfully')
      return true
    } catch (error) {
      this.handleError(error, 'Error deleting chat')
      throw error
    }
  }

  // ==================== PARTICIPANT OPERATIONS ====================

  /**
   * Get chat participants
   */
  async getChatParticipants(chatId) {
    try {
      const response = await chatAPI.getParticipants(chatId)
      return this.handleResponse(response, 'Failed to load participants')
    } catch (error) {
      this.handleError(error, 'Error loading participants')
      throw error
    }
  }

  /**
   * Add participants to chat
   */
  async addParticipants(chatId, participantIds) {
    try {
      const response = await chatAPI.addParticipants(chatId, participantIds)
      const result = this.handleResponse(response, 'Failed to add participants')
      
      message.success(`Added ${participantIds.length} participant(s) to chat`)
      return result
    } catch (error) {
      this.handleError(error, 'Error adding participants')
      throw error
    }
  }

  /**
   * Remove participant from chat
   */
  async removeParticipant(chatId, userId) {
    try {
      await chatAPI.removeParticipant(chatId, userId)
      message.success('Participant removed from chat')
      return true
    } catch (error) {
      this.handleError(error, 'Error removing participant')
      throw error
    }
  }

  /**
   * Update participant role
   */
  async updateParticipantRole(chatId, userId, role) {
    try {
      const response = await chatAPI.updateParticipantRole(chatId, userId, role)
      const result = this.handleResponse(response, 'Failed to update participant role')
      
      message.success(`Participant role updated to ${role}`)
      return result
    } catch (error) {
      this.handleError(error, 'Error updating participant role')
      throw error
    }
  }

  // ==================== MESSAGE OPERATIONS ====================

  /**
   * Get messages for chat
   */
  async getMessages(chatId, params = {}) {
    try {
      const defaultParams = {
        page: 0,
        size: 50,
        sort: 'createdAt,desc'
      }
      
      const response = await messageAPI.getMessages(chatId, { ...defaultParams, ...params })
      return this.handleResponse(response, 'Failed to load messages')
    } catch (error) {
      this.handleError(error, 'Error loading messages')
      throw error
    }
  }

  /**
   * Send message
   */
  async sendMessage(chatId, messageData) {
    try {
      const response = await messageAPI.sendMessage(chatId, messageData)
      return this.handleResponse(response, 'Failed to send message')
    } catch (error) {
      this.handleError(error, 'Error sending message')
      throw error
    }
  }

  /**
   * Edit message
   */
  async editMessage(messageId, updates) {
    try {
      const response = await messageAPI.editMessage(messageId, updates)
      const message = this.handleResponse(response, 'Failed to edit message')
      
      message.success('Message edited successfully')
      return message
    } catch (error) {
      this.handleError(error, 'Error editing message')
      throw error
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    try {
      await messageAPI.deleteMessage(messageId)
      message.success('Message deleted successfully')
      return true
    } catch (error) {
      this.handleError(error, 'Error deleting message')
      throw error
    }
  }

  // ==================== FILE OPERATIONS ====================

  /**
   * Upload file with progress
   */
  async uploadFile(file, onProgress) {
    try {
      const response = await fileAPI.uploadFile(file, onProgress)
      const fileData = this.handleResponse(response, 'Failed to upload file')
      
      message.success(`File "${file.name}" uploaded successfully`)
      return fileData
    } catch (error) {
      this.handleError(error, 'Error uploading file')
      throw error
    }
  }

  /**
   * Send file message
   */
  async sendFileMessage(chatId, file, messageText = '', onProgress) {
    try {
      // First upload the file
      const fileData = await this.uploadFile(file, onProgress)
      
      // Then send message with file attachment
      const messageData = {
        text: messageText,
        fileId: fileData.id,
        type: this.getMessageTypeFromFile(file)
      }
      
      return await this.sendMessage(chatId, messageData)
    } catch (error) {
      this.handleError(error, 'Error sending file message')
      throw error
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Handle API response
   */
  handleResponse(response, errorMessage) {
    if (!response || !response.data) {
      throw new Error(errorMessage)
    }
    
    // Handle different response structures
    if (response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.message || errorMessage)
      }
      return response.data.data || response.data
    }
    
    return response.data
  }

  /**
   * Handle API errors
   */
  handleError(error, defaultMessage) {
    console.error(defaultMessage, error)
    
    let errorMessage = defaultMessage
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    message.error(errorMessage)
  }

  /**
   * Get message type from file
   */
  getMessageTypeFromFile(file) {
    const type = file.type.toLowerCase()
    
    if (type.startsWith('image/')) return 'IMAGE'
    if (type.startsWith('video/')) return 'VIDEO'
    if (type.startsWith('audio/')) return 'AUDIO'
    
    return 'FILE'
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Create private chat with user
   */
  async createPrivateChat(userId, userName) {
    const chatData = {
      type: 'PRIVATE',
      title: userName,
      description: null,
      otherUserId: userId,
      participants: null
    }
    
    return await this.createChat(chatData)
  }

  /**
   * Create group chat
   */
  async createGroupChat(title, description, participantIds) {
    const chatData = {
      type: 'GROUP',
      title,
      description,
      participants: participantIds
    }
    
    return await this.createChat(chatData)
  }

  /**
   * Leave chat
   */
  async leaveChat(chatId, currentUserId) {
    try {
      await this.removeParticipant(chatId, currentUserId)
      message.success('Left chat successfully')
      return true
    } catch (error) {
      this.handleError(error, 'Error leaving chat')
      throw error
    }
  }

  /**
   * Archive chat
   */
  async archiveChat(chatId) {
    return await this.updateChat(chatId, { archived: true })
  }

  /**
   * Unarchive chat
   */
  async unarchiveChat(chatId) {
    return await this.updateChat(chatId, { archived: false })
  }

  /**
   * Mute chat
   */
  async muteChat(chatId) {
    return await this.updateChat(chatId, { muted: true })
  }

  /**
   * Unmute chat
   */
  async unmuteChat(chatId) {
    return await this.updateChat(chatId, { muted: false })
  }

  /**
   * Pin chat
   */
  async pinChat(chatId) {
    return await this.updateChat(chatId, { pinned: true })
  }

  /**
   * Unpin chat
   */
  async unpinChat(chatId) {
    return await this.updateChat(chatId, { pinned: false })
  }
}

// Export singleton instance
export const chatCrudService = new ChatCrudService()

// Export class for testing
export default ChatCrudService