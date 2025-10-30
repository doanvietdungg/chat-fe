import { reactive, computed } from 'vue'
import { chatService } from '../services/chatService'

const state = reactive({
  query: '',
  chats: [], // Start with empty array, will be populated from API or fallback to mock
  activeChatId: null,
  loading: false
})

// Ensure chats is always an array
if (!Array.isArray(state.chats)) {
  state.chats = []
}

export function useChatsStore() {
  // Initialize with sample data (fallback when API fails)
  function initSampleData() {
    console.log('Initializing sample chat data...')

    // Ensure we create valid chat objects with all required properties
    const sampleChats = [
      {
        id: 'friend-1',
        type: 'private',
        title: 'Linh Nguyễn',
        last: 'Hẹn gặp chiều nay nhé! 😊',
        unread: 2,
        pinned: false,
        muted: false,
        lastMessageTime: new Date(Date.now() - 300000).toISOString(),
        avatar: null,
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'friend-2',
        type: 'private',
        title: 'Minh Trần',
        last: 'Code review xong chưa?',
        unread: 0,
        pinned: true,
        muted: false,
        lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
        avatar: null,
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'group-1',
        type: 'group',
        title: 'Team Frontend',
        last: 'Ai có thể review PR #123?',
        unread: 5,
        pinned: false,
        muted: false,
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        avatar: null,
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // Validate each chat object before adding
    state.chats = sampleChats.filter(chat => chat && chat.id && chat.title)

    console.log('Sample chats created:', state.chats.length)

    // Set first chat as active
    if (state.chats.length > 0 && !state.activeChatId) {
      state.activeChatId = state.chats[0].id
      console.log('Set active chat:', state.activeChatId)
    }
  }
  function setActive(id) {
    if (!id) return
    state.activeChatId = id
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.unread = 0
  }

  function createGroup(title = 'New Group') {
    const id = `group-${Date.now()}`
    state.chats.unshift({ id, type: 'group', title, last: 'Group created', unread: 0, pinned: false, muted: false, notificationLevel: 'all' })
    state.activeChatId = id
  }

  function createChannel(title = 'New Channel') {
    const id = `channel-${Date.now()}`
    state.chats.unshift({ id, type: 'channel', title, last: 'Channel created', unread: 0, pinned: true, muted: false, notificationLevel: 'mentions' })
    state.activeChatId = id
  }

  function togglePin(id) {
    if (!id) return
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.pinned = !c.pinned
  }

  function toggleMute(id) {
    if (!id) return
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.muted = !c.muted
  }

  function setNotificationLevel(id, level) {
    if (!id) return
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.notificationLevel = level
  }

  function setSearch(q) {
    state.query = q
  }

  function addChat(chat) {
    if (!chat || !chat.id) return

    // Normalize chat data to ensure consistent format
    const normalizedChat = {
      id: chat.id,
      type: (chat.type || 'private').toLowerCase(),
      title: chat.title || chat.name || 'Unknown Chat',
      last: chat.last || '',
      unread: chat.unread || 0,
      pinned: chat.pinned || false,
      muted: chat.muted || false,
      avatar: chat.avatar || null,
      isOnline: chat.isOnline || false,
      isTyping: chat.isTyping || false,
      participants: chat.participants || [],
      createdAt: chat.createdAt || new Date().toISOString(),
      updatedAt: chat.updatedAt || new Date().toISOString(),
      lastMessageTime: chat.lastMessageTime || chat.updatedAt || chat.createdAt || new Date().toISOString(),
      isDraft: chat.isDraft || false,
      ...chat // Keep any additional properties
    }

    const existingIndex = state.chats.findIndex(c => c && c.id === chat.id)
    if (existingIndex !== -1) {
      // Update existing chat
      state.chats[existingIndex] = { ...state.chats[existingIndex], ...normalizedChat }
    } else {
      // Add new chat to the beginning
      state.chats.unshift(normalizedChat)
    }
  }

  // Replace a draft chat with a real chat from API (preserve ordering and active state)
  function replaceChat(oldId, newChat) {
    if (!oldId || !newChat || !newChat.id) return

    // Normalize the new chat data
    const normalizedChat = {
      id: newChat.id,
      type: (newChat.type || 'private').toLowerCase(),
      title: newChat.title || newChat.name || 'Unknown Chat',
      last: newChat.last || '',
      unread: newChat.unread || 0,
      pinned: newChat.pinned || false,
      muted: newChat.muted || false,
      avatar: newChat.avatar || null,
      isOnline: newChat.isOnline || false,
      isTyping: newChat.isTyping || false,
      participants: newChat.participants || [],
      createdAt: newChat.createdAt || new Date().toISOString(),
      updatedAt: newChat.updatedAt || new Date().toISOString(),
      lastMessageTime: newChat.lastMessageTime || newChat.updatedAt || newChat.createdAt || new Date().toISOString(),
      isDraft: false, // Real chat is never draft
      ...newChat // Keep any additional properties
    }

    const index = state.chats.findIndex(c => c && c.id === oldId)
    if (index !== -1) {
      state.chats.splice(index, 1, normalizedChat)
    } else {
      state.chats.unshift(normalizedChat)
    }

    // Update active chat ID if the old one was active
    if (state.activeChatId === oldId) {
      state.activeChatId = normalizedChat.id
    }
  }

  function findChatByUserId(userId) {
    if (!userId) return null

    return state.chats.find(chat => {
      if (!chat || chat.type !== 'private') return false

      // Check if this is a private chat with the specified user
      if (Array.isArray(chat.participants)) {
        // For API chats, participants might be user objects or IDs
        return chat.participants.some(participant => {
          const participantId = typeof participant === 'object' ? participant.userId || participant.id : participant
          return participantId === userId
        })
      }

      // Fallback: check if chat title matches user (for simple cases)
      return false
    })
  }

  function setActiveChat(chatId) {
    setActive(chatId)
  }

  function removeChat(chatId) {
    const index = state.chats.findIndex(c => c && c.id === chatId)
    if (index !== -1) {
      state.chats.splice(index, 1)
      if (state.activeChatId === chatId) {
        state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null
      }
    }
  }

  // Update chat's last message and timestamp
  function updateChatLastMessage(chatId, message) {
    const chat = state.chats.find(c => c && c.id === chatId)
    if (chat) {
      chat.last = message.text || ''
      chat.lastMessageTime = message.timestamp || message.createdAt || new Date().toISOString()

      // Move chat to top of list
      const index = state.chats.indexOf(chat)
      if (index > 0) {
        state.chats.splice(index, 1)
        state.chats.unshift(chat)
      }
    }
  }

  // Increment unread count for a chat
  function incrementUnread(chatId) {
    const chat = state.chats.find(c => c && c.id === chatId)
    if (chat && chat.id !== state.activeChatId) {
      chat.unread = (chat.unread || 0) + 1
    }
  }

  // Clear unread count for a chat
  function clearUnread(chatId) {
    const chat = state.chats.find(c => c && c.id === chatId)
    if (chat) {
      chat.unread = 0
    }
  }

  // Force stop loading (for debugging)
  function stopLoading() {
    console.log('Force stopping loading state')
    state.loading = false
  }

  // Load chats from API and return chat IDs for subscription
  async function loadChats() {
    console.log('Starting loadChats...')
    state.loading = true

    // Check if user is authenticated
    const authToken = localStorage.getItem('auth_token')
    if (!authToken) {
      console.log('No auth token found, keeping empty state')
      state.loading = false
      return []
    }

    try {
      // Clear existing chats before loading from API
      state.chats = []

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API timeout after 10 seconds')), 10000)
      })

      // Call API to get chats with timeout
      const apiPromise = chatService.getChats()
      const response = await Promise.race([apiPromise, timeoutPromise])

      console.log('Raw API response:', response)

      // Handle response structure: { success: true, data: { content: [...] } }
      const responseData = response?.data || response
      const dataNode = responseData?.data || responseData
      const chats = dataNode?.content || []

      console.log('Extracted chats:', chats)
      console.log('Loaded chats from API:', chats.length)

      if (Array.isArray(chats) && chats.length > 0) {
        // Map API chats to local format
        const mappedChats = chats.map(chat => ({
          id: chat.id,
          type: (chat.type || 'PRIVATE').toLowerCase(),
          title: chat.title || chat.name || 'Unknown Chat',
          last: '', // Will be populated when messages are loaded
          unread: 0, // Will be calculated from messages
          pinned: false,
          muted: false,
          avatar: null,
          isOnline: false,
          isTyping: false,
          participants: chat.participants || [],
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          createdBy: chat.createdBy,
          description: chat.description,
          lastMessageTime: chat.updatedAt || chat.createdAt
        }))

        console.log('Mapped chats:', mappedChats)

        // Sort by most recent first
        mappedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))

        // Replace mock data with API data
        state.chats = mappedChats

        // Set first chat as active if no active chat
        if (!state.activeChatId && mappedChats.length > 0) {
          state.activeChatId = mappedChats[0].id
        }

        console.log('Successfully loaded', mappedChats.length, 'chats from API')
        // Return chat IDs for WebSocket subscription
        return mappedChats.map(chat => chat.id)
      } else {
        console.log('No chats found in API response')
        // Keep empty state, don't auto-create sample data
      }
    } catch (error) {
      console.error('Failed to load chats from API:', error.message)
      console.error('Error details:', error)

      // Don't auto-create sample data on error
      console.log('API failed, keeping empty state')
    } finally {
      console.log('Setting loading to false')
      state.loading = false
    }

    // Return existing chat IDs for subscription (mock or API)
    const chatIds = state.chats.map(chat => chat.id).filter(Boolean)
    console.log('Returning chat IDs:', chatIds)
    return chatIds
  }

  const filtered = computed(() => {
    try {
      const q = (state.query || '').trim().toLowerCase()
      // Ensure state.chats is always an array and filter out invalid entries
      const chatsArray = Array.isArray(state.chats) ? state.chats : []
      const validChats = chatsArray.filter(c => c && typeof c === 'object' && c.id && c.title)

      const items = q
        ? validChats.filter(c => c.title && c.title.toLowerCase().includes(q))
        : validChats.slice()

      // pinned first then by unread desc, with safe property access
      const sorted = items.sort((a, b) => {
        const aPinned = a && a.pinned ? 1 : 0
        const bPinned = b && b.pinned ? 1 : 0
        const aUnread = a && a.unread ? a.unread : 0
        const bUnread = b && b.unread ? b.unread : 0

        return (bPinned - aPinned) || (bUnread - aUnread)
      })

      // Ensure we always return an array
      return Array.isArray(sorted) ? sorted : []
    } catch (error) {
      console.error('Error in filtered computed:', error)
      return []
    }
  })

  const activeChat = computed(() => state.chats.find(c => c && c.id === state.activeChatId))

  // Don't initialize sample data automatically
  // Only use sample data as fallback when API fails

  // 🔥 MOVE CHAT TO TOP OF LIST
  function moveToTop(chatId) {
    if (!chatId) return

    const chatIndex = state.chats.findIndex(c => c && c.id === chatId)
    if (chatIndex > 0) { // Only move if not already at top
      const chat = state.chats[chatIndex]
      // Remove from current position
      state.chats.splice(chatIndex, 1)
      // Add to top
      state.chats.unshift(chat)
      console.log(`📌 Moved chat "${chat.title}" to top`)
    }
  }

  return {
    state,
    filtered,
    activeChat,
    setActive,
    createGroup,
    createChannel,
    togglePin,
    toggleMute,
    setNotificationLevel,
    setSearch,
    addChat,
    replaceChat,
    findChatByUserId,
    setActiveChat,
    removeChat,
    loadChats,
    updateChatLastMessage,
    incrementUnread,
    clearUnread,
    stopLoading,
    initSampleData,
    moveToTop
  }
}


