import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { contactService } from '../services/contactService.js'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref(new Map())
  const currentUser = ref(null)
  const isLoading = ref(false)
  const loadingUserIds = ref(new Set()) // Track which users are being loaded

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

  // Mock users for development (fallback)
  const mockUsers = [
    {
      id: '1',
      name: 'Alice Johnson',
      username: 'alice_j',
      email: 'alice@example.com',
      avatar: null,
      bio: 'Software developer passionate about Vue.js',
      isOnline: true,
      lastSeen: null
    },
    {
      id: '2',
      name: 'Bob Smith',
      username: 'bob_smith',
      email: 'bob@example.com',
      avatar: null,
      bio: 'Designer and coffee enthusiast',
      isOnline: false,
      lastSeen: '2024-01-15T10:30:00Z'
    },
    {
      id: '3',
      name: 'Carol Davis',
      username: 'carol_d',
      email: 'carol@example.com',
      avatar: null,
      bio: 'Product manager at tech startup',
      isOnline: true,
      lastSeen: null
    },
    {
      id: '4',
      name: 'David Wilson',
      username: 'david_w',
      email: 'david@example.com',
      avatar: null,
      bio: 'Full-stack developer and tech blogger',
      isOnline: false,
      lastSeen: '2024-01-14T15:45:00Z'
    },
    {
      id: '5',
      name: 'Eva Martinez',
      username: 'eva_m',
      email: 'eva@example.com',
      avatar: null,
      bio: 'UX researcher and design systems advocate',
      isOnline: true,
      lastSeen: null
    }
  ]

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
    if (!userId) return null
    
    // Return user if already in store
    const existingUser = users.value.get(userId)
    if (existingUser) {
      return existingUser
    }
    
    // If user not found and not currently loading, try to load from API
    if (!loadingUserIds.value.has(userId)) {
      loadUserById(userId)
    }
    
    return null
  }

  // Load user from API by ID
  const loadUserById = async (userId) => {
    if (!userId || loadingUserIds.value.has(userId)) return null
    
    loadingUserIds.value.add(userId)
    
    try {
      // Try to get user info from contacts API
      const response = await contactService.getContacts({ q: userId, page: 0, size: 1 })
      const outer = response?.data || response
      const dataNode = outer?.data || outer
      const content = dataNode?.content || []
      
      if (content.length > 0) {
        const userInfo = content[0]
        const normalizedUser = {
          id: userInfo.contactUserId || userInfo.id || userId,
          name: userInfo.displayName || userInfo.name || userInfo.username || `User ${userId}`,
          username: userInfo.username || `user_${userId}`,
          email: userInfo.email || null,
          avatar: userInfo.avatarUrl || null,
          bio: userInfo.bio || null,
          isOnline: (userInfo.presenceStatus || '').toUpperCase() === 'ONLINE',
          lastSeen: userInfo.lastSeenAt || null
        }
        
        users.value.set(userId, normalizedUser)
        return normalizedUser
      }
    } catch (error) {
      console.warn(`Failed to load user ${userId} from API:`, error)
    }
    
    // Fallback: create a minimal user object
    const fallbackUser = {
      id: userId,
      name: `User ${userId}`,
      username: `user_${userId}`,
      email: null,
      avatar: null,
      bio: null,
      isOnline: false,
      lastSeen: null
    }
    
    users.value.set(userId, fallbackUser)
    loadingUserIds.value.delete(userId)
    return fallbackUser
  }

  // Load multiple users by IDs
  const loadUsersByIds = async (userIds) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return []
    
    const uniqueIds = [...new Set(userIds)].filter(id => id && !users.value.has(id))
    if (uniqueIds.length === 0) return getUsersByIds(userIds)
    
    const loadPromises = uniqueIds.map(id => loadUserById(id))
    await Promise.allSettled(loadPromises)
    
    return getUsersByIds(userIds)
  }

  const addUser = (user) => {
    if (!user || !user.id) return
    
    // Normalize user data
    const normalizedUser = {
      id: user.id,
      name: user.name || user.displayName || user.username || `User ${user.id}`,
      username: user.username || `user_${user.id}`,
      email: user.email || null,
      avatar: user.avatar || user.avatarUrl || null,
      bio: user.bio || null,
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen || user.lastSeenAt || null,
      // Keep any additional fields
      ...user
    }
    
    users.value.set(user.id, normalizedUser)
    // Remove from loading set if it was being loaded
    loadingUserIds.value.delete(user.id)
  }

  const addUsers = (userList) => {
    if (!Array.isArray(userList)) return
    
    userList.forEach(user => {
      if (user && user.id) {
        addUser(user)
      }
    })
  }

  // Ensure user exists (create minimal if not found)
  const ensureUser = (userId, fallbackData = {}) => {
    if (!userId) return null
    
    let user = users.value.get(userId)
    if (!user) {
      user = {
        id: userId,
        name: fallbackData.name || `User ${userId}`,
        username: fallbackData.username || `user_${userId}`,
        email: fallbackData.email || null,
        avatar: fallbackData.avatar || null,
        bio: fallbackData.bio || null,
        isOnline: fallbackData.isOnline || false,
        lastSeen: fallbackData.lastSeen || null,
        ...fallbackData
      }
      users.value.set(userId, user)
    }
    
    return user
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

  // Clear all users (useful for logout)
  const clearUsers = () => {
    users.value.clear()
    loadingUserIds.value.clear()
  }

  // Initialize store with mock data
  const initializeMockUsers = () => {
    // No mock users - all users loaded from API
    console.log('Users store initialized - no mock data')
  }

  // Initialize store
  const init = () => {
    loadCurrentUser()
    // No mock users - all users loaded from API when needed
  }

  return {
    // State
    users,
    currentUser,
    isLoading,
    loadingUserIds,
    
    // Computed
    allUsers,
    onlineUsers,
    offlineUsers,
    
    // Actions
    loadCurrentUser,
    getUserById,
    loadUserById,
    loadUsersByIds,
    addUser,
    addUsers,
    ensureUser,
    updateUser,
    updateUserOnlineStatus,
    removeUser,
    searchUsers,
    getUsersByIds,
    formatLastSeen,
    updateCurrentUser,
    clearUsers,
    initializeMockUsers,
    init
  }
})