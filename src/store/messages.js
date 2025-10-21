import { reactive, computed } from 'vue'
import { useAuthStore } from './auth'

// Enhanced message state with Telegram-like features
const state = reactive({
  messages: [
    // Sample messages with enhanced structure
    {
      id: 'msg-1',
      chatId: 'friend-1',
      text: 'Chào bạn! Hôm nay thế nào?',
      author: 'Linh',
      authorId: 'user-linh',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      at: new Date(Date.now() - 3600000).toISOString(), // For compatibility
      edited: false,
      editedAt: null,
      reactions: [
        { emoji: '👍', users: ['user-me'], count: 1 },
        { emoji: '❤️', users: ['user-me', 'user-linh'], count: 2 }
      ],
      replyTo: null,
      forwarded: null,
      readBy: [
        { userId: 'user-me', readAt: new Date().toISOString() }
      ],
      media: null,
      voice: null,
      type: 'text'
    },
    {
      id: 'msg-2', 
      chatId: 'friend-1',
      text: 'Tôi ổn! Cảm ơn bạn đã hỏi 😊',
      author: 'User-123',
      authorId: 'user-me',
      timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
      at: new Date(Date.now() - 3000000).toISOString(), // For compatibility
      edited: false,
      editedAt: null,
      reactions: [],
      replyTo: {
        id: 'msg-1',
        text: 'Chào bạn! Hôm nay thế nào?',
        author: 'Linh'
      },
      forwarded: null,
      readBy: [
        { userId: 'user-linh', readAt: new Date().toISOString() }
      ],
      media: null,
      voice: null,
      type: 'text'
    },
    {
      id: 'msg-3',
      chatId: 'friend-1', 
      text: 'Bạn có rảnh không? Mình muốn hỏi về dự án.',
      author: 'Linh',
      authorId: 'user-linh',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      at: new Date(Date.now() - 1800000).toISOString(),
      edited: false,
      editedAt: null,
      reactions: [
        { emoji: '👍', users: ['user-me'], count: 1 }
      ],
      replyTo: null,
      forwarded: null,
      readBy: [],
      media: null,
      voice: null,
      type: 'text'
    },
    {
      id: 'msg-4',
      chatId: 'friend-1',
      text: 'Có chứ! Bạn cần hỗ trợ gì?',
      author: 'User-123', 
      authorId: 'user-me',
      timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 min ago
      at: new Date(Date.now() - 1200000).toISOString(),
      edited: false,
      editedAt: null,
      reactions: [],
      replyTo: null,
      forwarded: null,
      readBy: [
        { userId: 'user-linh', readAt: new Date().toISOString() }
      ],
      media: null,
      voice: null,
      type: 'text'
    }
  ],

  typingUsers: [], // Users currently typing
  editingMessageId: null,
  replyingTo: null,
  selectedMessages: [], // For forwarding/bulk actions
  searchResults: [],
  isSearching: false
})

export function useMessagesStore() {
  // Get current user from auth store
  function getCurrentUser() {
    const authStore = useAuthStore()
    return authStore.user || { id: 'user-me', name: 'You' }
  }
  // Message CRUD operations
  function setMessagesForChat(chatId, apiData) {
    if (!chatId) return
    const outer = apiData?.data || apiData
    const node = outer?.data || outer
    const list = Array.isArray(node?.content) ? node.content : (Array.isArray(node) ? node : [])

    // Remove existing messages for this chat
    for (let i = state.messages.length - 1; i >= 0; i--) {
      if (state.messages[i] && state.messages[i].chatId === chatId) {
        state.messages.splice(i, 1)
      }
    }

    // Map API items to local message shape and insert (oldest first)
    const mapped = list.map(it => ({
      id: it.id || `msg-${Math.random().toString(36).slice(2)}`,
      chatId: it.chatId || chatId,
      text: it.text || it.content || it.body || '',
      author: it.author?.name || it.senderName || it.sender || 'Unknown',
      authorId: it.authorId || it.senderId || it.userId || 'unknown',
      timestamp: it.createdAt || it.timestamp || new Date().toISOString(),
      at: it.createdAt || it.timestamp || new Date().toISOString(),
      edited: !!it.edited,
      editedAt: it.editedAt || null,
      reactions: Array.isArray(it.reactions) ? it.reactions : [],
      replyTo: it.replyTo || null,
      forwarded: it.forwarded || null,
      readBy: Array.isArray(it.readBy) ? it.readBy : [],
      media: it.media || null,
      voice: it.voice || null,
      type: it.type || 'text'
    }))

    // Ensure chronological order if backend returns desc
    const inAsc = mapped.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    state.messages.push(...inAsc)
  }

  function addMessage(messageData) {
    const message = {
      id: messageData.id || generateId(),
      chatId: messageData.chatId || state.currentChatId,
      text: messageData.text || '',
      author: messageData.author || getCurrentUser().name,
      authorId: messageData.authorId || getCurrentUser().id,
      timestamp: messageData.timestamp || new Date().toISOString(),
      at: messageData.timestamp || new Date().toISOString(), // For compatibility
      edited: messageData.edited || false,
      editedAt: messageData.editedAt || null,
      reactions: messageData.reactions || [],
      replyTo: messageData.replyTo || null,
      forwarded: messageData.forwarded || null,
      readBy: messageData.readBy || [],
      media: messageData.media || null,
      voice: messageData.voice || null,
      type: messageData.type || 'text'
    }
    
    // Check if message already exists (avoid duplicates)
    const existingIndex = state.messages.findIndex(m => m.id === message.id)
    if (existingIndex !== -1) {
      // Update existing message
      state.messages[existingIndex] = message
    } else {
      // Add new message
      state.messages.push(message)
    }
    
    // Clear reply state after sending (only for current user messages)
    if (state.replyingTo && message.authorId === getCurrentUser().id) {
      state.replyingTo = null
    }
    
    return message
  }

  function editMessage(messageId, newText) {
    const message = state.messages.find(m => m.id === messageId)
    if (message && message.authorId === getCurrentUser().id) {
      message.text = newText
      message.edited = true
      message.editedAt = new Date().toISOString()
      state.editingMessageId = null
      return true
    }
    return false
  }

  function deleteMessage(messageId) {
    const messageIndex = state.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      const message = state.messages[messageIndex]
      if (message.authorId === getCurrentUser().id) {
        // Soft delete - replace with placeholder
        message.text = 'Tin nhắn đã được xóa'
        message.deleted = true
        message.deletedAt = new Date().toISOString()
        return true
      }
    }
    return false
  }

  function undoDelete(messageId) {
    const message = state.messages.find(m => m.id === messageId)
    if (message && message.deleted) {
      // Restore original message (would need to store original text)
      message.deleted = false
      message.deletedAt = null
      return true
    }
    return false
  }

  // Reaction management
  function addReaction(messageId, emoji) {
    const message = state.messages.find(m => m.id === messageId)
    if (!message) return false

    const existingReaction = message.reactions.find(r => r.emoji === emoji)
    
    if (existingReaction) {
      // Toggle user's reaction
      const userIndex = existingReaction.users.indexOf(getCurrentUser().id)
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1)
        existingReaction.count--
        
        // Remove reaction if no users left
        if (existingReaction.count === 0) {
          const reactionIndex = message.reactions.indexOf(existingReaction)
          message.reactions.splice(reactionIndex, 1)
        }
      } else {
        existingReaction.users.push(getCurrentUser().id)
        existingReaction.count++
      }
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        users: [getCurrentUser().id],
        count: 1
      })
    }
    
    return true
  }

  function removeReaction(messageId, emoji) {
    const message = state.messages.find(m => m.id === messageId)
    if (!message) return false

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji)
    if (reactionIndex > -1) {
      const reaction = message.reactions[reactionIndex]
      const userIndex = reaction.users.indexOf(getCurrentUser().id)
      
      if (userIndex > -1) {
        reaction.users.splice(userIndex, 1)
        reaction.count--
        
        if (reaction.count === 0) {
          message.reactions.splice(reactionIndex, 1)
        }
        return true
      }
    }
    return false
  }

  // Reply management
  function setReplyTo(message) {
    state.replyingTo = {
      id: message.id,
      text: message.text,
      author: message.author,
      media: message.media,
      voice: message.voice
    }
  }

  function clearReply() {
    state.replyingTo = null
  }

  // Edit management
  function startEdit(messageId) {
    const message = state.messages.find(m => m.id === messageId)
    if (message && message.authorId === getCurrentUser().id) {
      state.editingMessageId = messageId
      return message.text
    }
    return null
  }

  function cancelEdit() {
    state.editingMessageId = null
  }

  // Typing indicators
  function setTyping(userId, isTyping) {
    const index = state.typingUsers.indexOf(userId)
    
    if (isTyping && index === -1) {
      state.typingUsers.push(userId)
    } else if (!isTyping && index > -1) {
      state.typingUsers.splice(index, 1)
    }
  }

  // Message selection for forwarding
  function toggleMessageSelection(messageId) {
    const index = state.selectedMessages.indexOf(messageId)
    if (index > -1) {
      state.selectedMessages.splice(index, 1)
    } else {
      state.selectedMessages.push(messageId)
    }
  }

  function clearSelection() {
    state.selectedMessages = []
  }

  function selectAllMessages() {
    state.selectedMessages = state.messages.map(m => m.id)
  }

  // Search functionality
  function searchMessages(query, filters = {}) {
    state.isSearching = true
    
    // Simple client-side search (would be server-side in real app)
    const results = state.messages.filter(message => {
      // Text search
      const textMatch = !query || message.text.toLowerCase().includes(query.toLowerCase())
      
      // Author filter
      const authorMatch = !filters.author || message.authorId === filters.author
      
      // Date filter
      const dateMatch = !filters.dateRange || (
        new Date(message.timestamp) >= filters.dateRange[0] &&
        new Date(message.timestamp) <= filters.dateRange[1]
      )
      
      // Type filter
      const typeMatch = !filters.type || message.type === filters.type
      
      return textMatch && authorMatch && dateMatch && typeMatch
    })
    
    state.searchResults = results
    state.isSearching = false
    return results
  }

  function clearSearch() {
    state.searchResults = []
    state.isSearching = false
  }

  // Forward messages
  function forwardMessages(messageIds, targetChatIds) {
    const messagesToForward = state.messages.filter(m => messageIds.includes(m.id))
    
    messagesToForward.forEach(originalMessage => {
      targetChatIds.forEach(chatId => {
        const forwardedMessage = {
          ...originalMessage,
          id: generateId(),
          chatId,
          timestamp: new Date().toISOString(),
          forwarded: {
            originalSender: originalMessage.author,
            originalChat: originalMessage.chatId,
            originalTimestamp: originalMessage.timestamp
          },
          reactions: [], // Reset reactions for forwarded messages
          readBy: []
        }
        
        state.messages.push(forwardedMessage)
      })
    })
    
    clearSelection()
    return true
  }

  // Read receipts
  function markAsRead(messageId, userId = null) {
    const message = state.messages.find(m => m.id === messageId)
    if (message) {
      const readerId = userId || getCurrentUser().id
      const existingRead = message.readBy.find(r => r.userId === readerId)
      
      if (!existingRead) {
        message.readBy.push({
          userId: readerId,
          readAt: new Date().toISOString()
        })
      }
    }
  }

  // Computed properties
  const currentChatMessages = computed(() => {
    return state.messages.filter(m => m.chatId === state.currentChatId)
  })

  const hasSelectedMessages = computed(() => {
    return state.selectedMessages.length > 0
  })

  const selectedMessagesData = computed(() => {
    return state.messages.filter(m => state.selectedMessages.includes(m.id))
  })

  const typingUsersNames = computed(() => {
    // Would map user IDs to names in real app
    return state.typingUsers.map(userId => `User ${userId.slice(-3)}`)
  })

  // Utility functions
  function generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  function getMessageById(messageId) {
    return state.messages.find(m => m.id === messageId)
  }

  function getMessagesForChat(chatId) {
    return state.messages.filter(m => m.chatId === chatId)
  }

  return {
    state,
    
    // Message operations
    setMessagesForChat,
    addMessage,
    editMessage,
    deleteMessage,
    undoDelete,
    
    // Reactions
    addReaction,
    removeReaction,
    
    // Replies
    setReplyTo,
    clearReply,
    
    // Editing
    startEdit,
    cancelEdit,
    
    // Typing
    setTyping,
    
    // Selection
    toggleMessageSelection,
    clearSelection,
    selectAllMessages,
    
    // Search
    searchMessages,
    clearSearch,
    
    // Forwarding
    forwardMessages,
    
    // Read receipts
    markAsRead,
    
    // Utilities
    getMessageById,
    getMessagesForChat,
    
    // Computed
    currentChatMessages,
    hasSelectedMessages,
    selectedMessagesData,
    typingUsersNames
  }
}