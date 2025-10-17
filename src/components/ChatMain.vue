<script setup>
import { onMounted, computed } from 'vue'
import { useStores } from '../composables/useStores'
import ChatHeader from './ChatHeader.vue'
import MessageArea from './MessageArea.vue'
import MessageInput from './MessageInput.vue'

const { chatStore, messagesStore, sendMessage } = useStores()

const currentMessages = computed(() => {
  const messages = messagesStore.getMessagesForChat(chatStore.state.currentChatId)
  console.log('Current chat ID:', chatStore.state.currentChatId)
  console.log('Messages for chat:', messages)
  console.log('All messages in store:', messagesStore.state.messages)
  
  // Fallback: if no messages found, return sample messages
  if (!messages || messages.length === 0) {
    return [
      {
        id: 'sample-1',
        text: 'Xin chào! Đây là tin nhắn mẫu.',
        author: 'Sample User',
        authorId: 'sample-user',
        timestamp: new Date().toISOString(),
        at: new Date().toISOString(),
        reactions: [],
        type: 'text'
      },
      {
        id: 'sample-2', 
        text: 'Tin nhắn thứ hai để test giao diện.',
        author: chatStore.state.username,
        authorId: 'user-me',
        timestamp: new Date().toISOString(),
        at: new Date().toISOString(),
        reactions: [],
        type: 'text'
      }
    ]
  }
  
  return messages
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
</script>

<template>
  <a-layout-content class="chat-main">
    <ChatHeader />
    
    <div class="message-container">
      <MessageArea 
        :messages="currentMessages" 
        :username="chatStore.state.username"
        :loading="chatStore.state.loading || false"
      />
    </div>
    
    <div class="input-container">
      <MessageInput 
        @send="handleSend" 
        @attach="handleAttach" 
      />
    </div>
    
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