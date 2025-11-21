import { reactive } from 'vue'
import { stompService } from '../services/stompService'

// User presence state
const state = reactive({
  onlineUsers: new Set(), // Set of user IDs that are online
  userStatuses: {}, // Map of userId -> { status: 'online'|'offline', lastSeen: timestamp }
  subscriptionId: null
})

export function usePresenceStore() {
  // Set user as online
  function setUserOnline(userId) {
    if (!userId) return
    
    state.onlineUsers.add(userId)
    state.userStatuses[userId] = {
      status: 'online',
      lastSeen: new Date().toISOString()
    }
    
    console.log('👤 User is online:', userId)
  }

  // Set user as offline
  function setUserOffline(userId) {
    if (!userId) return
    
    state.onlineUsers.delete(userId)
    state.userStatuses[userId] = {
      status: 'offline',
      lastSeen: new Date().toISOString()
    }
    
    console.log('👤 User is offline:', userId)
  }

  // Check if user is online
  function isUserOnline(userId) {
    return state.onlineUsers.has(userId)
  }

  // Get user status
  function getUserStatus(userId) {
    return state.userStatuses[userId] || { status: 'offline', lastSeen: null }
  }

  // Subscribe to presence updates
  function subscribeToPresence() {
    if (state.subscriptionId) {
      console.log('⚠️ Already subscribed to presence updates')
      return
    }

    // Subscribe to user presence topic
    const presenceDestination = '/user/topic/presence'
    console.log('📡 Subscribing to presence updates:', presenceDestination)

    const subscriptionId = stompService.subscribe(presenceDestination, (presenceData) => {
      console.log('👥 Received presence update:', presenceData)

      if (presenceData && presenceData.userId) {
        const { userId, status, lastSeen } = presenceData

        if (status === 'online') {
          setUserOnline(userId)
        } else if (status === 'offline') {
          setUserOffline(userId)
        }

        // Update status details
        state.userStatuses[userId] = {
          status: status || 'offline',
          lastSeen: lastSeen || new Date().toISOString()
        }
      }
    })

    if (subscriptionId) {
      state.subscriptionId = subscriptionId
      console.log('✅ Subscribed to presence updates')
    }
  }

  // Unsubscribe from presence updates
  function unsubscribeFromPresence() {
    if (state.subscriptionId) {
      stompService.unsubscribe(state.subscriptionId)
      state.subscriptionId = null
      console.log('🔕 Unsubscribed from presence updates')
    }
  }

  // Send online status to server
  function sendOnlineStatus() {
    if (!stompService.isConnected()) {
      console.log('⚠️ Cannot send online status - not connected')
      return
    }

    const payload = {
      status: 'online',
      timestamp: new Date().toISOString()
    }

    console.log('📤 Sending online status:', payload)
    stompService.send('/app/presence/online', payload)
  }

  // Send offline status to server
  function sendOfflineStatus() {
    if (!stompService.isConnected()) {
      console.log('⚠️ Cannot send offline status - not connected')
      return
    }

    const payload = {
      status: 'offline',
      timestamp: new Date().toISOString()
    }

    console.log('📤 Sending offline status:', payload)
    stompService.send('/app/presence/offline', payload)
  }

  // Clear all presence data
  function clearPresence() {
    state.onlineUsers.clear()
    state.userStatuses = {}
    console.log('🗑️ Cleared all presence data')
  }

  return {
    state,
    setUserOnline,
    setUserOffline,
    isUserOnline,
    getUserStatus,
    subscribeToPresence,
    unsubscribeFromPresence,
    sendOnlineStatus,
    sendOfflineStatus,
    clearPresence
  }
}
