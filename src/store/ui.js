import { reactive, computed } from 'vue'

// UI state management for modals, context menus, and interactions
const state = reactive({
  // Modal states
  modals: {
    search: false,
    forward: false,
    settings: false,
    reactions: false,
    mediaPreview: false,
    voiceRecorder: false,
    keyboardShortcuts: false
  },
  
  // Context menu state
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
    options: []
  },
  
  // Media preview state
  mediaPreview: {
    visible: false,
    currentIndex: 0,
    items: []
  },
  
  // Voice recorder state
  voiceRecorder: {
    isRecording: false,
    duration: 0,
    waveform: [],
    audioBlob: null
  },
  
  // Search state
  search: {
    query: '',
    filters: {
      author: null,
      dateRange: null,
      type: null,
      chatId: null
    },
    results: [],
    isSearching: false,
    selectedResult: null
  },
  
  // Forward state
  forward: {
    selectedMessages: [],
    selectedChats: [],
    searchQuery: ''
  },
  
  // Notification state
  notifications: [],
  
  // Loading states
  loading: {
    messages: false,
    upload: false,
    search: false
  },
  
  // Theme and appearance
  theme: {
    mode: 'light', // light, dark, auto
    chatBackground: null,
    fontSize: 'medium' // small, medium, large
  },
  
  // Keyboard shortcuts
  shortcuts: {
    enabled: true,
    customShortcuts: {}
  }
})

export function useUIStore() {
  // Modal management
  function openModal(modalName, data = null) {
    // Close other modals first
    Object.keys(state.modals).forEach(key => {
      state.modals[key] = false
    })
    
    state.modals[modalName] = true
    
    // Set modal-specific data
    if (modalName === 'forward' && data) {
      state.forward.selectedMessages = data.messages || []
    }
    
    if (modalName === 'mediaPreview' && data) {
      state.mediaPreview.items = data.items || []
      state.mediaPreview.currentIndex = data.currentIndex || 0
    }
  }

  function closeModal(modalName) {
    if (modalName) {
      state.modals[modalName] = false
    } else {
      // Close all modals
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false
      })
    }
    
    // Reset modal-specific state
    if (modalName === 'forward') {
      state.forward.selectedMessages = []
      state.forward.selectedChats = []
      state.forward.searchQuery = ''
    }
    
    if (modalName === 'search') {
      state.search.query = ''
      state.search.results = []
      state.search.selectedResult = null
    }
  }

  function toggleModal(modalName) {
    if (state.modals[modalName]) {
      closeModal(modalName)
    } else {
      openModal(modalName)
    }
  }

  // Context menu management
  function showContextMenu(x, y, messageId, options = []) {
    state.contextMenu = {
      visible: true,
      x,
      y,
      messageId,
      options
    }
  }

  function hideContextMenu() {
    state.contextMenu.visible = false
    state.contextMenu.messageId = null
    state.contextMenu.options = []
  }

  // Media preview management
  function openMediaPreview(items, currentIndex = 0) {
    state.mediaPreview = {
      visible: true,
      items,
      currentIndex
    }
    openModal('mediaPreview')
  }

  function closeMediaPreview() {
    state.mediaPreview.visible = false
    closeModal('mediaPreview')
  }

  function nextMediaItem() {
    if (state.mediaPreview.currentIndex < state.mediaPreview.items.length - 1) {
      state.mediaPreview.currentIndex++
    }
  }

  function prevMediaItem() {
    if (state.mediaPreview.currentIndex > 0) {
      state.mediaPreview.currentIndex--
    }
  }

  // Voice recorder management
  function startVoiceRecording() {
    state.voiceRecorder = {
      isRecording: true,
      duration: 0,
      waveform: [],
      audioBlob: null
    }
  }

  function stopVoiceRecording(audioBlob) {
    state.voiceRecorder.isRecording = false
    state.voiceRecorder.audioBlob = audioBlob
  }

  function cancelVoiceRecording() {
    state.voiceRecorder = {
      isRecording: false,
      duration: 0,
      waveform: [],
      audioBlob: null
    }
  }

  function updateVoiceRecording(duration, waveform) {
    state.voiceRecorder.duration = duration
    state.voiceRecorder.waveform = waveform
  }

  // Search management
  function setSearchQuery(query) {
    state.search.query = query
  }

  function setSearchFilters(filters) {
    state.search.filters = { ...state.search.filters, ...filters }
  }

  function setSearchResults(results) {
    state.search.results = results
  }

  function setSearching(isSearching) {
    state.search.isSearching = isSearching
  }

  function selectSearchResult(result) {
    state.search.selectedResult = result
  }

  // Forward management
  function setForwardMessages(messages) {
    state.forward.selectedMessages = messages
  }

  function toggleForwardChat(chatId) {
    const index = state.forward.selectedChats.indexOf(chatId)
    if (index > -1) {
      state.forward.selectedChats.splice(index, 1)
    } else {
      state.forward.selectedChats.push(chatId)
    }
  }

  function setForwardSearchQuery(query) {
    state.forward.searchQuery = query
  }

  // Notification management
  function addNotification(notification) {
    const id = Date.now().toString()
    const newNotification = {
      id,
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      duration: 5000,
      ...notification
    }
    
    state.notifications.push(newNotification)
    
    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }

  function removeNotification(id) {
    const index = state.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      state.notifications.splice(index, 1)
    }
  }

  function clearNotifications() {
    state.notifications = []
  }

  // Loading states
  function setLoading(key, isLoading) {
    state.loading[key] = isLoading
  }

  // Theme management
  function setTheme(theme) {
    state.theme.mode = theme
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
  }

  function setChatBackground(background) {
    state.theme.chatBackground = background
  }

  function setFontSize(size) {
    state.theme.fontSize = size
    document.documentElement.setAttribute('data-font-size', size)
  }

  // Keyboard shortcuts
  function enableShortcuts() {
    state.shortcuts.enabled = true
  }

  function disableShortcuts() {
    state.shortcuts.enabled = false
  }

  function setCustomShortcut(action, keys) {
    state.shortcuts.customShortcuts[action] = keys
  }

  // Computed properties
  const hasOpenModal = computed(() => {
    return Object.values(state.modals).some(isOpen => isOpen)
  })

  const currentMediaItem = computed(() => {
    if (state.mediaPreview.items.length > 0) {
      return state.mediaPreview.items[state.mediaPreview.currentIndex]
    }
    return null
  })

  const hasNotifications = computed(() => {
    return state.notifications.length > 0
  })

  const isLoading = computed(() => {
    return Object.values(state.loading).some(loading => loading)
  })

  // Keyboard event handler
  function handleKeyboardShortcut(event) {
    if (!state.shortcuts.enabled) return false
    
    const { ctrlKey, metaKey, shiftKey, altKey, key } = event
    const modifier = ctrlKey || metaKey
    
    // Global shortcuts
    if (modifier && key === 'k') {
      event.preventDefault()
      openModal('search')
      return true
    }
    
    if (modifier && key === 'f') {
      event.preventDefault()
      openModal('search')
      return true
    }
    
    if (key === 'Escape') {
      event.preventDefault()
      if (hasOpenModal.value) {
        closeModal()
      } else if (state.contextMenu.visible) {
        hideContextMenu()
      }
      return true
    }
    
    if (modifier && key === '?') {
      event.preventDefault()
      openModal('keyboardShortcuts')
      return true
    }
    
    return false
  }

  return {
    state,
    
    // Modal management
    openModal,
    closeModal,
    toggleModal,
    
    // Context menu
    showContextMenu,
    hideContextMenu,
    
    // Media preview
    openMediaPreview,
    closeMediaPreview,
    nextMediaItem,
    prevMediaItem,
    
    // Voice recorder
    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording,
    updateVoiceRecording,
    
    // Search
    setSearchQuery,
    setSearchFilters,
    setSearchResults,
    setSearching,
    selectSearchResult,
    
    // Forward
    setForwardMessages,
    toggleForwardChat,
    setForwardSearchQuery,
    
    // Notifications
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Loading
    setLoading,
    
    // Theme
    setTheme,
    setChatBackground,
    setFontSize,
    
    // Shortcuts
    enableShortcuts,
    disableShortcuts,
    setCustomShortcut,
    handleKeyboardShortcut,
    
    // Computed
    hasOpenModal,
    currentMediaItem,
    hasNotifications,
    isLoading
  }
}