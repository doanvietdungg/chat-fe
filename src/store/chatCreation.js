import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChatsStore } from './chats'
import { useUsersStore } from './users'

export const useChatCreationStore = defineStore('chatCreation', () => {
  // State
  const isCreating = ref(false)
  const creationError = ref(null)

  // Actions
  const createOrOpenChat = async (userId) => {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid user ID is required')
    }

    if (userId === 'current_user') {
      throw new Error('Cannot create chat with yourself')
    }

    // Check if user exists (in a real app, this would be an API call)
    const usersStore = useUsersStore()
    const targetUser = usersStore.getUserById(userId)
    if (!targetUser) {
      throw new Error('User not found')
    }

    isCreating.value = true
    creationError.value = null

    try {
      const chatsStore = useChatsStore()
      
      // Check if chat already exists
      const existingChat = chatsStore.findChatByUserId(userId)
      
      if (existingChat) {
        // Chat already exists, just open it
        chatsStore.setActiveChat(existingChat.id)
        return existingChat
      }

      // Check chat limit (e.g., max 100 active chats)
      if (chatsStore.state.chats.length >= 100) {
        throw new Error('Chat limit reached (maximum 100 active chats)')
      }

      // Create new chat
      const newChat = await createNewChat(userId)
      
      // Add to chats store
      chatsStore.addChat(newChat)
      
      // Set as active chat
      chatsStore.setActiveChat(newChat.id)
      
      return newChat
    } catch (error) {
      console.error('Failed to create or open chat:', error)
      creationError.value = error.message
      throw error
    } finally {
      isCreating.value = false
    }
  }

  const createNewChat = async (userId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Get user info to set chat title
    const usersStore = useUsersStore()
    const user = usersStore.getUserById(userId)
    const userName = user ? user.name : `User ${userId}`

    // Mock chat creation - compatible with existing chats structure
    const newChat = {
      id: `chat_${Date.now()}`,
      type: 'private', // Use 'private' to match existing structure
      title: userName,
      last: '', // Empty initially
      unread: 0,
      pinned: false,
      muted: false,
      notificationLevel: 'all',
      participants: ['current_user', userId],
      avatar: user?.avatar || null,
      isOnline: user?.isOnline || false,
      isTyping: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage for persistence
    try {
      const existingChats = JSON.parse(localStorage.getItem('userChats') || '[]')
      existingChats.push(newChat)
      localStorage.setItem('userChats', JSON.stringify(existingChats))
    } catch (error) {
      console.error('Failed to save new chat:', error)
    }

    return newChat
  }

  const createGroupChat = async (userIds, title, avatar = null) => {
    if (!userIds || userIds.length < 2) {
      throw new Error('At least 2 users are required for a group chat')
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Group title is required')
    }

    isCreating.value = true
    creationError.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const newGroupChat = {
        id: `group_${Date.now()}`,
        type: 'group',
        title: title.trim(),
        last: 'Group created',
        unread: 0,
        pinned: false,
        muted: false,
        notificationLevel: 'all',
        participants: ['current_user', ...userIds],
        avatar,
        isOnline: false,
        isTyping: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        admins: ['current_user']
      }

      // Add to chats store
      const chatsStore = useChatsStore()
      chatsStore.addChat(newGroupChat)
      
      // Set as active chat
      chatsStore.setActiveChat(newGroupChat.id)

      // Save to localStorage
      try {
        const existingChats = JSON.parse(localStorage.getItem('userChats') || '[]')
        existingChats.push(newGroupChat)
        localStorage.setItem('userChats', JSON.stringify(existingChats))
      } catch (error) {
        console.error('Failed to save new group chat:', error)
      }

      return newGroupChat
    } catch (error) {
      console.error('Failed to create group chat:', error)
      creationError.value = error.message
      throw error
    } finally {
      isCreating.value = false
    }
  }

  const navigateToChat = (chatId) => {
    // This would typically use Vue Router
    // For now, we'll just set the active chat
    const chatsStore = useChatsStore()
    chatsStore.setActiveChat(chatId)
  }

  const clearError = () => {
    creationError.value = null
  }

  return {
    // State
    isCreating,
    creationError,
    
    // Actions
    createOrOpenChat,
    createNewChat,
    createGroupChat,
    navigateToChat,
    clearError
  }
})