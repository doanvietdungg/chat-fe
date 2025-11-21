<script setup>
import { onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { initializeStores, initializeChatSystem } from './plugins/stores'
import { useAuthStore } from './store/auth'
import { useNotificationsStore } from './store/notifications'
import { usePresenceStore } from './store/presence'
import { useChatStore } from './store/chat'
import NotificationToast from './components/NotificationToast.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationsStore()
const presenceStore = usePresenceStore()
const chatStore = useChatStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  // Auth store already initialized in main.js
  // Initialize other stores
  initializeStores()
  
  // Initialize notification store
  notificationStore.init()
  
  // Handle beforeunload to send offline status
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Handle visibility change (tab switch)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // Cleanup auth store event listeners
  authStore.cleanup()
  
  // Remove event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Send offline status when closing tab/browser
function handleBeforeUnload() {
  if (isAuthenticated.value && chatStore.state.isConnected) {
    presenceStore.sendOfflineStatus()
  }
}

// Handle tab visibility change
function handleVisibilityChange() {
  if (!isAuthenticated.value || !chatStore.state.isConnected) return
  
  if (document.hidden) {
    // Tab is hidden - optionally send offline or keep online
    console.log('📱 Tab hidden - user may be away')
    // Uncomment to send offline when switching tabs:
    // presenceStore.sendOfflineStatus()
  } else {
    // Tab is visible again - send online status
    console.log('📱 Tab visible - user is back')
    presenceStore.sendOnlineStatus()
  }
}

// Watch for authentication changes and initialize chat system
watch(isAuthenticated, async (authenticated) => {
  if (authenticated) {
    // Initialize chat system after successful authentication
    await initializeChatSystem()
  }
  // Don't redirect here - let router guards handle it
}, { immediate: true })
</script>

<template>
  <div class="app-container">
    <!-- Router view will handle auth routing -->
    <router-view />

    <!-- Notification Toast System -->
    <NotificationToast />

    <!-- Token expiry notification handled by NotificationToast -->
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
