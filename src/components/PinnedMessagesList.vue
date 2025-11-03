<template>
  <a-drawer
    v-model:open="visible"
    title="Tin nhắn đã ghim"
    placement="right"
    width="400"
    :closable="true"
    class="pinned-messages-drawer"
  >
    <template #extra>
      <a-button 
        v-if="pinnedMessages.length > 0"
        type="text" 
        danger
        size="small"
        @click="unpinAll"
      >
        Bỏ ghim tất cả
      </a-button>
    </template>

    <div class="pinned-messages-list">
      <!-- Empty State -->
      <div v-if="pinnedMessages.length === 0" class="empty-state">
        <div class="empty-icon">
          <PushpinOutlined />
        </div>
        <p class="empty-text">Chưa có tin nhắn nào được ghim</p>
        <p class="empty-hint">Nhấn giữ vào tin nhắn và chọn "Ghim" để ghim tin nhắn</p>
      </div>

      <!-- Pinned Messages -->
      <div v-else class="messages-container">
        <div 
          v-for="message in pinnedMessages" 
          :key="message.id"
          class="pinned-message-item"
          @click="scrollToMessage(message.id)"
        >
          <div class="message-header">
            <a-avatar 
              :size="32" 
              :style="{ backgroundColor: getAvatarColor(message.authorId) }"
            >
              {{ message.author?.[0]?.toUpperCase() || '?' }}
            </a-avatar>
            <div class="message-author-info">
              <span class="author-name">{{ message.author }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <a-button 
              type="text" 
              size="small"
              @click.stop="unpinMessage(message.id)"
              class="unpin-btn-small"
              title="Bỏ ghim"
            >
              <CloseOutlined />
            </a-button>
          </div>

          <div class="message-content">
            <!-- Text Message -->
            <div v-if="message.text" class="message-text">
              {{ message.text }}
            </div>

            <!-- Media Message -->
            <div v-if="message.media" class="message-media">
              <div v-if="message.media.type === 'image'" class="media-preview">
                <img :src="message.media.url" :alt="message.media.name" />
              </div>
              <div v-else class="media-file">
                <FileOutlined />
                <span>{{ message.media.name }}</span>
              </div>
            </div>

            <!-- Pinned Date -->
            <div class="pinned-date">
              <PushpinFilled />
              Đã ghim {{ formatPinnedDate(message.pinnedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { 
  PushpinOutlined, 
  PushpinFilled,
  CloseOutlined,
  FileOutlined
} from '@ant-design/icons-vue'
import { useMessagesStore } from '../store/messages'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:open', 'scroll-to-message', 'unpin', 'unpin-all'])

const messagesStore = useMessagesStore()

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// Get all pinned messages for current chat
const pinnedMessages = computed(() => {
  const messages = messagesStore.getMessagesForChat(props.chatId)
  return messages.filter(m => m.pinned).sort((a, b) => 
    new Date(b.pinnedAt || b.timestamp) - new Date(a.pinnedAt || a.timestamp)
  )
})

function scrollToMessage(messageId) {
  emit('scroll-to-message', messageId)
  visible.value = false
}

function unpinMessage(messageId) {
  emit('unpin', messageId)
}

function unpinAll() {
  emit('unpin-all')
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

function getAvatarColor(userId) {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']
  if (!userId) return colors[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.pinned-messages-drawer :deep(.ant-drawer-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.pinned-messages-drawer :deep(.ant-drawer-body) {
  padding: 0;
}

.pinned-messages-list {
  height: 100%;
  display: flex;
  flex-direction: column;
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

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
}

.pinned-message-item {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pinned-message-item:hover {
  background-color: #fafafa;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.message-author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.message-time {
  font-size: 12px;
  color: #8c8c8c;
}

.unpin-btn-small {
  color: #8c8c8c !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.unpin-btn-small:hover {
  background-color: #fff1f0 !important;
  color: #ff4d4f !important;
}

.message-content {
  margin-left: 44px;
}

.message-text {
  font-size: 14px;
  color: #262626;
  line-height: 1.6;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.message-media {
  margin-bottom: 8px;
}

.media-preview {
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.media-preview img {
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

.pinned-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #faad14;
  margin-top: 8px;
}

/* Scrollbar */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .pinned-messages-drawer {
    width: 100% !important;
  }

  .pinned-message-item {
    padding: 12px 16px;
  }

  .message-content {
    margin-left: 0;
    margin-top: 8px;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .empty-icon {
    font-size: 48px;
  }
}
</style>
