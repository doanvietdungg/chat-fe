import { ref } from 'vue'
import { useChatCreationStore } from '../store/chatCreation.js'
import { useChatsStore } from '../store/chats.js'
import { useUsersStore } from '../store/users.js'
import { useChatStore } from '../store/chat.js'
import { chatAPI, messageAPI } from '../services/api.js'
import { useMessagesStore } from '../store/messages.js'

export function useChatCreation() {
  const chatCreationStore = useChatCreationStore()
  const chatsStore = useChatsStore()
  const usersStore = useUsersStore()
  const chatStore = useChatStore()
  const messagesStore = useMessagesStore()

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
    try { messagesStore.setMessagesForChat(draftId, []) } catch (_) {}
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
        try { chatStore.setCurrentChat(existingChat.id) } catch (_) {}
        // Load latest messages for existing chat
        try {
          const msgsRes = await messageAPI.getMessages(existingChat.id, { page: 0, size: 50, sort: 'createdAt,desc' })
          messagesStore.setMessagesForChat(existingChat.id, msgsRes)
        } catch (_) { /* noop */ }
        return existingChat
      }

      // Create new chat via backend
      const res = await chatAPI.createChat({ type: 'PRIVATE', otherUserId: userId })
      // Handle response structure: { success: true, data: { id: "...", ... } }
      const chat = res?.data?.data || res?.data || res

      // Normalize minimal fields for chats store
      const normalized = {
        id: chat.id,
        type: chat.type || 'private',
        title: chat.title || chat.displayName || chat.name || 'Private Chat',
        last: chat.lastMessage || '',
        unread: chat.unreadCount || 0,
        pinned: !!chat.pinned,
        muted: !!chat.muted,
        participants: chat.participants?.map(p => p.userId || p.id) || [userId],
        avatar: chat.avatar || chat.avatarUrl || null,
        isOnline: false,
        isTyping: false,
        createdAt: chat.createdAt || new Date().toISOString(),
        updatedAt: chat.updatedAt || new Date().toISOString()
      }

      // Add minimal first for instant navigation
      chatsStore.addChat(normalized)
      chatsStore.setActiveChat(normalized.id)
      try { chatStore.setCurrentChat(normalized.id) } catch (_) {}

      // Fetch full chat details and update store
      try {
        const fullRes = await chatAPI.getChat(normalized.id)
        const fullOuter = fullRes?.data || fullRes
        const full = fullOuter?.data || fullOuter
        const enriched = {
          ...normalized,
          title: full.title || normalized.title,
          participants: full.participants?.map(p => p.userId || p.id) || normalized.participants,
          avatar: full.avatar || full.avatarUrl || normalized.avatar,
          last: full.lastMessage || normalized.last,
          unread: full.unreadCount ?? normalized.unread,
          createdAt: full.createdAt || normalized.createdAt,
          updatedAt: full.updatedAt || normalized.updatedAt
        }
        chatsStore.replaceChat(normalized.id, enriched)

        // Load messages for this chat
        try {
          const msgsRes = await messageAPI.getMessages(enriched.id, { page: 0, size: 50, sort: 'createdAt,desc' })
          messagesStore.setMessagesForChat(enriched.id, msgsRes)
        } catch (_) { /* noop */ }

        return enriched
      } catch (_) {
        // Fallback to minimal if details fetch fails
        try {
          const msgsRes = await messageAPI.getMessages(normalized.id, { page: 0, size: 50, sort: 'createdAt,desc' })
          messagesStore.setMessagesForChat(normalized.id, msgsRes)
        } catch (_) { /* noop */ }
        return normalized
      }
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