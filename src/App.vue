<script setup>
import { onMounted, computed, watch } from 'vue'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatMain from './components/ChatMain.vue'
import AuthContainer from './components/AuthContainer.vue'
import DebugPanel from './components/DebugPanel.vue'
import { initializeStores, initializeChatSystem } from './plugins/stores'
import { useAuthStore } from './store/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  // Initialize auth store first
  authStore.init()
  // Then initialize other stores
  initializeStores()
})

// Watch for authentication changes and initialize chat system
watch(isAuthenticated, async (authenticated) => {
  if (authenticated) {
    // Initialize chat system after successful authentication
    await initializeChatSystem()
  }
}, { immediate: true })

const handleAuthSuccess = () => {
  // Auth success is handled by the store
  // Component will automatically re-render when isAuthenticated changes
}
</script>

<template>
  <div class="app-container">
    <!-- Show auth forms if not authenticated -->
    <AuthContainer 
      v-if="!isAuthenticated"
      @auth-success="handleAuthSuccess"
    />
    
    <!-- Show chat app if authenticated -->
    <a-layout v-else class="chat-app">
      <ChatSidebar />
      <ChatMain />
      <DebugPanel />
    </a-layout>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.chat-app {
  height: 100vh;
  overflow: hidden;
}
</style>
