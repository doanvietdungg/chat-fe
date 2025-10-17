import { reactive, computed } from 'vue'
import { useMessagesStore } from './messages'

const state = reactive({
  username: `User-${Math.floor(Math.random() * 1000)}`,
  isConnected: false,
  connectionError: '',
  currentChatId: 'friend-1', // Default active chat
})

let socket = null

export function useChatStore() {
  function connect() {
    // Tạm thời vô hiệu hóa kết nối WebSocket
    state.connectionError = 'WebSocket tạm thời bị vô hiệu hóa'
    state.isConnected = false
    return
    
    // Code kết nối cũ bên dưới sẽ không được thực thi
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return
    }
    state.connectionError = ''
    try {
      // Simple public echo server
      socket = new WebSocket('wss://echo.websocket.events')

      socket.addEventListener('open', () => {
        state.isConnected = true
      })

      socket.addEventListener('message', (event) => {
        const data = typeof event.data === 'string' ? event.data : ''
        if (!data) return
        state.messages.push({
          id: cryptoRandomId(),
          author: 'Server',
          text: data,
          at: new Date().toISOString(),
        })
      })

      socket.addEventListener('close', () => {
        state.isConnected = false
      })

      socket.addEventListener('error', () => {
        state.connectionError = 'WebSocket error occurred'
      })
    } catch (e) {
      state.connectionError = 'Failed to connect'
    }
  }

  function disconnect() {
    if (socket) {
      try { socket.close() } catch (_) {}
      socket = null
    }
    state.isConnected = false
  }

  function sendMessage(text, options = {}) {
    const trimmed = text.trim()
    if (!trimmed) return
    
    const messagesStore = useMessagesStore()
    
    const messageData = {
      text: trimmed,
      chatId: state.currentChatId,
      type: options.type || 'text',
      replyTo: options.replyTo || null,
      media: options.media || null,
      voice: options.voice || null
    }
    
    const message = messagesStore.addMessage(messageData)
    
    // Tạm thời vô hiệu hóa gửi tin nhắn qua WebSocket
    // if (socket && socket.readyState === WebSocket.OPEN) {
    //   socket.send(trimmed)
    // }
    
    return message
  }

  function setCurrentChat(chatId) {
    state.currentChatId = chatId
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




