import { reactive } from 'vue'
import { stompService } from '../services/stompService'
import { useChatStore } from './chat'
import { useChatsStore } from './chats'
import { useAuthStore } from './auth'

// Load presence state from localStorage
function loadPresenceFromStorage() {
  try {
    const saved = localStorage.getItem('presence_state')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Only use if saved within last 5 minutes (prevent stale data)
      const savedTime = parsed.timestamp || 0
      const now = Date.now()
      if (now - savedTime < 5 * 60 * 1000) {
        return {
          onlineUsers: parsed.onlineUsers || {},
          userStatuses: parsed.userStatuses || {}
        }
      }
    }
  } catch (error) {
    console.error('Failed to load presence from storage:', error)
  }
  return { onlineUsers: {}, userStatuses: {} }
}

// Save presence state to localStorage
function savePresenceToStorage(onlineUsers, userStatuses) {
  try {
    localStorage.setItem('presence_state', JSON.stringify({
      onlineUsers,
      userStatuses,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Failed to save presence to storage:', error)
  }
}

// User presence state
const initialState = loadPresenceFromStorage()
const state = reactive({
  onlineUsers: initialState.onlineUsers, // Changed from Set to Object: { userId: true }
  userStatuses: initialState.userStatuses, // Map of userId -> { status: 'online'|'offline', lastSeen: timestamp }
  subscriptionId: null
})

export function usePresenceStore() {
  // Set user as online
  function setUserOnline(userId) {
    if (!userId) return
    
    // Create new object to trigger Vue reactivity
    state.onlineUsers = { ...state.onlineUsers, [userId]: true }
    state.userStatuses = {
      ...state.userStatuses,
      [userId]: {
        status: 'ONLINE',
        lastSeen: new Date().toISOString()
      }
    }
    
    // Save to localStorage
    savePresenceToStorage(state.onlineUsers, state.userStatuses)
  }

  // Set user as offline
  function setUserOffline(userId) {
    if (!userId) return
    
    // Create new object to trigger Vue reactivity
    const { [userId]: removed, ...rest } = state.onlineUsers
    state.onlineUsers = rest
    
    state.userStatuses = {
      ...state.userStatuses,
      [userId]: {
        status: 'OFFLINE',
        lastSeen: new Date().toISOString()
      }
    }
    
    // Save to localStorage
    savePresenceToStorage(state.onlineUsers, state.userStatuses)
  }

  // Check if user is online
  function isUserOnline(userId) {
    return !!state.onlineUsers[userId]
  }

  // Get user status
  function getUserStatus(userId) {
    return state.userStatuses[userId] || { status: 'OFFLINE', lastSeen: null }
  }

  // Fetch initial presence for users in chat list
  async function fetchUserPresence() {
    try {
      const chatsStore = useChatsStore()
      const authStore = useAuthStore()
      const currentUserId = authStore.user?.id
      
      // Get all unique user IDs from private chats
      const userIds = new Set()
      chatsStore.state.chats.forEach(chat => {
        if (chat.type === 'private' || chat.type === 'PRIVATE') {
          chat.participants?.forEach(p => {
            if (p.id !== currentUserId) {
              userIds.add(p.id)
            }
          })
        }
      })

      if (userIds.size === 0) return

      // Option 1: Try WebSocket first (if backend supports /app/presence/request)
      if (stompService.client?.connected) {
        try {
          stompService.send('/app/presence/request', {
            userIds: Array.from(userIds)
          })
          return
        } catch (wsError) {
          console.warn('WebSocket presence request failed, falling back to REST API')
        }
      }

      // Option 2: Fallback to REST API (if backend has GET /api/presence/status)
      try {
        const response = await fetch(`/api/presence/status?userIds=${Array.from(userIds).join(',')}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        
        if (response.ok) {
          const presenceData = await response.json()
          // presenceData format: { "userId1": "ONLINE", "userId2": "OFFLINE", ... }
          Object.entries(presenceData).forEach(([userId, status]) => {
            if (status === 'ONLINE') {
              setUserOnline(userId)
            } else {
              setUserOffline(userId)
            }
          })
        }
      } catch (apiError) {
        console.warn('REST API presence fetch failed:', apiError)
      }
    } catch (error) {
      console.error('Error fetching user presence:', error)
    }
  }

  // Subscribe to presence updates
  // NOTE: Presence events are now received via /topic/chats/{chatId}/events
  // This function is kept for backward compatibility but may not be needed
  function subscribeToPresence() {
    // Presence is now handled per-chat via chat events subscription
    // No need for global /topic/presence subscription
    
    // Fetch initial presence state for users in chat list
    setTimeout(() => {
      fetchUserPresence()
    }, 500)
  }

  // Check if user is in the current chat
  function checkUserInCurrentChat(userId) {
    try {
      const chatStore = useChatStore()
      const chatsStore = useChatsStore()
      const authStore = useAuthStore()
      
      const currentChatId = chatStore.state.currentChatId
      if (!currentChatId) {
        console.log('⚠️ No current chat open')
        return false
      }
      
      // Get current chat
      console.log('🔍 All chats in store:', chatsStore.state.chats)
      console.log('🔍 Looking for chatId:', currentChatId)
      
      const currentChat = chatsStore.state.chats.find(c => c.id === currentChatId)
      if (!currentChat) {
        console.log('⚠️ Current chat not found:', currentChatId)
        return false
      }
      
      console.log('🔍 Found chat object:', JSON.parse(JSON.stringify(currentChat)))
      console.log('🔍 Chat participants (raw):', currentChat.participants)
      console.log('🔍 Chat participants (stringified):', JSON.stringify(currentChat.participants))
      console.log('🔍 Participants count:', currentChat.participants?.length)
      
      // For private chats, check if userId is the other participant
      if (currentChat.type === 'PRIVATE' || currentChat.type === 'private') {
        const currentUserId = authStore.user?.id
        
        // Check if userId is either participant in this private chat
        let isInChat = false
        
        // Method 1: From participants array
        if (currentChat.participants && currentChat.participants.length > 0) {
          isInChat = currentChat.participants.some(p => p.id === userId)
          console.log('👤 Checking participants:', currentChat.participants.map(p => ({ id: p.id, name: p.name })))
          console.log('👤 Looking for userId:', userId)
          console.log('👤 Found in participants:', isInChat)
          console.log('👤 Method 1 - Check in participants:', { userId, isInChat, participants: currentChat.participants })
        }
        
        // Method 2: If participants is empty, check against chat metadata
        if (!isInChat) {
          if (currentChat.otherUserId === userId || currentChat.recipientId === userId) {
            isInChat = true
            console.log('👤 Method 2 - Matched with otherUserId/recipientId')
          }
        }
        
        console.log('👥 Private chat check:', { currentUserId, targetUserId: userId, isInChat })
        return isInChat
      }
      
      // For group chats, check if userId is in participants
      if (currentChat.type === 'GROUP' || currentChat.type === 'group') {
        const isInGroup = currentChat.participants?.some(p => p.id === userId)
        console.log('👥 Group chat check:', { userId, isInGroup })
        return isInGroup
      }
      
      return false
    } catch (error) {
      console.error('❌ Error in checkUserInCurrentChat:', error)
      return false
    }
  }

  // Unsubscribe from presence updates
  // NOTE: No longer needed as presence is handled via chat events
  function unsubscribeFromPresence() {
    // No-op: presence is now handled per-chat
    if (state.subscriptionId) {
      stompService.unsubscribe(state.subscriptionId)
      state.subscriptionId = null
    }
  }

  // Send online status to server
  function sendOnlineStatus() {
    console.log('🟢 Attempting to send ONLINE status...')
    console.log('🟢 WebSocket connected?', stompService.client?.connected)
    
    if (!stompService.client?.connected) {
      console.log('⚠️ Cannot send online status - WebSocket not connected')
      return
    }

    const payload = {
      status: 'ONLINE'
    }

    console.log('📤 Sending ONLINE status to /app/presence:', payload)
    stompService.send('/app/presence', payload)
    console.log('✅ ONLINE status sent successfully')
  }

  // Send offline status to server
  function sendOfflineStatus() {
    console.log('🔴 Attempting to send OFFLINE status...')
    console.log('🔴 WebSocket connected?', stompService.client?.connected)
    
    if (!stompService.client?.connected) {
      console.log('⚠️ Cannot send offline status - WebSocket not connected')
      return
    }

    const payload = {
      status: 'OFFLINE'
    }

    console.log('📤 Sending OFFLINE status to /app/presence:', payload)
    stompService.send('/app/presence', payload)
    console.log('✅ OFFLINE status sent successfully')
  }

  // Clear all presence data
  function clearPresence() {
    state.onlineUsers = {}
    state.userStatuses = {}
    localStorage.removeItem('presence_state')
  }

  return {
    state,
    setUserOnline,
    setUserOffline,
    isUserOnline,
    getUserStatus,
    fetchUserPresence,
    subscribeToPresence,
    unsubscribeFromPresence,
    sendOnlineStatus,
    sendOfflineStatus,
    clearPresence
  }
}
