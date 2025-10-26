<template>
  <div v-if="showDebug" class="debug-panel">
    <div class="debug-header">
      <span>Debug Panel</span>
      <button @click="toggleDebug" class="close-btn">×</button>
    </div>
    
    <div class="debug-content">
      <div class="debug-section">
        <h4>Authentication</h4>
        <p>Authenticated: <span :class="authStore.isAuthenticated ? 'success' : 'error'">
          {{ authStore.isAuthenticated ? 'Yes' : 'No' }}
        </span></p>
        <p>User: {{ authStore.user?.name || 'Unknown' }}</p>
        <p>User ID: {{ authStore.user?.id || 'Unknown' }}</p>
      </div>

      <div class="debug-section">
        <h4>WebSocket</h4>
        <p>Connected: <span :class="chatStore.state.isConnected ? 'success' : 'error'">
          {{ chatStore.state.isConnected ? 'Yes' : 'No' }}
        </span></p>
        <p>Error: {{ chatStore.state.connectionError || 'None' }}</p>
        <p>Subscribed Chats: {{ Array.from(chatStore.state.subscribedChats).join(', ') || 'None' }}</p>
      </div>

      <div class="debug-section">
        <h4>Current Chat</h4>
        <p>Chat ID: {{ chatStore.state.currentChatId }}</p>
        <p>Messages: {{ messagesStore.getMessagesForChat(chatStore.state.currentChatId).length }}</p>
      </div>

      <div class="debug-actions">
        <button @click="reconnectWS" class="debug-btn">Reconnect WS</button>
        <button @click="testMessage" class="debug-btn">Test Message</button>
      </div>
    </div>
  </div>
  
  <button v-else @click="toggleDebug" class="debug-toggle">🐛</button>
</template>

<script setup>
import { ref } from 'vue'
import { useChatStore } from '../store/chat'
import { useAuthStore } from '../store/auth'
import { useMessagesStore } from '../store/messages'

const showDebug = ref(false)
const chatStore = useChatStore()
const authStore = useAuthStore()
const messagesStore = useMessagesStore()

function toggleDebug() {
  showDebug.value = !showDebug.value
}

function reconnectWS() {
  chatStore.disconnect()
  setTimeout(() => {
    chatStore.connect()
  }, 1000)
}

function testMessage() {
  chatStore.sendMessage('Test message from debug panel')
}
</script>

<style scoped>
.debug-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 16px;
}

.debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  font-size: 12px;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #d9d9d9;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.debug-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.debug-section h4 {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #1890ff;
}

.debug-section p {
  margin: 2px 0;
  line-height: 1.4;
}

.success {
  color: #52c41a;
  font-weight: bold;
}

.error {
  color: #ff4d4f;
  font-weight: bold;
}

.debug-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.debug-btn {
  flex: 1;
  padding: 4px 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.debug-btn:hover {
  background: #40a9ff;
}
</style>