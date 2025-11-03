<template>
  <div v-if="pinnedMessage" class="pinned-message-container">
    <div class="pinned-message-content" @click="scrollToPinnedMessage">
      <div class="pinned-info">
        <div class="pinned-label">
          <span class="pin-icon">📌</span>
          Tin nhắn đã ghim
          <span v-if="pinnedMessages.length > 1" class="pinned-count">
            ({{ pinnedMessages.length }})
          </span>
        </div>
        <div class="pinned-text">
          <span v-if="pinnedMessage.type === 'IMAGE'" class="media-indicator">
            <PictureOutlined /> Ảnh
          </span>
          <span v-else-if="pinnedMessage.type === 'FILE'" class="media-indicator">
            <FileOutlined /> Tệp đính kèm
          </span>
          <span v-else>{{ truncateText(pinnedMessage.text, 80) || 'Tin nhắn đã ghim' }}</span>
        </div>
      </div>
      
      <div class="pinned-actions">
        <a-button 
          type="text" 
          size="small" 
          @click.stop="showPinnedList"
          class="menu-icon-btn"
          title="Xem danh sách tin nhắn đã ghim"
        >
          <MenuOutlined />
        </a-button>
        <a-button 
          type="text" 
          size="small" 
          @click.stop="unpinMessage"
          class="close-btn"
          title="Đóng"
        >
          <CloseOutlined />
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { 
  CloseOutlined,
  PictureOutlined,
  FileOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'
import { useMessagesStore } from '../store/messages'
import { usePinnedMessagesStore } from '../store/pinnedMessages'

const props = defineProps({
  chatId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['scroll-to-message', 'unpin', 'show-list'])

const messagesStore = useMessagesStore()
const pinnedMessagesStore = usePinnedMessagesStore()

// State
const isLoading = ref(false)
const error = ref(null)

// Get pinned messages for current chat
const pinnedMessages = computed(() => {
  return pinnedMessagesStore.getPinnedMessages(props.chatId)
})

// Get the most recent pinned message to show in the banner
const pinnedMessage = computed(() => {
  if (!pinnedMessages.value || pinnedMessages.value.length === 0) return null
  // Sort by pinnedAt in descending order (newest first) and get the first one
  return [...pinnedMessages.value].sort((a, b) => 
    new Date(b.pinnedAt) - new Date(a.pinnedAt)
  )[0]
})

// Fetch pinned messages when component mounts
onMounted(async () => {
  try {
    isLoading.value = true
    await pinnedMessagesStore.fetchPinnedMessages(props.chatId)
  } catch (err) {
    console.error('Failed to load pinned messages:', err)
    error.value = 'Failed to load pinned messages'
  } finally {
    isLoading.value = false
  }
})

function scrollToPinnedMessage() {
  if (pinnedMessage.value) {
    emit('scroll-to-message', pinnedMessage.value.id)
  }
}

async function unpinMessage() {
  if (!pinnedMessage.value) return
  
  try {
    await pinnedMessagesStore.unpinMessage(props.chatId, pinnedMessage.value.id)
    emit('unpinned', pinnedMessage.value.id)
  } catch (err) {
    console.error('Failed to unpin message:', err)
    // You might want to show an error message to the user here
  }
}

async function showPinnedList() {
  try {
    await pinnedMessagesStore.fetchPinnedMessages(props.chatId)
    emit('show-list')
  } catch (err) {
    console.error('Failed to load pinned messages:', err)
    // You might want to show an error message to the user here
  }
}

function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.pinned-message-container {
  background: var(--bg-color);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--border-radius);
  margin: var(--spacing-sm) var(--spacing-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid var(--border-light);
}

.pinned-message-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--chat-bg);
}

.pinned-message-content:hover {
  background: var(--message-bg);
}

.pinned-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 8px;
}

.pinned-label {
  font-weight: 500;
  font-size: 13px;
  color: var(--primary-color);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pinned-label .pin-icon {
  font-size: 12px;
}

.pinned-label .pinned-count {
  color: var(--text-secondary);
  font-weight: normal;
}

.pinned-text {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.media-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #b8d9f5;
}

.pinned-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
}

.menu-icon-btn,
.close-btn {
  color: var(--text-secondary) !important;
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
  font-size: 16px;
  flex-shrink: 0 !important;
  padding: 0 !important;
  background: transparent !important;
}

.menu-icon-btn:hover,
.close-btn:hover {
  background-color: var(--border-light) !important;
  color: var(--primary-color) !important;
}

/* Animation */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .pinned-message-content {
    padding: 10px 12px;
    gap: 8px;
  }

  .pinned-label {
    font-size: 12px;
  }

  .pinned-text {
    font-size: 13px;
  }

  .menu-icon-btn,
  .close-btn {
    width: 28px !important;
    height: 28px !important;
    font-size: 14px;
  }
}
</style>
