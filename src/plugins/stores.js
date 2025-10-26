import { useUserSearchStore } from '../store/userSearch.js'
import { useContactsStore } from '../store/contacts.js'
import { useUsersStore } from '../store/users.js'
import { useAuthStore } from '../store/auth.js'
import { useChatStore } from '../store/chat.js'
import { useChatsStore } from '../store/chats.js'
import { useMessagesStore } from '../store/messages.js'

export function initializeStores() {
  // Initialize all stores
  const authStore = useAuthStore()
  const userSearchStore = useUserSearchStore()
  const contactsStore = useContactsStore()
  const usersStore = useUsersStore()

  // Initialize stores with their init methods
  // Auth store is initialized in App.vue before this
  userSearchStore.init()
  contactsStore.init()
  usersStore.init()

  return {
    authStore,
    userSearchStore,
    contactsStore,
    usersStore
  }
}

// Initialize chat system after authentication
export async function initializeChatSystem() {
  const chatStore = useChatStore()
  const chatsStore = useChatsStore()
  const messagesStore = useMessagesStore()

  try {
    // Initialize messages store with correct user data
    messagesStore.initializeMockData()
    
    console.log('Initializing chat system - loading chats from API...')
    
    // Load chats from API first (this might fail if backend not ready)
    const chatIds = await chatsStore.loadChats()
    
    console.log('Chat system initialized with', chatIds.length, 'chats')
    
    // Connect to WebSocket (this might fail if WebSocket server not ready)
    try {
      chatStore.connect()
      
      // Subscribe to all user's chats for real-time messages (only if connected)
      if (chatIds.length > 0) {
        // Wait a bit for connection to establish
        setTimeout(() => {
          if (chatStore.state.isConnected) {
            chatStore.subscribeToChats(chatIds)
          }
        }, 1000)
      }
    } catch (wsError) {
      console.warn('WebSocket connection failed, chat will work without real-time updates:', wsError.message)
    }

    return { chatStore, chatsStore, messagesStore }
  } catch (error) {
    console.error('Failed to initialize chat system:', error)
    return { chatStore, chatsStore, messagesStore }
  }
}