import { reactive, computed } from 'vue'
import { useMessagesStore } from './messages'
import { useChatsStore } from './chats'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'
import { usePresenceStore } from './presence'
import { stompService } from '../services/stompService'
import { chatService } from '../services/chatService'
import { ca } from 'date-fns/locale'

const state = reactive({
  username: `User-${Math.floor(Math.random() * 1000)}`,
  isConnected: false,
  connectionError: '',
  currentChatId: null, // No default chat - will be set from URL
  pendingRecipientId: null,
  loading: false,
  subscribedChats: new Set(), // Track subscribed chat IDs
  userEventsSubscriptionId: null, // Track user events subscription
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
          console.log('🔗 STOMP connected successfully')
          state.isConnected = true
          
          // 🟢 Send online status to server
          const presenceStore = usePresenceStore()
          presenceStore.sendOnlineStatus()
          presenceStore.subscribeToPresence()
          
          // Re-subscribe to chats after reconnection
          resubscribeToChats()
          // 🔥 Subscribe to user events for message.first notifications
          // Add a small delay to ensure connection is fully established
          setTimeout(() => {
            subscribeToUserEvents()
          }, 500)
        })
        stompService.on('disconnected', () => {
          state.isConnected = false
          state.subscribedChats.clear()
          chatSubscriptions.clear()
          state.userEventsSubscriptionId = null // Reset user events subscription
          
          // 🔴 User is now offline
          const presenceStore = usePresenceStore()
          presenceStore.unsubscribeFromPresence()
        })
        stompService.on('error', () => { state.connectionError = 'STOMP error occurred' })
      }
    } catch (_) {
      state.connectionError = 'Failed to connect'
      state.isConnected = false
    }
  }

  function disconnect() {
    // 🔴 Send offline status before disconnecting
    const presenceStore = usePresenceStore()
    presenceStore.sendOfflineStatus()
    
    try { stompService.disconnect() } catch (_) { }
    state.isConnected = false
  }

  async function sendMessage(text, options = {}) {
    const trimmed = text.trim()
    const {
      type = 'TEXT',
      fileId = null,
      fileName = null,
      fileUrl = null,
      fileSize = null,
      contentType = null,
      caption = '',
      replyToId = null,
      forwardedFromId = null,
      forwardedToChatId = null
    } = options

    console.log('📤 sendMessage called with options:', options)
    console.log('📤 replyToId extracted:', replyToId)
    console.log('📤 forwardedFromId extracted:', forwardedFromId)

    // Allow empty text for file messages
    if (!trimmed && !fileId) return

    const messagesStore = useMessagesStore()
    const chatsStore = useChatsStore()

    // If we're in a draft chat, create the real chat first
    let chatId = state.currentChatId
    const isDraft = typeof chatId === 'string' && chatId.startsWith('draft-')

    const recipientId = state.pendingRecipientId;
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

      // If forwarding to a specific chat, use that instead
      if (forwardedToChatId) {
        chatId = forwardedToChatId
      }

      // Send message via WebSocket (STOMP)
      const payload = {
        chatId: chatId,
        recipientId: recipientId,
        text: trimmed || caption, // Use caption for file messages
        type: type.toUpperCase(), // TEXT, IMAGE, FILE, SYSTEM
        fileId: fileId,
        fileName: fileName,
        fileUrl: fileUrl,
        fileSize: fileSize,
        contentType: contentType,
        replyToId: replyToId,
        forwardedFromId: forwardedFromId
      }

      console.log('📤 Payload with reply_to_id and forwardedFromId:', payload)

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
        replyToId: replyToId, // Add replyToId to optimistic message
        // Add file-specific fields for display
        media: fileId ? {
          fileId,
          fileName,
          fileUrl,
          fileSize,
          contentType,
          type: type.toLowerCase()
        } : null
      }

      console.log('📤 MessageData with replyToId:', messageData)

      console.log('Sending message with data:', messageData)
      const optimisticMessage = messagesStore.addMessage(messageData)

      // 1. First call API to send message
      try {
        const { messageAPI } = await import('../services/api.js')
        
        const apiPayload = {
          chatId: chatId, // Include chatId in payload
          text: trimmed || caption,
          type: type.toUpperCase(), // TEXT, IMAGE, FILE, SYSTEM
          fileId: fileId,
          fileName: fileName,
          fileUrl: fileUrl,
          fileSize: fileSize,
          contentType: contentType,
          recipientId: recipientId,
          replyToId: replyToId,
          forwardedFromId: forwardedFromId
        }
        
        console.log('📤 API payload with reply_to_id and forwardedFromId:', apiPayload)
        const apiResponse = await messageAPI.sendMessage(chatId, apiPayload)  

        console.log('📤 API send message response:', apiResponse)

        // 2. Then send via WebSocket (for real-time notification)
        console.log('📡 WebSocket payload:', payload)
        stompService.send('/app/messages.send', payload)

        return optimisticMessage

      } catch (apiError) {
        console.error('📤 API send message failed:', apiError)
        // Remove optimistic message if API fails
        messagesStore.removeMessage(optimisticMessage.id)
        throw apiError
      }
    } catch (e) {
      throw e
    } finally {
      state.loading = false
    }
  }

  function setCurrentChat(chatId) {
    const previousChatId = state.currentChatId
    state.currentChatId = chatId

    // Sync with chats store active chat
    const chatsStore = useChatsStore()
    chatsStore.setActive(chatId)

    // Clear unread count for this chat
    chatsStore.clearUnread(chatId)

    // Clear typing indicators when switching chats
    if (previousChatId && previousChatId !== chatId) {
      const messagesStore = useMessagesStore()
      const authStore = useAuthStore()
      const currentUserId = authStore.user?.id
      
      // Stop typing in previous chat if we were typing
      if (currentUserId) {
        messagesStore.setTyping(currentUserId, false, previousChatId)
      }
    }

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
    console.log("sub chat id", chatId);
    if (!chatId || state.subscribedChats.has(chatId) || !state.isConnected) return
    console.log("sub chat debuig", chatId);

    // Subscribe to messages
    const messagesDestination = `/topic/chats/${chatId}/messages`
    const messagesSubscriptionId = stompService.subscribe(messagesDestination, (message) => {
      console.log("sub chat id success", message);

      if (message) {
        const messagesStore = useMessagesStore()
        const authStore = useAuthStore()
        const currentUserId = authStore.user?.id

        // Only add message if it's not from current user (avoid duplicates)
        // Current user's messages are already added optimistically
        if (message.authorId !== currentUserId) {
          console.log(`📨 Processing new message from ${message.authorId} in chat ${message.chatId}`)
          
          const addedMessage = messagesStore.addMessage({
            id: message.id,
            chatId: message.chatId,
            text: message.text,
            authorId: message.authorId,
            timestamp: message.createdAt || new Date().toISOString(),
            type: message.type || 'TEXT',
            replyToId: message.replyToId || null,
            forwardedFromId: message.forwardedFromId || null,
            forwardedFromUsername: message.forwardedFromUsername || null
          })

          // Update chat's last message and increment unread
          const chatsStore = useChatsStore()
          chatsStore.updateChatLastMessage(message.chatId, addedMessage)
          
          console.log(`📊 Current active chat: ${chatsStore.state.activeChatId}, Message chat: ${message.chatId}`)
          chatsStore.incrementUnread(message.chatId)
        } else {
          console.log(`📨 Skipping message from current user ${currentUserId}`)
        }
      }
    })

    // Subscribe to chat events (delete, edit, etc.)
    const eventsDestination = `/topic/chats/${chatId}/events`
    const eventsSubscriptionId = stompService.subscribe(eventsDestination, (event) => {
      console.log("🎯 Received chat event:", event);

      if (event && event.type) {
        const messagesStore = useMessagesStore()
        
        // Backend gửi với field 'payload' thay vì 'data'
        const eventData = event.payload || event.data
        
        switch (event.type) {
          case 'message.deleted':
            console.log('🗑️ Processing message.deleted event, messageId:', eventData)
            // Remove message from store
            if (eventData) {
              messagesStore.removeMessage(eventData)
            }
            break
          
          case 'message.edited':
            console.log('✏️ Processing message.edited event:', eventData)
            // Update message in store
            if (eventData && eventData.id) {
              messagesStore.editMessage(eventData.id, { text: eventData.text })
            }
            break
          
          default:
            console.log('ℹ️ Unknown event type:', event.type)
        }
      }
    })

    // Subscribe to typing indicators
    const typingDestination = `/topic/chats/${chatId}/typing`
    const typingSubscriptionId = stompService.subscribe(typingDestination, (typingData) => {
      console.log("🔤 Received typing event:", typingData);
      console.log("🔤 Typing data keys:", typingData ? Object.keys(typingData) : 'null');
      console.log("🔤 Typing data values:", typingData);

      if (typingData) {
        const messagesStore = useMessagesStore()
        const authStore = useAuthStore()
        const currentUserId = authStore.user?.id

        // Backend có thể gửi userId hoặc authorId
        const typingUserId = typingData.userId || typingData.authorId || typingData.senderId
        // Backend có thể gửi isTyping hoặc typing
        const isTyping = typingData.isTyping !== undefined ? typingData.isTyping : typingData.typing

        console.log("🔤 Extracted - UserId:", typingUserId, "IsTyping:", isTyping, "CurrentUserId:", currentUserId);

        // Don't show typing indicator for current user
        if (typingUserId && typingUserId !== currentUserId) {
          console.log("🔤 Setting typing status for user:", typingUserId, "in chat:", chatId);
          // Pass chatId to setTyping for chat-specific typing
          messagesStore.setTyping(typingUserId, isTyping, chatId)
        } else {
          console.log("🔤 Ignoring typing from current user or invalid userId");
        }
      }
    })

    if (messagesSubscriptionId) {
      state.subscribedChats.add(chatId)
      chatSubscriptions.set(chatId, messagesSubscriptionId)

      // Store events subscription separately
      if (eventsSubscriptionId) {
        chatSubscriptions.set(`${chatId}-events`, eventsSubscriptionId)
      }

      // Store typing subscription separately
      if (typingSubscriptionId) {
        chatSubscriptions.set(`${chatId}-typing`, typingSubscriptionId)
      }
    }
  }

  // Unsubscribe from a chat
  function unsubscribeFromChat(chatId) {
    if (!chatId || !state.subscribedChats.has(chatId)) return

    // Unsubscribe from messages
    const messagesSubscriptionId = chatSubscriptions.get(chatId)
    if (messagesSubscriptionId) {
      stompService.unsubscribe(messagesSubscriptionId)
      chatSubscriptions.delete(chatId)
    }

    // Unsubscribe from events
    const eventsSubscriptionId = chatSubscriptions.get(`${chatId}-events`)
    if (eventsSubscriptionId) {
      stompService.unsubscribe(eventsSubscriptionId)
      chatSubscriptions.delete(`${chatId}-events`)
    }

    // Unsubscribe from typing
    const typingSubscriptionId = chatSubscriptions.get(`${chatId}-typing`)
    if (typingSubscriptionId) {
      stompService.unsubscribe(typingSubscriptionId)
      chatSubscriptions.delete(`${chatId}-typing`)
    }

    state.subscribedChats.delete(chatId)
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

  // 🔥 SUBSCRIBE TO USER EVENTS (message.first, etc.)
  function subscribeToUserEvents() {
    const authStore = useAuthStore()
    const currentUser = authStore.user

    console.log('🔍 Debug - Current user from auth store:', currentUser)
    console.log('🔍 Debug - Connection state:', state.isConnected)
    console.log('🔍 Debug - Existing subscription ID:', state.userEventsSubscriptionId)

    // Check if already subscribed
    if (state.userEventsSubscriptionId) {
      console.log('⚠️ Already subscribed to user events, skipping')
      return
    }

    if (!currentUser?.id || !state.isConnected) {
      console.log('❌ Cannot subscribe to user events: no user ID or not connected')
      console.log('❌ User ID:', currentUser?.id)
      console.log('❌ Connected:', state.isConnected)
      return
    }

    const userEventsDestination = `/user/topic/events`
    console.log('📡 Subscribing to user events:', userEventsDestination)

    const subscriptionId = stompService.subscribe(userEventsDestination, (eventData, rawMessage) => {
      console.log('📨 Received user event (parsed):', eventData)
      console.log('📨 Raw message object:', rawMessage)
      console.log('📨 Event data type:', typeof eventData)
      console.log('📨 Event data keys:', eventData ? Object.keys(eventData) : 'null')

      if (eventData === null || eventData === undefined) {
        console.log('⚠️ Event data is null/undefined, checking raw message body')
        console.log('⚠️ Raw message body:', rawMessage?.body)
      }

      handleUserEvent(eventData)
    })

    if (subscriptionId) {
      console.log('✅ Successfully subscribed to user events with subscription ID:', subscriptionId)
      // Store subscription ID for cleanup if needed
      state.userEventsSubscriptionId = subscriptionId
    } else {
      console.log('❌ Failed to subscribe to user events')
    }
  }

  // 🔥 HANDLE USER EVENTS
  function handleUserEvent(eventData) {
    if (!eventData || !eventData.type) {
      console.log('⚠️ Invalid event data:', eventData)
      return
    }

    const { type, payload } = eventData
    console.log(`🎯 Handling event type: ${type}`, payload)

    switch (type) {
      case 'message.sent':
        handleMessageFirstEvent(payload)
        break
      case 'message.new':
        handleNewMessageEvent(payload)
        break
      case 'chat.created':
        handleChatCreatedEvent(payload)
        break
      default:
        console.log(`🤷 Unknown event type: ${type}`)
    }
  }

  // Handle new message event
  function handleNewMessageEvent(messagePayload) {
    console.log('📨 Handling message.new event:', messagePayload)

    const authStore = useAuthStore()
    const currentUserId = authStore.user?.id

    // Không xử lý tin nhắn từ chính mình
    if (messagePayload.authorId === currentUserId) {
      return
    }

    // Tạo notification cho tin nhắn mới
    import('../store/notifications.js').then(({ useNotificationsStore }) => {
      const notificationStore = useNotificationsStore()
      const usersStore = useUsersStore()
      const senderUser = usersStore.ensureUser(messagePayload.authorId)
      const senderName = senderUser?.name || senderUser?.username || `User ${messagePayload.authorId}`

      notificationStore.showMessageNotification({
        senderName: senderName,
        text: messagePayload.text || 'Tin nhắn mới',
        senderAvatar: senderUser?.avatar,
        chatId: messagePayload.chatId,
        senderId: messagePayload.authorId
      })
    }).catch(console.error)
  }

  // Handle chat created event
  function handleChatCreatedEvent(chatPayload) {
    console.log('💬 Handling chat.created event:', chatPayload)

    // Tạo notification cho chat mới
    import('../store/notifications.js').then(({ useNotificationsStore }) => {
      const notificationStore = useNotificationsStore()

      notificationStore.showSystemNotification(
        'Chat mới được tạo',
        `Bạn đã được thêm vào cuộc trò chuyện: ${chatPayload.title || 'Không có tiêu đề'}`
      )
    }).catch(console.error)

    // Thêm chat mới vào danh sách
    const chatsStore = useChatsStore()
    chatsStore.addChat(chatPayload)
  }

  // Send typing start event
  function startTyping(chatId) {
    if (!chatId || !state.isConnected) {
      console.log('❌ Cannot send typing: chatId or not connected', { chatId, connected: state.isConnected })
      return
    }

    console.log('🔤 Sending typing START for chat:', chatId);

    const payload = {
      chatId: chatId,
      typing: true
    }

    stompService.send('/app/typing', payload)
    console.log('🔤 Sent typing start payload:', payload)
  }

  // Send typing stop event
  function stopTyping(chatId) {
    if (!chatId || !state.isConnected) {
      console.log('❌ Cannot send typing stop: chatId or not connected', { chatId, connected: state.isConnected })
      return
    }

    console.log('🔤 Sending typing STOP for chat:', chatId);

    const payload = {
      chatId: chatId,
      typing: false
    }

    stompService.send('/app/typing', payload)
    console.log('🔤 Sent typing stop payload:', payload)
  }

  // 🔥 HANDLE MESSAGE.FIRST EVENT - Đẩy chat lên đầu
  function handleMessageFirstEvent(messagePayload) {
    console.log('🚀 Handling message.first event:', messagePayload)

    const chatsStore = useChatsStore()
    const authStore = useAuthStore()

    if (!messagePayload || !messagePayload.authorId) {
      console.log('⚠️ Invalid message.first payload')
      return
    }

    // Tìm hoặc tạo chat với người gửi
    const senderId = messagePayload.authorId
    const currentUserId = authStore.user?.id

    // Không xử lý tin nhắn từ chính mình
    if (senderId === currentUserId) {
      console.log('🙋 Ignoring message.first from self')
      return
    }

    // 🔔 Tạo notification cho tin nhắn mới
    import('../store/notifications.js').then(({ useNotificationsStore }) => {
      const notificationStore = useNotificationsStore()
      const usersStore = useUsersStore()
      const senderUser = usersStore.ensureUser(senderId)
      const senderName = senderUser?.name || senderUser?.username || `User ${senderId}`

      notificationStore.showMessageNotification({
        senderName: senderName,
        text: messagePayload.text || 'Tin nhắn mới',
        senderAvatar: senderUser?.avatar,
        chatId: messagePayload.chatId,
        senderId: senderId
      })
    }).catch(console.error)

    // Tìm chat hiện có với người gửi
    let existingChat = chatsStore.findChatByUserId(senderId)

    if (existingChat) {
      // 🔥 Đẩy chat lên đầu danh sách
      console.log('📌 Moving existing chat to top:', existingChat.title)
      chatsStore.moveToTop(existingChat.id)

      // Cập nhật last message và tăng unread
      chatsStore.updateChatLastMessage(existingChat.id, {
        text: messagePayload.text,
        timestamp: new Date().toISOString()
      })
      
      console.log(`📊 [message.first] Current active chat: ${chatsStore.state.activeChatId}, Message chat: ${existingChat.id}`)
      chatsStore.incrementUnread(existingChat.id)
    } else {
      // 🔥 Tạo chat mới và đặt lên đầu
      console.log('➕ Creating new chat for user:', senderId)

      // Get sender info (có thể cần call API để lấy thông tin user)
      const usersStore = useUsersStore()
      const senderUser = usersStore.ensureUser(senderId)
      const senderName = senderUser?.name || senderUser?.username || `User ${senderId}`

      const newChat = {
        id: `chat-${senderId}-${Date.now()}`, // Temporary ID
        type: 'private',
        title: senderName,
        last: messagePayload.text,
        unread: 1,
        pinned: false,
        muted: false,
        avatar: senderUser?.avatar || null,
        participants: [currentUserId, senderId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageTime: new Date().toISOString()
      }

      // Thêm chat mới lên đầu danh sách
      chatsStore.addChat(newChat)
      console.log('✅ New chat created and added to top')
    }
  }

  // Debug function to show all active subscriptions
  function debugSubscriptions() {
    console.log('=== ACTIVE SUBSCRIPTIONS ===')
    console.log('📊 Total subscribed chats:', state.subscribedChats.size)
    console.log('📊 Subscribed chat IDs:', Array.from(state.subscribedChats))
    console.log('📊 Chat subscriptions map size:', chatSubscriptions.size)
    
    console.log('\n📋 Subscription details:')
    chatSubscriptions.forEach((subId, key) => {
      console.log(`  - ${key}: ${subId}`)
    })
    
    if (state.userEventsSubscriptionId) {
      console.log(`\n👤 User events subscription: ${state.userEventsSubscriptionId}`)
    }
    
    console.log('\n📡 Expected topics:')
    state.subscribedChats.forEach(chatId => {
      console.log(`  - /topic/chats/${chatId}/messages`)
      console.log(`  - /topic/chats/${chatId}/events`)
      console.log(`  - /topic/chats/${chatId}/typing`)
    })
    console.log('  - /user/topic/events')
    console.log('=========================')
  }

  const chatStore = {
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
    subscribeToUserEvents,
    handleUserEvent,
    handleMessageFirstEvent,
    startTyping,
    stopTyping,
    debugSubscriptions, // Add debug function
  }

  // Make available globally for testing
  if (typeof window !== 'undefined') {
    window.chatStore = chatStore
  }

  return chatStore
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(2)
    crypto.getRandomValues(buf)
    return `${buf[0].toString(16)}-${buf[1].toString(16)}`
  }
  return `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}




