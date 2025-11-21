import { reactive, computed } from 'vue'
import { useAuthStore } from './auth'

// Enhanced message state - no mock data, all from API
const state = reactive({
  loading: false,
  messages: [], // Start with empty array, will be populated from API only

  typingUsers: [], // Users currently typing (global - deprecated)
  typingByChat: {}, // Users typing by chat ID: { chatId: [userId1, userId2] }
  editingMessageId: null,
  replyingTo: null,
  selectedMessages: [], // For forwarding/bulk actions
  searchResults: [],
  isSearching: false,
  
  // Track loading state per chat to prevent duplicate API calls
  loadingChats: new Set(),
  loadedChats: new Set()
})

export function useMessagesStore() {
  // Get current user from auth store
  function getCurrentUser() {
    const authStore = useAuthStore()
    return authStore.user || { id: 'current_user', name: 'You' }
  }

  // No mock data initialization needed - all data from API
  function initializeMockData() {
    // No-op - all messages come from API
    console.log('Messages store initialized - no mock data')
  }
  // Message CRUD operations
  function setMessagesForChat(chatId, apiData) {
    if (!chatId) return

    // Handle API response structure: { data: { content: [...] } } or direct { content: [...] }
    const responseData = apiData?.data || apiData
    const content = responseData?.content || []

    if (!Array.isArray(content)) {
      console.warn('Invalid messages data format:', responseData)
      return
    }

    // Remove existing messages for this chat
    for (let i = state.messages.length - 1; i >= 0; i--) {
      if (state.messages[i] && state.messages[i].chatId === chatId) {
        state.messages.splice(i, 1)
      }
    }

    // Map API messages to local message format
    const mapped = content.map(message => {
      // Handle file/media data from API
      let media = null
      if (message.file && message.fileId) {
        // Use file object from API response
        media = {
          fileId: message.fileId,
          fileName: message.file.name,
          fileUrl: message.file.url,
          fileSize: message.file.size,
          contentType: message.file.contentType,
          type: message.type?.toLowerCase() || 'file'
        }
        console.log('📎 Parsed file message:', { messageId: message.id, media })
      } else if (message.fileId) {
        // Fallback if only fileId exists
        media = {
          fileId: message.fileId,
          fileName: 'Unknown file',
          fileUrl: null,
          fileSize: 0,
          contentType: null,
          type: message.type?.toLowerCase() || 'file'
        }
        console.log('📎 Parsed file message (fallback):', { messageId: message.id, media })
      }

      return {
        id: message.id,
        chatId: message.chatId || chatId,
        text: message.text || '',
        author: 'Unknown', // Will be resolved from users store
        authorId: message.authorId,
        timestamp: message.createdAt || new Date().toISOString(),
        at: message.createdAt || new Date().toISOString(),
        edited: message.createdAt !== message.updatedAt,
        editedAt: message.createdAt !== message.updatedAt ? message.updatedAt : null,
        reactions: [],
        replyToId: message.replyToId || null,
        forwardedFromId: message.forwardedFromId || null,
        forwardedFromUsername: message.forwardedFromUsername || null,
        forwarded: null,
        readBy: [],
        media: media,
        voice: null,
        type: message.type?.toLowerCase() || 'text'
      }
    })

    // Sort messages by timestamp (oldest first for display)
    const sortedMessages = mapped.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // Add messages to store
    state.messages.push(...sortedMessages)

    // Resolve author names from users store
    resolveMessageAuthors(sortedMessages)
  }

  // Helper function to resolve author names from users store
  function resolveMessageAuthors(messages) {
    // Import users store dynamically to avoid circular dependency
    import('./users.js').then(({ useUsersStore }) => {
      const usersStore = useUsersStore()

      messages.forEach(message => {
        if (message.authorId && message.author === 'Unknown') {
          const user = usersStore.getUserById(message.authorId)
          if (user) {
            message.author = user.name || user.username || `User ${message.authorId}`
          } else {
            // Fallback name while user is being loaded
            message.author = `User ${message.authorId.slice(-4)}`
          }
        }
      })
    }).catch(() => {
      // Fallback if users store not available
      messages.forEach(message => {
        if (message.author === 'Unknown') {
          message.author = `User ${message.authorId?.slice(-4) || 'Unknown'}`
        }
      })
    })
  }

  function addMessage(messageData) {
    const message = {
      id: messageData.id || generateId(),
      chatId: messageData.chatId || state.currentChatId,
      text: messageData.text || '',
      author: messageData.author || getCurrentUser().name,
      authorId: messageData.authorId || getCurrentUser().id,
      timestamp: messageData.timestamp || messageData.createdAt || new Date().toISOString(),
      at: messageData.timestamp || messageData.createdAt || new Date().toISOString(),
      edited: messageData.edited || (messageData.createdAt !== messageData.updatedAt),
      editedAt: messageData.editedAt || (messageData.createdAt !== messageData.updatedAt ? messageData.updatedAt : null),
      reactions: messageData.reactions || [],
      replyToId: messageData.replyToId || null,
      forwardedFromId: messageData.forwardedFromId || null,
      forwarded: messageData.forwarded || null,
      readBy: messageData.readBy || [],
      media: messageData.media || (messageData.fileId ? {
        fileId: messageData.fileId,
        fileName: messageData.fileName || 'Unknown file',
        fileUrl: messageData.fileUrl || null,
        fileSize: messageData.fileSize || 0,
        contentType: messageData.contentType || null,
        type: messageData.type?.toLowerCase() || 'file'
      } : null),
      voice: messageData.voice || null,
      type: (messageData.type || 'text').toLowerCase()
    }

    // Check if message already exists (avoid duplicates)
    const existingIndex = state.messages.findIndex(m => m.id === message.id)
    if (existingIndex !== -1) {
      // Update existing message
      state.messages[existingIndex] = message
    } else {
      // Add new message in chronological order
      const insertIndex = state.messages.findIndex(m =>
        m.chatId === message.chatId && new Date(m.timestamp) > new Date(message.timestamp)
      )

      if (insertIndex === -1) {
        // Add at the end
        state.messages.push(message)
      } else {
        // Insert at correct position
        state.messages.splice(insertIndex, 0, message)
      }
    }

    // Resolve author name if not provided
    if (message.author === getCurrentUser().name && message.authorId !== getCurrentUser().id) {
      resolveMessageAuthors([message])
    }

    // Clear reply state after sending (only for current user messages)
    if (state.replyingTo && message.authorId === getCurrentUser().id) {
      state.replyingTo = null
    }

    return message
  }

  function removeMessage(messageId) {
    console.log('🗑️ removeMessage called for:', messageId)
    
    // Đánh dấu message đang bị xóa để trigger animation
    const message = state.messages.find(m => m.id === messageId)
    if (message) {
      message.isDeleting = true
    }
    
    // Delay để animation chạy (600ms - dissolve effect)
    setTimeout(() => {
      const messageIndex = state.messages.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        state.messages.splice(messageIndex, 1)
        console.log('✅ Message dissolved and removed from UI')
      }
    }, 600)
    
    return true
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

  async function deleteMessage(messageId) {
    try {
      console.log('🗑️ Deleting message:', messageId)
      console.log('🗑️ MessageId type:', typeof messageId)
      console.log('🗑️ MessageId length:', messageId?.length)
      
      // Validate UUID format
      if (!messageId || typeof messageId !== 'string') {
        throw new Error('Invalid messageId: must be a string')
      }
      
      // UUID should be 36 characters (8-4-4-4-12 format)
      if (messageId.length !== 36) {
        console.error('❌ Invalid UUID length:', messageId.length, 'Expected: 36')
        console.error('❌ MessageId value:', messageId)
        throw new Error(`Invalid UUID format: ${messageId}`)
      }
      
      // Gọi API xóa tin nhắn
      const { messageAPI } = await import('../services/api.js')
      const response = await messageAPI.deleteMessage(messageId)
      
      console.log('✅ Delete message response:', response)
      
      // Xóa khỏi state sau khi API thành công
      const messageIndex = state.messages.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        state.messages.splice(messageIndex, 1)
        console.log('✅ Message removed from state')
      }
      
      return true
    } catch (error) {
      console.error('❌ Failed to delete message:', error)
      console.error('Error details:', error.response?.data || error.message)
      throw error
    }
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

  // Pin/Unpin message
  function pinMessage(messageId) {
    const message = state.messages.find(m => m.id === messageId)
    if (message) {
      message.pinned = !message.pinned
      message.pinnedAt = message.pinned ? new Date().toISOString() : null
      return true
    }
    return false
  }

  // Reply management
  function setReplyTo(message) {
    console.log('🔵 setReplyTo called with:', message)
    console.log('🔵 Message ID:', message?.id)
    
    state.replyingTo = {
      id: message.id,
      text: message.text,
      author: message.author,
      media: message.media,
      voice: message.voice
    }
    
    console.log('🔵 State replyingTo after set:', state.replyingTo)
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

  // Typing indicators - with chat support
  function setTyping(userId, isTyping, chatId = null) {
    // Legacy support - global typing (deprecated)
    const index = state.typingUsers.indexOf(userId)
    if (isTyping && index === -1) {
      state.typingUsers.push(userId)
    } else if (!isTyping && index > -1) {
      state.typingUsers.splice(index, 1)
    }

    // New chat-specific typing
    if (chatId) {
      if (!state.typingByChat[chatId]) {
        state.typingByChat[chatId] = []
      }

      const chatTypingUsers = state.typingByChat[chatId]
      const chatIndex = chatTypingUsers.indexOf(userId)

      if (isTyping && chatIndex === -1) {
        chatTypingUsers.push(userId)
        console.log(`🔤 User ${userId} started typing in chat ${chatId}`)
      } else if (!isTyping && chatIndex > -1) {
        chatTypingUsers.splice(chatIndex, 1)
        console.log(`🔤 User ${userId} stopped typing in chat ${chatId}`)
        
        // Clean up empty arrays
        if (chatTypingUsers.length === 0) {
          delete state.typingByChat[chatId]
        }
      }
    }
  }

  // Get typing users for a specific chat
  function getTypingUsersForChat(chatId) {
    return state.typingByChat[chatId] || []
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

  // Load messages from API for a specific chat
  async function loadMessagesForChat(chatId, params = {}) {
    if (!chatId) return []

    console.log('🔍 loadMessagesForChat called for:', chatId, 'Stack trace:')
    console.trace()

    // Prevent duplicate loading for the same chat
    if (state.loadingChats.has(chatId)) {
      console.log('⏳ Already loading messages for chat:', chatId)
      return getMessagesForChat(chatId)
    }

    // If chat already loaded and no params (initial load), return cached messages
    if (state.loadedChats.has(chatId) && Object.keys(params).length === 0) {
      console.log('✅ Using cached messages for chat:', chatId)
      return getMessagesForChat(chatId)
    }

    state.loading = true
    state.loadingChats.add(chatId)

    try {
      // Import messageAPI dynamically to avoid circular dependency
      const { messageAPI } = await import('../services/api.js')

      const defaultParams = {
        page: 0,
        size: 50,
        sort: 'createdAt,desc'
      }

      console.log('📥 Loading messages for chat:', chatId, 'with params:', { ...defaultParams, ...params })
      const response = await messageAPI.getMessages(chatId, { ...defaultParams, ...params })
      console.log('📥 Messages API response:', response)

      setMessagesForChat(chatId, response)
      state.loadedChats.add(chatId)

      return getMessagesForChat(chatId)
    } catch (error) {
      console.error(`❌ Failed to load messages for chat ${chatId}:`, error)
      return []
    } finally {
      state.loading = false
      state.loadingChats.delete(chatId)
    }
  }

  // Load more messages (pagination)
  async function loadMoreMessages(chatId, page = 1, size = 50) {
    if (!chatId) return []

    try {
      const { messageAPI } = await import('../services/api.js')

      const response = await messageAPI.getMessages(chatId, {
        page,
        size,
        sort: 'createdAt,desc'
      })

      const responseData = response?.data || response
      const content = responseData?.content || []

      if (Array.isArray(content) && content.length > 0) {
        // Map and add older messages
        const mapped = content.map(message => {
          // Handle file/media data from API
          let media = null
          if (message.file && message.fileId) {
            // Use file object from API response
            media = {
              fileId: message.fileId,
              fileName: message.file.name,
              fileUrl: message.file.url,
              fileSize: message.file.size,
              contentType: message.file.contentType,
              type: message.type?.toLowerCase() || 'file'
            }
          } else if (message.fileId) {
            // Fallback if only fileId exists
            media = {
              fileId: message.fileId,
              fileName: 'Unknown file',
              fileUrl: null,
              fileSize: 0,
              contentType: null,
              type: message.type?.toLowerCase() || 'file'
            }
          }

          return {
            id: message.id,
            chatId: message.chatId || chatId,
            text: message.text || '',
            author: 'Unknown',
            authorId: message.authorId,
            timestamp: message.createdAt || new Date().toISOString(),
            at: message.createdAt || new Date().toISOString(),
            edited: message.createdAt !== message.updatedAt,
            editedAt: message.createdAt !== message.updatedAt ? message.updatedAt : null,
            reactions: [],
            replyTo: null,
            forwarded: null,
            readBy: [],
            media: media,
            voice: null,
            type: message.type?.toLowerCase() || 'text'
          }
        })

        // Insert older messages at the beginning
        const existingMessages = state.messages.filter(m => m.chatId === chatId)
        const newMessages = mapped.filter(newMsg =>
          !existingMessages.some(existing => existing.id === newMsg.id)
        )

        // Sort and insert at correct positions
        newMessages.forEach(newMessage => {
          const insertIndex = state.messages.findIndex(m =>
            m.chatId === chatId && new Date(m.timestamp) > new Date(newMessage.timestamp)
          )

          if (insertIndex === -1) {
            // Find the last message of this chat and insert after
            const lastChatMessageIndex = state.messages.map((m, i) => m.chatId === chatId ? i : -1)
              .filter(i => i !== -1).pop()

            if (lastChatMessageIndex !== undefined) {
              state.messages.splice(lastChatMessageIndex + 1, 0, newMessage)
            } else {
              state.messages.push(newMessage)
            }
          } else {
            state.messages.splice(insertIndex, 0, newMessage)
          }
        })

        // Resolve author names
        resolveMessageAuthors(newMessages)

        return newMessages
      }

      return []
    } catch (error) {
      console.error(`Failed to load more messages for chat ${chatId}:`, error)
      return []
    }
  }

  // Clear messages cache for a specific chat (useful for forcing refresh)
  function clearMessagesCache(chatId) {
    if (chatId) {
      state.loadedChats.delete(chatId)
      console.log('🗑️ Cleared messages cache for chat:', chatId)
    } else {
      state.loadedChats.clear()
      console.log('🗑️ Cleared all messages cache')
    }
  }

  return {
    state,

    // User info
    getCurrentUser,
    initializeMockData,

    // Message operations
    setMessagesForChat,
    loadMessagesForChat,
    loadMoreMessages,
    clearMessagesCache,
    addMessage,
    removeMessage,
    editMessage,
    deleteMessage,
    undoDelete,

    // Reactions
    addReaction,
    removeReaction,

    // Pin messages
    pinMessage,

    // Replies
    setReplyTo,
    clearReply,

    // Editing
    startEdit,
    cancelEdit,

    // Typing
    setTyping,
    getTypingUsersForChat,

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
    resolveMessageAuthors,

    // Computed
    currentChatMessages,
    hasSelectedMessages,
    selectedMessagesData,
    typingUsersNames
  }
}