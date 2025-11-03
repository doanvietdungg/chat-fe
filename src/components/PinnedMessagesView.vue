<template>
  <div v-if="visible" class="pinned-messages-view">
    <!-- Header -->
    <div class="pinned-view-header">
      <a-button 
        type="text" 
        @click="closeView"
        class="back-btn"
      >
        <ArrowLeftOutlined />
      </a-button>
      <div class="header-info">
        <div class="header-title">Tin nhắn đã ghim</div>
        <div class="header-count">{{ pinnedMessages.length }} tin nhắn</div>
      </div>
      <a-dropdown v-if="pinnedMessages.length > 0" placement="bottomRight">
        <a-button 
          type="text" 
          class="menu-btn"
        >
          <MoreOutlined />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="unpin-all" @click="unpinAll">
              <span style="color: #ff4d4f;">Bỏ ghim tất cả</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- Messages Area -->
    <div class="pinned-messages-area">
      <!-- Empty State -->
      <div v-if="pinnedMessages.length === 0" class="empty-state">
        <div class="empty-icon">
          <PushpinOutlined />
        </div>
        <p class="empty-text">Chưa có tin nhắn nào được ghim</p>
        <p class="empty-hint">Nhấn giữ vào tin nhắn và chọn "Ghim" để ghim tin nhắn</p>
      </div>

      <!-- Pinned Messages List -->
      <div v-else class="messages-list">
        <div 
          v-for="message in pinnedMessages" 
          :key="message.id"
          :class="['message-item', { 'own-message': isOwnMessage(message) }]"
        >
          <div class="message-bubble">
            <div class="message-header">
              <span class="message-author">{{ message.author }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>

            <!-- Message Content -->
            <div class="message-content">
              <!-- Text -->
              <div v-if="message.text" class="message-text">
                {{ message.text }}
              </div>

              <!-- Media -->
              <div v-if="message.media" class="message-media">
                <div v-if="message.media.type === 'image'" class="media-image">
                  <img :src="message.media.url" :alt="message.media.name" />
                </div>
                <div v-else class="media-file">
                  <FileOutlined />
                  <span>{{ message.media.name }}</span>
                </div>
              </div>
            </div>

            <!-- Pin Info -->
            <div class="pin-info">
              <PushpinFilled />
              <span>Đã ghim {{ formatPinnedDate(message.pinnedAt) }}</span>
            </div>

            <!-- Actions -->
            <div class="message-actions">
              <a-button 
                type="text" 
                size="small"
                @click="scrollToMessage(message.id)"
                class="action-btn"
              >
                Đi đến tin nhắn
              </a-button>
              <a-button 
                type="text" 
                size="small"
                @click="unpinMessage(message.id)"
                class="action-btn unpin-btn"
              >
                Bỏ ghim
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ArrowLeftOutlined,
  PushpinOutlined,
  PushpinFilled,
  FileOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'
import { usePinnedMessagesStore } from '../store/pinnedMessages'
import { useAuthStore } from '../store/auth'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { onMounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'scroll-to-message', 'unpin', 'unpin-all'])

const pinnedMessagesStore = usePinnedMessagesStore()
const authStore = useAuthStore()

// Get all pinned messages for current chat
const pinnedMessages = computed(() => {
  return pinnedMessagesStore.getPinnedMessages(props.chatId) || []
})

// Fetch pinned messages when component is mounted or chatId changes
onMounted(async () => {
  if (props.chatId) {
    try {
      await pinnedMessagesStore.fetchPinnedMessages(props.chatId)
    } catch (error) {
      console.error('Failed to fetch pinned messages:', error)
    }
  }
})

function closeView() {
  emit('update:visible', false)
}

function scrollToMessage(messageId) {
  emit('scroll-to-message', messageId)
  closeView()
}

async function unpinMessage(messageId) {
  try {
    await pinnedMessagesStore.unpinMessage(props.chatId, messageId)
    emit('unpinned', messageId)
  } catch (error) {
    console.error('Failed to unpin message:', error)
  }
}

async function unpinAll() {
  try {
    // Unpin all messages for the current chat
    const messages = pinnedMessages.value
    for (const message of messages) {
      await pinnedMessagesStore.unpinMessage(props.chatId, message.id)
    }
    emit('unpinned-all')
  } catch (error) {
    console.error('Failed to unpin all messages:', error)
  }
}

function isOwnMessage(message) {
  return message.authorId === authStore.user?.id
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatPinnedDate(timestamp) {
  if (!timestamp) return 'gần đây'
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: vi 
    })
  } catch {
    return 'gần đây'
  }
}
</script>

<style scoped>
.pinned-messages-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
}

/* Header */
.pinned-view-header {
  display: grid;
  grid-template-columns: 52px 1fr 52px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #ffffff;
  min-height: 64px;
}

.back-btn {
  color: #8c8c8c !important;
  font-size: 20px;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  justify-self: start;
}

.back-btn:hover {
  background: #f5f5f5 !important;
  color: #1890ff !important;
}

.header-info {
  text-align: center;
  overflow: hidden;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-count {
  font-size: 13px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-btn {
  color: #8c8c8c !important;
  font-size: 20px;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  justify-self: end;
}

.menu-btn:hover {
  background: #f5f5f5 !important;
  color: #1890ff !important;
}

/* Messages Area */
.pinned-messages-area {
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #595959;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #8c8c8c;
  max-width: 280px;
  line-height: 1.5;
}

/* Messages List */
.messages-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  animation: fadeIn 0.3s ease-out;
}

.message-item.own-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.message-bubble:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.own-message .message-bubble {
  background: #e6f7ff;
  border-color: #bae7ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.message-author {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.own-message .message-author {
  color: #0050b3;
}

.message-time {
  font-size: 12px;
  color: #8c8c8c;
}

.message-content {
  margin-bottom: 8px;
}

.message-text {
  font-size: 14px;
  color: #262626;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-media {
  margin-top: 8px;
}

.media-image {
  max-width: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.media-image img {
  width: 100%;
  height: auto;
  display: block;
}

.media-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  color: #595959;
}

.pin-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 8px;
  padding: 6px 0;
  border-top: 1px solid #f0f0f0;
}

.message-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  font-size: 13px;
  color: #1890ff !important;
  padding: 4px 12px !important;
  height: auto !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  background: #f0f8ff !important;
}

.unpin-btn {
  color: #8c8c8c !important;
}

.unpin-btn:hover {
  background: #fff1f0 !important;
  color: #ff4d4f !important;
}

/* Animation */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar */
.pinned-messages-area::-webkit-scrollbar {
  width: 6px;
}

.pinned-messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.pinned-messages-area::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.pinned-messages-area::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }

  .pinned-view-header {
    padding: 10px 12px;
  }

  .messages-list {
    padding: 12px;
  }

  .header-title {
    font-size: 15px;
  }

  .unpin-all-btn {
    font-size: 13px;
  }
}
</style>
