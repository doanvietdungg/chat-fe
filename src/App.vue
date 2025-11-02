<script setup>
import { onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { initializeStores, initializeChatSystem } from './plugins/stores'
import { useAuthStore } from './store/auth'
import { useNotificationsStore } from './store/notifications'
import NotificationToast from './components/NotificationToast.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationsStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  // Auth store already initialized in main.js
  // Initialize other stores
  initializeStores()
  
  // Initialize notification store
  notificationStore.init()
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
