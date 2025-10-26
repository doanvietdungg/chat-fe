import { reactive, computed } from 'vue'
import { useMessagesStore } from './messages'
import { useChatsStore } from './chats'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'
import { stompService } from '../services/stompService'
import { chatService } from '../services/chatService'

const state = reactive({
  username: `User-${Math.floor(Math.random() * 1000)}`,
  isConnected: false,
  connectionError: '',
  currentChatId: 'friend-1', // Default active chat
  pendingRecipientId: null,
  loading: false,
  subscribedChats: new Set(), // Track subscribed chat IDs
})

let listenersBound = false
const chatSubscriptions = new Map() // Track subscription IDs

export function useChatStore() {
  function connect() {
    if (state.isConnected) return
    state.connectionError = ''
    try {
      stompService.connect()
      if (!listenersBound) {
        listenersBound = true
        stompService.on('connected', () => {
          state.isConnected = true
          // Re-subscribe to chats after reconnection
          resubscribeToChats()
        })
        stompService.on('disconnected', () => {
          state.isConnected = false
          state.subscribedChats.clear()
          chatSubscriptions.clear()
        })
        stompService.on('error', () => { state.connectionError = 'STOMP error occurred' })
      }
    } catch (_) {
      state.connectionError = 'Failed to connect'
      state.isConnected = false
    }
  }

  function disconnect() {
    try { stompService.disconnect() } catch (_) { }
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
        // Get recipient user info for title
        const usersStore = useUsersStore()
        const recipientUser = usersStore.ensureUser(state.pendingRecipientId);
        
        const recipientName = recipientUser?.name || recipientUser?.username || `User ${state.pendingRecipientId}`

        // Create chat via API
        const chatResponse = await chatService.createChat({
          type: 'PRIVATE',
          title: recipientName,
          description: null,
          otherUserId: state.pendingRecipientId,
          participants: null
        })

        // Handle response structure: { success: true, data: { id: "...", ... } }
        const newChat = chatResponse?.data || chatResponse

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

        // Subscribe to the new chat for real-time messages
        subscribeToChat(chatId)
      }

      // Send message via WebSocket (STOMP)
      const payload = {
        chatId: chatId,
        text: trimmed,
        type: 'TEXT' // MessageType.TEXT from backend enum
      }

      // Get current user info
      const authStore = useAuthStore()
      const currentUser = authStore.user

      // Add message optimistically to local store BEFORE sending
      const messageData = {
        ...payload,
        id: cryptoRandomId(), // Generate temporary ID
        timestamp: new Date().toISOString(),
        authorId: currentUser?.id || 'current_user',
        author: currentUser?.name || currentUser?.username || 'You',
      }

      console.log('Sending message with data:', messageData)
      const optimisticMessage = messagesStore.addMessage(messageData)

      // Send via STOMP WebSocket
      stompService.send('/app/messages.send', payload)

      return optimisticMessage
    } catch (e) {
      throw e
    } finally {
      state.loading = false
    }
  }

  function setCurrentChat(chatId) {
    state.currentChatId = chatId
    
    // Clear unread count for this chat
    const chatsStore = useChatsStore()
    chatsStore.clearUnread(chatId)
    
    // Subscribe to this chat for real-time messages
    if (chatId && !chatId.startsWith('draft-')) {
      subscribeToChat(chatId)
    }
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

  // Subscribe to a chat for real-time messages
  function subscribeToChat(chatId) {
    if (!chatId || state.subscribedChats.has(chatId) || !state.isConnected) return

    const destination = `/topic/chats/${chatId}`
    const subscriptionId = stompService.subscribe(destination, (message) => {
      if (message) {
        const messagesStore = useMessagesStore()
        const authStore = useAuthStore()
        const currentUserId = authStore.user?.id

        // Only add message if it's not from current user (avoid duplicates)
        // Current user's messages are already added optimistically
        if (message.authorId !== currentUserId) {
          const addedMessage = messagesStore.addMessage({
            id: message.id,
            chatId: message.chatId,
            text: message.text,
            authorId: message.authorId,
            timestamp: message.createdAt || new Date().toISOString(),
            type: message.type || 'TEXT'
          })
          
          // Update chat's last message and increment unread
          const chatsStore = useChatsStore()
          chatsStore.updateChatLastMessage(message.chatId, addedMessage)
          chatsStore.incrementUnread(message.chatId)
        }
      }
    })

    if (subscriptionId) {
      state.subscribedChats.add(chatId)
      chatSubscriptions.set(chatId, subscriptionId)
    }
  }

  // Unsubscribe from a chat
  function unsubscribeFromChat(chatId) {
    if (!chatId || !state.subscribedChats.has(chatId)) return

    const subscriptionId = chatSubscriptions.get(chatId)
    if (subscriptionId) {
      stompService.unsubscribe(subscriptionId)
      state.subscribedChats.delete(chatId)
      chatSubscriptions.delete(chatId)
    }
  }

  // Re-subscribe to all chats after reconnection
  function resubscribeToChats() {
    const chatsToResubscribe = Array.from(state.subscribedChats)
    state.subscribedChats.clear()
    chatSubscriptions.clear()

    chatsToResubscribe.forEach(chatId => {
      subscribeToChat(chatId)
    })
  }

  // Subscribe to multiple chats (useful when loading chat list)
  function subscribeToChats(chatIds) {
    chatIds.forEach(chatId => {
      if (chatId && !chatId.startsWith('draft-')) {
        subscribeToChat(chatId)
      }
    })
  }

  return {
    state,
    connect,
    disconnect,
    sendMessage,
    setCurrentChat,
    startPrivateDraft,
    messageCount,
    currentChatMessages,
    subscribeToChat,
    unsubscribeFromChat,
    subscribeToChats,
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




