<script setup>
import { onMounted, computed, ref, inject, watch } from 'vue'
import { useStores } from '../composables/useStores'
import ChatHeader from './ChatHeader.vue'
import MessageArea from './MessageArea.vue'
import MessageInput from './MessageInput.vue'
import PinnedMessage from './PinnedMessage.vue'
import PinnedMessagesView from './PinnedMessagesView.vue'

const { chatStore, messagesStore, sendMessage } = useStores()
const showPinnedView = ref(false)
const messageInputRef = ref(null)

// Inject state from parent
const isPinnedViewOpen = inject('isPinnedViewOpen', ref(false))

// Watch showPinnedView and update parent state
watch(showPinnedView, (newValue) => {
  isPinnedViewOpen.value = newValue
})

const currentMessages = computed(() => {
  const messages = messagesStore.getMessagesForChat(chatStore.state.currentChatId)
  console.log('Current chat ID:', chatStore.state.currentChatId)
  console.log('Messages for chat:', messages?.length || 0, 'messages')
  
  // Return real messages or empty array
  return messages || []
})

onMounted(() => {
  chatStore.connect()
})

function handleSend(text) {
  sendMessage(text)
}

function handleAttach(file) {
  const reader = new FileReader()
  reader.onload = () => {
    sendMessage('', {
      type: 'file',
      media: {
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        size: file.size,
        url: typeof reader.result === 'string' ? reader.result : undefined
      }
    })
  }
  reader.readAsDataURL(file)
}

// Handle edit message
function handleStartEdit(message) {
  if (messageInputRef.value) {
    messageInputRef.value.startEditMessage(message)
  }
}

// Handle delete message
function handleDeleteMessage(message) {
  if (messageInputRef.value) {
    messageInputRef.value.deleteMessage(message.id)
  }
}

function scrollToPinnedMessage(messageId) {
  // Emit event to MessageArea to scroll to message
  console.log('Scroll to pinned message:', messageId)
  // TODO: Implement scroll to message functionality
}

function unpinMessage(messageId) {
  messagesStore.pinMessage(messageId) // Toggle pin
}

function unpinAllMessages() {
  const pinnedMessages = currentMessages.value.filter(m => m.pinned)
  pinnedMessages.forEach(m => messagesStore.pinMessage(m.id))
}
</script>

<template>
  <a-layout-content class="chat-main">
    <ChatHeader />
    
    <!-- Pinned Message Banner -->
    <PinnedMessage 
      v-if="chatStore.state.currentChatId && !showPinnedView"
      :chatId="chatStore.state.currentChatId"
      @scroll-to-message="scrollToPinnedMessage"
      @unpin="unpinMessage"
      @show-list="showPinnedView = true"
    />
    
    <div v-if="!showPinnedView" class="message-container">
      <MessageArea 
        :messages="currentMessages" 
        :username="chatStore.state.username"
        :loading="messagesStore.state?.loading || false"
        :chat-id="chatStore.state.currentChatId"
        @start-edit="handleStartEdit"
        @delete="handleDeleteMessage"
      />
    </div>
    
    <div v-if="!showPinnedView" class="input-container">
      <MessageInput 
        ref="messageInputRef"
        @send="handleSend" 
        @attach="handleAttach" 
      />
    </div>
    
    <!-- Pinned Messages View -->
    <PinnedMessagesView
      v-if="chatStore.state.currentChatId"
      :visible="showPinnedView"
      :chatId="chatStore.state.currentChatId"
      @update:visible="showPinnedView = $event"
      @scroll-to-message="scrollToPinnedMessage"
      @unpin="unpinMessage"
      @unpin-all="unpinAllMessages"
    />
    
    <!-- Connection Error Alert -->
    <a-alert 
      v-if="chatStore.state.connectionError" 
      type="warning" 
      :message="'Kết nối không ổn định'"
      :description="chatStore.state.connectionError"
      show-icon
      closable
      class="connection-error"
    />
  </a-layout-content>
</template>

<style scoped>
.chat-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--chat-bg);
}

.message-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.input-container {
  flex-shrink: 0;
  border-top: 1px solid var(--border-light);
}

.connection-error {
  margin: var(--spacing-md);
  flex-shrink: 0;
}
</style>