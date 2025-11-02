import { reactive, computed } from 'vue'

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  INFO: 'info',
  MESSAGE: 'message', // New chat message
  SYSTEM: 'system'    // System notifications
}

// Notification state
const state = reactive({
  notifications: [],
  unreadCount: 0,
  isVisible: false,
  settings: {
    enableSound: true,
    enableDesktop: true,
    enableInApp: true,
    autoHide: true,
    hideDelay: 5000
  }
})

export function useNotificationsStore() {
  
  // Add new notification
  function addNotification(notification) {
    const newNotification = {
      id: generateId(),
      type: notification.type || NOTIFICATION_TYPES.INFO,
      title: notification.title || '',
      message: notification.message || '',
      description: notification.description || '',
      icon: notification.icon || null,
      avatar: notification.avatar || null,
      timestamp: new Date().toISOString(),
      read: false,
      persistent: notification.persistent || false,
      actions: notification.actions || [],
      data: notification.data || {},
      chatId: notification.chatId || null,
      userId: notification.userId || null
    }

    // Add to beginning of array (newest first)
    state.notifications.unshift(newNotification)
    
    // Update unread count
    updateUnreadCount()

    // Show desktop notification if enabled
    if (state.settings.enableDesktop && !notification.silent) {
      showDesktopNotification(newNotification)
    }

    // Play sound if enabled
    if (state.settings.enableSound && !notification.silent) {
      playNotificationSound(newNotification.type)
    }

    // Auto hide if not persistent
    if (!newNotification.persistent && state.settings.autoHide) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, state.settings.hideDelay)
    }

    return newNotification
  }

  // Remove notification
  function removeNotification(id) {
    const index = state.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      state.notifications.splice(index, 1)
      updateUnreadCount()
    }
  }

  // Mark notification as read
  function markAsRead(id) {
    const notification = state.notifications.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      updateUnreadCount()
    }
  }

  // Mark all as read
  function markAllAsRead() {
    state.notifications.forEach(n => {
      n.read = true
    })
    updateUnreadCount()
  }

  // Clear all notifications
  function clearAll() {
    state.notifications = []
    updateUnreadCount()
  }

  // Clear read notifications
  function clearRead() {
    state.notifications = state.notifications.filter(n => !n.read)
    updateUnreadCount()
  }

  // Update unread count
  function updateUnreadCount() {
    state.unreadCount = state.notifications.filter(n => !n.read).length
  }

  // Show/hide notification panel
  function toggleVisibility() {
    state.isVisible = !state.isVisible
  }

  function showPanel() {
    state.isVisible = true
  }

  function hidePanel() {
    state.isVisible = false
  }

  // Notification shortcuts for common types
  function showSuccess(title, message, options = {}) {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options
    })
  }

  function showError(title, message, options = {}) {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    })
  }

  function showWarning(title, message, options = {}) {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      ...options
    })
  }

  function showInfo(title, message, options = {}) {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options
    })
  }

  // Chat message notification
  function showMessageNotification(messageData) {
    return addNotification({
      type: NOTIFICATION_TYPES.MESSAGE,
      title: messageData.senderName || 'Tin nhắn mới',
      message: messageData.text || 'Bạn có tin nhắn mới',
      avatar: messageData.senderAvatar,
      chatId: messageData.chatId,
      userId: messageData.senderId,
      data: messageData,
      actions: [
        {
          label: 'Trả lời',
          action: 'reply',
          primary: true
        },
        {
          label: 'Xem',
          action: 'view'
        }
      ]
    })
  }

  // System notification
  function showSystemNotification(title, message, options = {}) {
    return addNotification({
      type: NOTIFICATION_TYPES.SYSTEM,
      title,
      message,
      icon: 'system',
      ...options
    })
  }

  // Desktop notification
  function showDesktopNotification(notification) {
    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message,
        icon: notification.avatar || '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.persistent
      })

      desktopNotif.onclick = () => {
        window.focus()
        markAsRead(notification.id)
        
        // Handle click action based on notification type
        if (notification.type === NOTIFICATION_TYPES.MESSAGE && notification.chatId) {
          // Navigate to chat - would need router integration
          console.log('Navigate to chat:', notification.chatId)
        }
        
        desktopNotif.close()
      }
    }
  }

  // Request desktop notification permission
  async function requestDesktopPermission() {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return Notification.permission === 'granted'
  }

  // Play notification sound
  function playNotificationSound(type) {
    try {
      const audio = new Audio()
      
      // Different sounds for different types
      switch (type) {
        case NOTIFICATION_TYPES.MESSAGE:
          audio.src = '/sounds/message.mp3'
          break
        case NOTIFICATION_TYPES.ERROR:
          audio.src = '/sounds/error.mp3'
          break
        case NOTIFICATION_TYPES.SUCCESS:
          audio.src = '/sounds/success.mp3'
          break
        default:
          audio.src = '/sounds/notification.mp3'
      }
      
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }

  // Update settings
  function updateSettings(newSettings) {
    Object.assign(state.settings, newSettings)
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(state.settings))
  }

  // Load settings from localStorage
  function loadSettings() {
    try {
      const saved = localStorage.getItem('notificationSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        Object.assign(state.settings, settings)
      }
    } catch (error) {
      console.warn('Could not load notification settings:', error)
    }
  }

  // Computed properties
  const unreadNotifications = computed(() => {
    return state.notifications.filter(n => !n.read)
  })

  const recentNotifications = computed(() => {
    return state.notifications.slice(0, 10)
  })

  const messageNotifications = computed(() => {
    return state.notifications.filter(n => n.type === NOTIFICATION_TYPES.MESSAGE)
  })

  const systemNotifications = computed(() => {
    return state.notifications.filter(n => n.type === NOTIFICATION_TYPES.SYSTEM)
  })

  // Utility functions
  function generateId() {
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  function getNotificationById(id) {
    return state.notifications.find(n => n.id === id)
  }

  // Initialize
  function init() {
    loadSettings()
    
    // Request desktop permission if enabled
    if (state.settings.enableDesktop) {
      requestDesktopPermission()
    }
  }

  return {
    state,
    
    // Core functions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead,
    
    // Panel visibility
    toggleVisibility,
    showPanel,
    hidePanel,
    
    // Shortcuts
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showMessageNotification,
    showSystemNotification,
    
    // Settings
    updateSettings,
    loadSettings,
    requestDesktopPermission,
    
    // Computed
    unreadNotifications,
    recentNotifications,
    messageNotifications,
    systemNotifications,
    
    // Utilities
    getNotificationById,
    init
  }
}