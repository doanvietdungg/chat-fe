import { ref } from 'vue'
import { useChatCreationStore } from '../store/chatCreation.js'
import { useChatsStore } from '../store/chats.js'
import { useUsersStore } from '../store/users.js'
import { useChatStore } from '../store/chat.js'

export function useChatCreation() {
  const chatCreationStore = useChatCreationStore()
  const chatsStore = useChatsStore()
  const usersStore = useUsersStore()
  const chatStore = useChatStore()

  const isCreating = ref(false)
  const error = ref(null)

  // Start a local draft for a private chat
  const startDraft = (user) => {
    if (!user || !user.id) throw new Error('User is required')
    const draftId = `draft-${user.id}`

    // Prepare minimal draft chat object for sidebar
    const draftChat = {
      id: draftId,
      type: 'private',
      title: user.name || user.username || 'New chat',
      last: '',
      unread: 0,
      pinned: false,
      muted: false,
      participants: ['current_user', user.id],
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    chatsStore.addChat(draftChat)
    chatsStore.setActiveChat(draftId)
    chatStore.startPrivateDraft(user.id, draftId)
    return draftChat
  }

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

      // Create new chat via chatCreation store (immediate creation path)
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
    startDraft,
    createGroupChat,
    navigateToChat,
    clearError
  }
}