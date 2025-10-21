import { reactive, computed } from 'vue'
import { useMessagesStore } from './messages'
import { useChatsStore } from './chats'
import { stompService } from '../services/stompService'
import { chatService } from '../services/chatService'

const state = reactive({
  username: `User-${Math.floor(Math.random() * 1000)}`,
  isConnected: false,
  connectionError: '',
  currentChatId: 'friend-1', // Default active chat
  pendingRecipientId: null,
  loading: false,
})

let listenersBound = false

export function useChatStore() {
  function connect() {
    if (state.isConnected) return
    state.connectionError = ''
    try {
      stompService.connect()
      if (!listenersBound) {
        listenersBound = true
        stompService.on('connected', () => { state.isConnected = true })
        stompService.on('disconnected', () => { state.isConnected = false })
        stompService.on('error', () => { state.connectionError = 'STOMP error occurred' })
      }
    } catch (_) {
      state.connectionError = 'Failed to connect'
      state.isConnected = false
    }
  }

  function disconnect() {
    try { stompService.disconnect() } catch (_) {}
    state.isConnected = false
  }

  async function sendMessage(text, options = {}) {
    const trimmed = text.trim()
    if (!trimmed) return

    const messagesStore = useMessagesStore()
    const chatsStore = useChatsStore()

    // If we're in a draft chat, create the real chat first
    let chatId = state.currentChatId
    const isDraft = typeof chatId === 'string' && chatId.startsWith('draft-')

    try {
      if (!chatId || isDraft) {
        // Must have a pending recipient to create a private chat
        if (!state.pendingRecipientId) {
          throw new Error('Không xác định người nhận để tạo cuộc trò chuyện')
        }
        state.loading = true
        // Create chat via API
        const newChat = await chatService.createChat({
          type: 'private',
          participantIds: [state.pendingRecipientId],
        })

        // Replace draft chat with real chat (or add if none)
        if (isDraft) {
          chatsStore.replaceChat(chatId, newChat)
        } else {
          chatsStore.addChat(newChat)
        }
        chatsStore.setActive(newChat.id)
        state.currentChatId = newChat.id
        state.pendingRecipientId = null
        chatId = newChat.id
      }

      // Send message via API
      const payload = {
        text: trimmed,
        type: options.type || 'text',
        replyTo: options.replyTo || null,
        media: options.media || null,
        voice: options.voice || null,
      }

      const sent = await chatService.sendMessage(chatId, payload)

      // Update local store optimistically if needed
      const message = messagesStore.addMessage({
        ...payload,
        chatId,
      })
      return message || sent
    } catch (e) {
      throw e
    } finally {
      state.loading = false
    }
  }

  function setCurrentChat(chatId) {
    state.currentChatId = chatId
  }

  function startPrivateDraft(userId, draftId) {
    state.pendingRecipientId = userId
    state.currentChatId = draftId || `draft-${userId}`
  }

  const messageCount = computed(() => {
    const messagesStore = useMessagesStore()
    return messagesStore.getMessagesForChat(state.currentChatId).length
  })

  const currentChatMessages = computed(() => {
    const messagesStore = useMessagesStore()
    return messagesStore.getMessagesForChat(state.currentChatId)
  })

  return {
    state,
    connect,
    disconnect,
    sendMessage,
    setCurrentChat,
    startPrivateDraft,
    messageCount,
    currentChatMessages,
  }
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(2)
    crypto.getRandomValues(buf)
    return `${buf[0].toString(16)}-${buf[1].toString(16)}`
  }
  return `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}




