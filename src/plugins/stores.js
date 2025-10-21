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
    // Initialize messages store (this will set up getCurrentUser function)
    // No specific init needed, just ensure it's instantiated
    
    // Connect to WebSocket
    chatStore.connect()
    
    // Load chats from API
    const chatIds = await chatsStore.loadChats()
    
    // Subscribe to all user's chats for real-time messages
    if (chatIds.length > 0) {
      chatStore.subscribeToChats(chatIds)
    }

    return { chatStore, chatsStore, messagesStore }
  } catch (error) {
    console.error('Failed to initialize chat system:', error)
    return { chatStore, chatsStore, messagesStore }
  }
}