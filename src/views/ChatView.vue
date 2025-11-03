<template>
  <a-layout class="chat-app">
    <!-- Main Sidebar -->
    <MainSidebar 
      v-model:visible="mainSidebarVisible"
      :isPinnedViewOpen="isPinnedViewOpen"
      @menu-click="handleMainSidebarClick"
    />
    
    <ChatSidebar />
    <ChatMain />
  </a-layout>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatSidebar from '../components/ChatSidebar.vue'
import ChatMain from '../components/ChatMain.vue'
import MainSidebar from '../components/MainSidebar.vue'
import { useChatsStore } from '../store/chats'
import { useChatStore } from '../store/chat'
import { useMessagesStore } from '../store/messages'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const chatsStore = useChatsStore()
const chatStore = useChatStore()
const messagesStore = useMessagesStore()

const props = defineProps({
  chatId: String
})

// State
const mainSidebarVisible = ref(false)
const isPinnedViewOpen = ref(false)

// Provide state to child components
provide('isPinnedViewOpen', isPinnedViewOpen)

// Watch for route changes to open specific chat
watch(() => route.params.chatId, async (newChatId) => {
  if (newChatId && newChatId !== chatsStore.state.activeChatId) {
    console.log('Route changed to chat:', newChatId)
    await openChatFromRoute(newChatId)
  }
}, { immediate: true })

// Watch for active chat changes to update URL
watch(() => chatsStore.state.activeChatId, (newChatId) => {
  if (newChatId && route.params.chatId !== newChatId) {
    console.log('Active chat changed, updating URL:', newChatId)
    router.replace(`/chat/${newChatId}`)
  }
})

async function openChatFromRoute(chatId) {
  try {
    // Set active chat in chats store
    chatsStore.setActive(chatId)
    
    // Set current chat in chat store (for WebSocket subscriptions)
    chatStore.setCurrentChat(chatId)
    
    // Load messages for this chat
    console.log('Loading messages for chat from route:', chatId)
    await messagesStore.loadMessagesForChat(chatId)
    console.log('Messages loaded successfully from route')
  } catch (error) {
    console.error('Failed to load chat from route:', error)
    // If chat doesn't exist, redirect to main chat page
    router.replace('/chat')
  }
}

// Main sidebar handlers
function handleMainSidebarClick(menuItem) {
  console.log('Main sidebar menu clicked:', menuItem.key)
  
  switch (menuItem.key) {
    case 'profile':
      message.info('Profile page - Coming soon')
      break
    case 'wallet':
      message.info('Wallet feature - Coming soon')
      break
    case 'new-group':
      message.info('New Group - Coming soon')
      break
    case 'new-channel':
      message.info('New Channel - Coming soon')
      break
    case 'contacts':
      message.info('Contacts - Coming soon')
      break
    case 'calls':
      message.info('Calls - Coming soon')
      break
    case 'saved-messages':
      message.info('Saved Messages - Coming soon')
      break
    case 'settings':
      message.info('Settings - Coming soon')
      break
    default:
      message.info(`${menuItem.label} clicked`)
  }
}

onMounted(async () => {
  console.log('ChatView mounted with chatId:', props.chatId)
  
  // If we have a chatId in the route, open that chat
  if (props.chatId) {
    await openChatFromRoute(props.chatId)
  } else {
    // If no chatId in route, check if we have chats and redirect to first one
    if (chatsStore.state.chats.length > 0) {
      const firstChatId = chatsStore.state.chats[0].id
      console.log('No chatId in route, redirecting to first chat:', firstChatId)
      router.replace(`/chat/${firstChatId}`)
    }
  }
})
</script>

<style scoped>
.chat-app {
  height: 100vh;
  overflow: hidden;
}
</style>