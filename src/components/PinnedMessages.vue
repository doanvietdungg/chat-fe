<template>
  <div class="pinned-messages" v-if="pinnedMessages.length > 0">
    <div class="pinned-header">
      <div class="pinned-info">
        <PushpinOutlined class="pin-icon" />
        <span class="pinned-count">{{ pinnedMessages.length }} tin nhắn đã ghim</span>
      </div>
      <a-button type="text" size="small" @click="toggleExpanded">
        <template #icon>
          <DownOutlined :class="{ 'rotated': isExpanded }" />
        </template>
      </a-button>
    </div>
    
    <a-collapse v-model:activeKey="activeKey" :bordered="false" class="pinned-collapse">
      <a-collapse-panel key="1" :show-arrow="false">
        <div class="pinned-list">
          <div 
            v-for="message in pinnedMessages" 
            :key="message.id"
            class="pinned-item"
            @click="scrollToMessage(message.id)"
          >
            <div class="pinned-content">
              <div class="pinned-author">
                <a-avatar size="small" :style="{ backgroundColor: '#1890ff' }">
                  {{ message.author?.[0]?.toUpperCase() }}
                </a-avatar>
                <span class="author-name">{{ message.author }}</span>
                <span class="pinned-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              
              <div class="pinned-text">
                <span v-if="message.text">{{ truncateText(message.text, 100) }}</span>
                <span v-else-if="message.media" class="media-indicator">
                  <FileImageOutlined v-if="message.media.type === 'image'" />
                  <VideoCameraOutlined v-else-if="message.media.type === 'video'" />
                  <FileOutlined v-else />
                  {{ message.media.fileName || 'File đính kèm' }}
                </span>
                <span v-else class="no-content">Tin nhắn không có nội dung</span>
              </div>
            </div>
            
            <div class="pinned-actions">
              <a-button 
                type="text" 
                size="small" 
                @click.stop="unpinMessage(message.id)"
                class="unpin-btn"
              >
                <template #icon>
                  <CloseOutlined />
                </template>
              </a-button>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PushpinOutlined, 
  DownOutlined, 
  CloseOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FileOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  chatId: { type: String, required: true },
  messages: { type: Array, default: () => [] }
})

const emit = defineEmits(['scroll-to-message', 'unpin-message'])

const isExpanded = ref(false)
const activeKey = ref([])

// Mock pinned messages
const pinnedMessages = computed(() => {
  return props.messages.filter(msg => msg.pinned).slice(0, 10) // Limit to 10 pinned messages
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
  activeKey.value = isExpanded.value ? ['1'] : []
}

function scrollToMessage(messageId) {
  emit('scroll-to-message', messageId)
}

function unpinMessage(messageId) {
  emit('unpin-message', messageId)
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Hôm qua'
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`
  } else {
    return date.toLocaleDateString('vi-VN')
  }
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.pinned-messages {
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.pinned-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pinned-header:hover {
  background: rgba(24, 144, 255, 0.05);
}

.pinned-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-icon {
  color: #1890ff;
  font-size: 16px;
}

.pinned-count {
  font-weight: 500;
  color: #1890ff;
  font-size: 14px;
}

.rotated {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.pinned-collapse {
  background: transparent;
}

.pinned-collapse :deep(.ant-collapse-item) {
  border: none;
}

.pinned-collapse :deep(.ant-collapse-content) {
  background: transparent;
  border: none;
}

.pinned-collapse :deep(.ant-collapse-content-box) {
  padding: 0;
}

.pinned-list {
  max-height: 300px;
  overflow-y: auto;
}

.pinned-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pinned-item:hover {
  background: rgba(24, 144, 255, 0.05);
}

.pinned-item:last-child {
  border-bottom: none;
}

.pinned-content {
  flex: 1;
  min-width: 0;
}

.pinned-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.author-name {
  font-weight: 500;
  font-size: 13px;
  color: #262626;
}

.pinned-time {
  font-size: 11px;
  color: #8c8c8c;
  margin-left: auto;
}

.pinned-text {
  font-size: 14px;
  color: #595959;
  line-height: 1.4;
  word-break: break-word;
}

.media-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  font-style: italic;
}

.no-content {
  color: #bfbfbf;
  font-style: italic;
}

.pinned-actions {
  margin-left: 8px;
  flex-shrink: 0;
}

.unpin-btn {
  color: #8c8c8c;
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unpin-btn:hover {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

/* Custom scrollbar */
.pinned-list::-webkit-scrollbar {
  width: 4px;
}

.pinned-list::-webkit-scrollbar-track {
  background: transparent;
}

.pinned-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}

.pinned-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .pinned-header {
    padding: 10px 12px;
  }
  
  .pinned-item {
    padding: 10px 12px;
  }
  
  .pinned-author {
    gap: 6px;
  }
  
  .author-name {
    font-size: 12px;
  }
  
  .pinned-text {
    font-size: 13px;
  }
  
  .pinned-list {
    max-height: 250px;
  }
}

/* Animation */
.pinned-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>