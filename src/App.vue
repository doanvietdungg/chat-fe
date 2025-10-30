<script setup>
import { onMounted, onUnmounted, computed, watch } from 'vue'
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

onUnmounted(() => {
  // Cleanup auth store event listeners
  authStore.cleanup()
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

    <!-- 🔥 Token expiry notification -->
    <a-notification
      v-if="authStore.error && authStore.error.includes('hết hạn')"
      :message="'Phiên đăng nhập hết hạn'"
      :description="authStore.error"
      type="warning"
      :duration="5"
      placement="topRight"
      @close="authStore.clearError"
    />
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
