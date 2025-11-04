<template>
  <div 
    v-if="visible" 
    class="context-menu-overlay" 
    @click="closeMenu"
    @contextmenu.prevent
  >
    <!-- Emoji reactions bar -->
    <div 
      v-if="showReactions"
      class="reactions-bar" 
      :style="{ top: (position.y - 60) + 'px', left: position.x + 'px' }"
      @click.stop
    >
      <div 
        v-for="emoji in quickEmojis" 
        :key="emoji"
        class="reaction-emoji"
        @click="addReaction(emoji)"
      >
        {{ emoji }}
      </div>
      <div class="reaction-more" @click="showMoreReactions">
        <DownOutlined />
      </div>
    </div>

    <!-- Context menu -->
    <div 
      class="context-menu" 
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="replyToMessage">
        <div class="menu-icon">
          <RollbackOutlined />
        </div>
        <span class="menu-text">Reply</span>
      </div>

      <div v-if="canEdit" class="menu-item" @click="editMessage">
        <div class="menu-icon">
          <EditOutlined />
        </div>
        <span class="menu-text">Edit</span>
      </div>

      <div class="menu-item" @click="pinMessage">
        <div class="menu-icon">
          <PushpinOutlined />
        </div>
        <span class="menu-text">
          {{ isMessagePinned ? 'Unpin' : 'Pin' }} message
        </span>
      </div>

      <div class="menu-item" @click="copyText">
        <div class="menu-icon">
          <CopyOutlined />
        </div>
        <span class="menu-text">Copy Text</span>
      </div>

      <div class="menu-item" @click="copyMessageLink">
        <div class="menu-icon">
          <LinkOutlined />
        </div>
        <span class="menu-text">Copy Message Link</span>
      </div>

      <div class="menu-item" @click="forwardMessage">
        <div class="menu-icon">
          <ForwardOutlined />
        </div>
        <span class="menu-text">Forward</span>
      </div>

      <div v-if="canDelete" class="menu-item danger" @click="deleteMessage">
        <div class="menu-icon">
          <DeleteOutlined />
        </div>
        <span class="menu-text">Delete</span>
      </div>

      <div class="menu-item" @click="selectMessage">
        <div class="menu-icon">
          <CheckCircleOutlined />
        </div>
        <span class="menu-text">Select</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { usePinnedMessagesStore } from '../store/pinnedMessages'
import {
  RollbackOutlined,
  EditOutlined,
  PushpinOutlined,
  CopyOutlined,
  LinkOutlined,
  ForwardOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { useMessagesStore } from '../store/messages'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  messageData: {
    type: Object,
    default: null
  },
  showReactions: {
    type: Boolean,
    default: true
  },
  chatId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'action'])

const messagesStore = useMessagesStore()
const authStore = useAuthStore()
const pinnedMessagesStore = usePinnedMessagesStore()

// Quick reaction emojis
const quickEmojis = ['👍', '😂', '❤️', '😮', '😢', '😱', '🔥']

// Computed properties
const canEdit = computed(() => {
  return props.messageData?.authorId === authStore.user?.id || 
         String(props.messageData?.authorId) === String(authStore.user?.id)
})

const isMessagePinned = computed(() => {
  if (!props.messageData?.id || !props.chatId) return false
  return pinnedMessagesStore.isMessagePinned(props.chatId, props.messageData.id)
})

const canDelete = computed(() => {
  console.log('Debug canDelete:', {
    messageAuthorId: props.messageData?.authorId,
    currentUserId: authStore.user?.id,
    messageData: props.messageData,
    user: authStore.user
  })
  return props.messageData?.authorId === authStore.user?.id || 
         String(props.messageData?.authorId) === String(authStore.user?.id)
})

// Methods
function closeMenu() {
  emit('close')
}

function addReaction(emoji) {
  if (!props.messageData?.id) return
  
  try {
    messagesStore.addReaction(props.messageData.id, emoji)
    message.success(`Added ${emoji} reaction`)
    emit('action', 'react', { emoji })
  } catch (error) {
    message.error('Failed to add reaction')
  }
  closeMenu()
}

function showMoreReactions() {
  emit('action', 'show-more-reactions')
  closeMenu()
}

function replyToMessage() {
  if (!props.messageData?.id) return
  
  emit('action', 'reply', props.messageData)
  closeMenu()
}

function editMessage() {
  if (!props.messageData?.id || !canEdit.value) return
  
  emit('action', 'edit', props.messageData)
  closeMenu()
}

async function pinMessage() {
  if (!props.messageData?.id || !props.chatId) return
  
  try {
    const chatId = props.chatId
    const messageId = props.messageData.id
    
    // Check if message is already pinned
    const isPinned = await pinnedMessagesStore.isMessagePinned(chatId, messageId)
    
    if (isPinned) {
      // If already pinned, unpin it
      await pinnedMessagesStore.unpinMessage(chatId, messageId)
      message.success('Message unpinned')
      emit('action', 'unpin', props.messageData)
    } else {
      // If not pinned, pin it
      await pinnedMessagesStore.pinMessage(chatId, messageId)
      message.success('Message pinned')
      emit('action', 'pin', props.messageData)
    }
  } catch (error) {
    console.error('Pin message error:', error)
    message.error(error.value || 'Failed to update pin status')
  }
  closeMenu()
}

function copyText() {
  const textToCopy = props.messageData?.content || props.messageData?.text
  if (!textToCopy) return
  
  try {
    navigator.clipboard.writeText(textToCopy)
    message.success('Text copied to clipboard')
    emit('action', 'copy-text')
  } catch (error) {
    message.error('Failed to copy text')
  }
  closeMenu()
}

function copyMessageLink() {
  if (!props.messageData?.id) return
  
  try {
    const link = `${window.location.origin}/chat/${props.messageData.chatId}?message=${props.messageData.id}`
    navigator.clipboard.writeText(link)
    message.success('Message link copied to clipboard')
    emit('action', 'copy-link')
  } catch (error) {
    message.error('Failed to copy message link')
  }
  closeMenu()
}

function forwardMessage() {
  if (!props.messageData?.id) return
  
  emit('action', 'forward', props.messageData)
  closeMenu()
}

function deleteMessage() {
  if (!props.messageData?.id || !canDelete.value) return
  
  Modal.confirm({
    title: 'Delete message?',
    content: 'Are you sure you want to delete this message? This action cannot be undone.',
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        await messagesStore.deleteMessage(props.messageData.id)
        message.success('Message deleted')
        emit('action', 'delete', props.messageData)
      } catch (error) {
        message.error('Failed to delete message')
      }
    }
  })
  closeMenu()
}

function selectMessage() {
  if (!props.messageData?.id) return
  
  emit('action', 'select', props.messageData)
  closeMenu()
}
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: transparent;
}

.reactions-bar {
  position: absolute;
  background: rgba(40, 40, 40, 0.95);
  border-radius: 25px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2002;
  animation: reactionsBarFadeIn 0.2s ease-out;
  backdrop-filter: blur(10px);
}

@keyframes reactionsBarFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.reaction-emoji {
  font-size: 20px;
  padding: 4px 6px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.reaction-emoji:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.reaction-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #ffffff;
  font-size: 12px;
}

.reaction-more:hover {
  background: rgba(255, 255, 255, 0.1);
}

.context-menu {
  position: absolute;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e8e8e8;
  min-width: 200px;
  padding: 8px 0;
  z-index: 2001;
  animation: contextMenuFadeIn 0.15s ease-out;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  gap: 12px;
  font-size: 14px;
  color: #262626;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.danger {
  color: #ff4d4f;
}

.menu-item.danger:hover {
  background-color: #fff2f0;
}

.menu-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: inherit;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  color: inherit;
  font-weight: 400;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .context-menu {
    background: #2f2f2f;
    border-color: #404040;
    color: #ffffff;
  }
  
  .menu-item {
    color: #ffffff;
  }
  
  .menu-item:hover {
    background-color: #404040;
  }
  
  .menu-item.danger:hover {
    background-color: #4a2626;
  }
}

/* Responsive positioning */
@media (max-width: 768px) {
  .context-menu {
    min-width: 180px;
    max-width: calc(100vw - 32px);
  }
  
  .reactions-bar {
    max-width: calc(100vw - 32px);
    overflow-x: auto;
    scrollbar-width: none;
  }
  
  .reactions-bar::-webkit-scrollbar {
    display: none;
  }
}

/* Prevent menu from going off-screen */
.context-menu {
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

.reactions-bar {
  max-width: 400px;
}

/* Custom scrollbar for menu */
.context-menu::-webkit-scrollbar {
  width: 6px;
}

.context-menu::-webkit-scrollbar-track {
  background: transparent;
}

.context-menu::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.context-menu::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>