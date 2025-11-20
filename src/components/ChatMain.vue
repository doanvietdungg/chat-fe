<script setup>
import { onMounted, computed, ref, inject, watch } from 'vue'
import { useStores } from '../composables/useStores'
import ChatHeader from './ChatHeader.vue'
import MessageArea from './MessageArea.vue'
import MessageInput from './MessageInput.vue'
import PinnedMessage from './PinnedMessage.vue'
import PinnedMessagesView from './PinnedMessagesView.vue'
import ForwardMessageModal from './ForwardMessageModal.vue'
import { message as antMessage } from 'ant-design-vue'

const { chatStore, messagesStore, sendMessage } = useStores()
const showPinnedView = ref(false)
const messageInputRef = ref(null)
const forwardModalVisible = ref(false)
const forwardingMessage = ref(null)

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

// Handle reply message
function handleReplyMessage(message) {
  if (messageInputRef.value) {
    messageInputRef.value.startReplyMessage(message)
  }
}

// Handle delete message
function handleDeleteMessage(message) {
  if (messageInputRef.value) {
    messageInputRef.value.deleteMessage(message.id)
  }
}

// Handle forward message
function handleForwardMessage(message) {
  forwardingMessage.value = message
  forwardModalVisible.value = true
}

async function handleForward({ message, chatIds }) {
  try {
    // Nếu message này đã là forwarded message, giữ nguyên forwardedFromId gốc
    // Nếu không, dùng authorId của message hiện tại
    const originalAuthorId = message.forwardedFromId || message.authorId
    
    for (const chatId of chatIds) {
      await chatStore.sendMessage(message.text || '', {
        type: message.type || 'TEXT',
        fileId: message.media?.fileId || null,
        fileName: message.media?.fileName || null,
        fileUrl: message.media?.fileUrl || null,
        fileSize: message.media?.fileSize || null,
        contentType: message.media?.contentType || null,
        forwardedFromId: originalAuthorId,
        forwardedToChatId: chatId
      })
    }
    antMessage.success(`Đã chuyển tiếp tới ${chatIds.length} cuộc trò chuyện`)
  } catch (error) {
    console.error('Forward message error:', error)
    antMessage.error('Lỗi khi chuyển tiếp tin nhắn')
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
        @reply="handleReplyMessage"
        @forward="handleForwardMessage"
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
    
    <!-- Forward Message Modal -->
    <ForwardMessageModal
      v-model:open="forwardModalVisible"
      :message="forwardingMessage"
      @forward="handleForward"
    />
    
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