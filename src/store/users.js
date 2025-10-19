import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref(new Map())
  const currentUser = ref(null)
  const isLoading = ref(false)

  // Mock current user data
  const mockCurrentUser = {
    id: 'current_user',
    name: 'Current User',
    username: 'current_user',
    email: 'current@example.com',
    avatar: null,
    bio: 'This is the current user',
    isOnline: true,
    lastSeen: null
  }

  // Computed
  const allUsers = computed(() => Array.from(users.value.values()))
  const onlineUsers = computed(() => allUsers.value.filter(user => user.isOnline))
  const offlineUsers = computed(() => allUsers.value.filter(user => !user.isOnline))

  // Actions
  const loadCurrentUser = async () => {
    isLoading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Load from localStorage or use mock data
      const saved = localStorage.getItem('currentUser')
      if (saved) {
        currentUser.value = JSON.parse(saved)
      } else {
        currentUser.value = mockCurrentUser
        saveCurrentUser()
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
      currentUser.value = mockCurrentUser
    } finally {
      isLoading.value = false
    }
  }

  const saveCurrentUser = () => {
    try {
      if (currentUser.value) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      }
    } catch (error) {
      console.error('Failed to save current user:', error)
    }
  }

  const getUserById = (userId) => {
    return users.value.get(userId)
  }

  const addUser = (user) => {
    users.value.set(user.id, user)
  }

  const addUsers = (userList) => {
    userList.forEach(user => {
      users.value.set(user.id, user)
    })
  }

  const updateUser = (userId, updates) => {
    const user = users.value.get(userId)
    if (user) {
      const updatedUser = { ...user, ...updates }
      users.value.set(userId, updatedUser)
      return updatedUser
    }
    return null
  }

  const updateUserOnlineStatus = (userId, isOnline) => {
    const user = users.value.get(userId)
    if (user) {
      const updates = {
        isOnline,
        lastSeen: isOnline ? null : new Date().toISOString()
      }
      return updateUser(userId, updates)
    }
    return null
  }

  const removeUser = (userId) => {
    return users.value.delete(userId)
  }

  const searchUsers = (query) => {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = query.toLowerCase()
    return allUsers.value.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      (user.email && user.email.toLowerCase().includes(searchTerm))
    )
  }

  const getUsersByIds = (userIds) => {
    return userIds.map(id => users.value.get(id)).filter(Boolean)
  }

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never'
    
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return date.toLocaleDateString()
  }

  const updateCurrentUser = (updates) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates }
      saveCurrentUser()
    }
  }

  // Initialize store
  const init = () => {
    loadCurrentUser()
  }

  return {
    // State
    users,
    currentUser,
    isLoading,
    
    // Computed
    allUsers,
    onlineUsers,
    offlineUsers,
    
    // Actions
    loadCurrentUser,
    getUserById,
    addUser,
    addUsers,
    updateUser,
    updateUserOnlineStatus,
    removeUser,
    searchUsers,
    getUsersByIds,
    formatLastSeen,
    updateCurrentUser,
    init
  }
})