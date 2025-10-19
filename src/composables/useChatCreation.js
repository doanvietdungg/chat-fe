import { ref } from 'vue'
import { useChatCreationStore } from '../store/chatCreation.js'
import { useChatsStore } from '../store/chats.js'
import { useUsersStore } from '../store/users.js'

export function useChatCreation() {
  const chatCreationStore = useChatCreationStore()
  const chatsStore = useChatsStore()
  const usersStore = useUsersStore()

  const isCreating = ref(false)
  const error = ref(null)

  const createOrOpenChat = async (userId) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    isCreating.value = true
    error.value = null

    try {
      // Check if chat already exists
      const existingChat = chatsStore.findChatByUserId(userId)

      if (existingChat) {
        // Chat already exists, just activate it
        chatsStore.setActiveChat(existingChat.id)
        return existingChat
      }

      // Create new chat
      const newChat = await chatCreationStore.createOrOpenChat(userId)

      return newChat
    } catch (err) {
      error.value = err.message
      console.error('Failed to create or open chat:', err)
      throw err
    } finally {
      isCreating.value = false
    }
  }

  const createGroupChat = async (userIds, title, avatar = null) => {
    isCreating.value = true
    error.value = null

    try {
      const newGroupChat = await chatCreationStore.createGroupChat(userIds, title, avatar)
      return newGroupChat
    } catch (err) {
      error.value = err.message
      console.error('Failed to create group chat:', err)
      throw err
    } finally {
      isCreating.value = false
    }
  }

  const navigateToChat = (chatId) => {
    chatsStore.setActiveChat(chatId)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    isCreating,
    error,
    createOrOpenChat,
    createGroupChat,
    navigateToChat,
    clearError
  }
}