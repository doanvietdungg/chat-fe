<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { 
  FileOutlined, 
  DownloadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons-vue'
import MessageReactions from './MessageReactions.vue'
import QuickReactions from './QuickReactions.vue'
import ReactionPicker from './ReactionPicker.vue'
import { useStores } from '../composables/useStores'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  messages: { type: Array, required: true },
  username: { type: String, required: true },
  loading: { type: Boolean, default: false },
})

const { messagesStore, uiStore, showContextMenu } = useStores()
const authStore = useAuthStore()

const messageContainer = ref(null)
const hoveredMessageId = ref(null)
const showQuickReactions = ref(null)

const processedMessages = computed(() => {
  console.log('Processing messages:', props.messages)
  
  const messages = props.messages.map(message => {
    const isOwn = message.authorId === authStore.user?.id
    console.log(`Message ${message.id}: authorId=${message.authorId}, currentUserId=${authStore.user?.id}, isOwn=${isOwn}`)
    
    return {
      ...message,
      isOwn,
      formattedTime: formatTime(message.timestamp || message.at),
      authorInitial: message.author?.[0]?.toUpperCase() || '?',
      timestamp: new Date(message.timestamp || message.at).getTime()
    }
  })

  // Group messages by time and author
  return messages.map((message, index) => {
    const prevMessage = messages[index - 1]
    const nextMessage = messages[index + 1]
    
    // Show timestamp if:
    // 1. First message
    // 2. Different author from previous
    // 3. More than 15 minutes from previous message
    const showTime = !prevMessage || 
                    prevMessage.author !== message.author ||
                    (message.timestamp - prevMessage.timestamp) > 15 * 60 * 1000

    // Show author if:
    // 1. First message
    // 2. Different author from previous
    // 3. More than 15 minutes from previous message
    // 4. Not own message
    const showAuthor = !message.isOwn && (!prevMessage || 
                      prevMessage.author !== message.author ||
                      (message.timestamp - prevMessage.timestamp) > 15 * 60 * 1000)

    // Check if this is the last message in a group (for spacing)
    const isLastInGroup = !nextMessage ||
                         nextMessage.author !== message.author ||
                         (nextMessage.timestamp - message.timestamp) > 15 * 60 * 1000

    return {
      ...message,
      showTime,
      showAuthor,
      isLastInGroup
    }
  })
})

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(fileType) {
  if (!fileType) return FileOutlined
  
  if (fileType.startsWith('image/')) return PictureOutlined
  if (fileType.startsWith('video/')) return VideoCameraOutlined
  if (fileType.startsWith('audio/')) return CustomerServiceOutlined
  
  return FileOutlined
}

function getFileTypeColor(fileType) {
  if (!fileType) return '#1890ff'
  
  if (fileType.startsWith('image/')) return '#52c41a'
  if (fileType.startsWith('video/')) return '#722ed1'
  if (fileType.startsWith('audio/')) return '#fa8c16'
  
  return '#1890ff'
}

function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// Auto scroll to bottom when new messages arrive
watch(() => props.messages.length, () => {
  scrollToBottom()
}, { immediate: true })
</script>

<template>
  <div class="message-area" ref="messageContainer">
    <div class="messages-container">
      <div
        v-for="message in processedMessages"
        :key="message.id"
        :class="[
          'message-wrapper', 
          { 
            'own-message': message.isOwn,
            'grouped-message': !message.showAuthor && !message.isOwn,
            'last-in-group': message.isLastInGroup,
            'hovered': hoveredMessageId === message.id
          }
        ]"
        @mouseenter="hoveredMessageId = message.id"
        @mouseleave="hoveredMessageId = null"
        @contextmenu="showContextMenu($event, message.id)"
      >
        <!-- Message Header (only for first message in group) -->
        <div class="message-header" v-if="message.showAuthor">
          <a-avatar 
            size="small" 
            :style="{ backgroundColor: '#1890ff', fontSize: '12px' }"
          >
            {{ message.authorInitial }}
          </a-avatar>
          <span class="message-author">{{ message.author }}</span>
          <span class="message-time" v-if="message.showTime">{{ message.formattedTime }}</span>
        </div>

        <div 
          :class="['message-bubble', { 'own-bubble': message.isOwn, 'grouped-bubble': !message.showAuthor && !message.isOwn }]"
          style="position: relative"
        >
          <!-- Own message time (only when showTime is true) -->
          <div class="own-message-time" v-if="message.isOwn && message.showTime">
            {{ message.formattedTime }}
          </div>

          <!-- Message Content -->
          <div class="message-content">
            <!-- Reply Preview (if this message is a reply) -->
            <div v-if="message.replyTo" class="reply-preview">
              <div class="reply-line"></div>
              <div class="reply-content">
                <div class="reply-author">{{ message.replyTo.author }}</div>
                <div class="reply-text">{{ message.replyTo.text }}</div>
              </div>
            </div>

            <!-- File Attachment -->
            <div v-if="message.file" class="message-file">
              <a-tag 
                :color="getFileTypeColor(message.file.type)"
                class="file-tag"
              >
                <template #icon>
                  <component :is="getFileIcon(message.file.type)" />
                </template>
                <span class="file-info">
                  <span class="file-name">{{ message.file.name }}</span>
                  <span class="file-size">({{ formatFileSize(message.file.size) }})</span>
                </span>
              </a-tag>
              
              <div v-if="message.fileUrl" class="file-actions">
                <a :href="message.fileUrl" target="_blank" download>
                  <a-button type="link" size="small">
                    <template #icon><DownloadOutlined /></template>
                    Tải xuống
                  </a-button>
                </a>
              </div>
            </div>

            <!-- Text Message -->
            <div v-if="message.text && !message.deleted" class="message-text">
              {{ message.text }}
              <span v-if="message.edited" class="edited-indicator">edited</span>
            </div>
            
            <!-- Debug: Show message data -->
            <div v-if="!message.text && !message.file && !message.deleted" class="debug-message">
              <small>Debug: {{ JSON.stringify(message) }}</small>
            </div>

            <!-- Deleted message -->
            <div v-if="message.deleted" class="deleted-message">
              <em>{{ message.text }}</em>
            </div>

            <!-- Forwarded indicator -->
            <div v-if="message.forwarded" class="forwarded-indicator">
              <small>Forwarded from {{ message.forwarded.originalSender }}</small>
            </div>
          </div>

          <!-- Message Reactions -->
          <MessageReactions 
            v-if="message.reactions && message.reactions.length > 0"
            :message-id="message.id"
            :reactions="message.reactions"
          />

          <!-- Quick Reactions (on hover) -->
          <QuickReactions
            v-if="hoveredMessageId === message.id && !message.isOwn"
            :message-id="message.id"
            :visible="true"
            @close="hoveredMessageId = null"
          />
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="loading-messages">
        <div v-for="i in 3" :key="i" class="message-skeleton">
          <a-skeleton-avatar size="small" />
          <div class="skeleton-content">
            <a-skeleton-input size="small" style="width: 100px;" />
            <a-skeleton :paragraph="{ rows: 1, width: '60%' }" :title="false" />
          </div>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="processedMessages.length === 0" class="empty-messages">
        <div class="empty-content">
          <p>Chưa có tin nhắn nào</p>
          <p class="empty-subtitle">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
    </div>

    <!-- Reaction Picker Modal -->
    <ReactionPicker
      :visible="uiStore.state.modals.reactions"
      :message-id="uiStore.state.contextMenu.messageId"
      @close="uiStore.closeModal('reactions')"
    />
  </div>
</template>

<style scoped>
.message-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  background: var(--bg-color);
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-height: 100%;
  width: 100%;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: var(--spacing-xs);
  width: 100%;
}

.message-wrapper.own-message {
  align-items: flex-end;
}

.message-wrapper.grouped-message {
  margin-top: 2px;
}

.message-wrapper.last-in-group {
  margin-bottom: var(--spacing-md);
}

.message-bubble {
  max-width: 70%;
  min-width: 100px;
  background: var(--message-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  position: relative;
  word-wrap: break-word;
}

.message-bubble.own-bubble {
  background: var(--own-message-bg);
  color: var(--text-white);
}

.message-bubble.grouped-bubble {
  margin-left: 40px; /* Align with previous messages (avatar width + gap) */
  border-top-left-radius: var(--border-radius);
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  padding-left: 2px;
}

.message-author {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.message-time {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: auto;
}

.own-message-time {
  position: absolute;
  top: -18px;
  right: 0;
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-color);
  padding: 2px 4px;
  border-radius: 4px;
}

.message-content {
  line-height: 1.4;
  width: 100%;
  min-height: 20px;
}

.message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.own-bubble .message-text {
  color: var(--text-white);
}

.message-file {
  margin-bottom: var(--spacing-sm);
}

.file-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xs);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-weight: 500;
  font-size: 13px;
}

.file-size {
  font-size: 11px;
  opacity: 0.8;
}

.file-actions {
  margin-top: var(--spacing-xs);
}

.own-bubble .file-actions .ant-btn-link {
  color: var(--text-white);
}

.empty-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  color: var(--text-secondary);
}

.empty-content p {
  margin: 0;
  font-size: 16px;
}

.empty-subtitle {
  font-size: 14px !important;
  margin-top: var(--spacing-xs) !important;
}

.loading-messages {
  padding: var(--spacing-md);
}

.message-skeleton {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.skeleton-content {
  flex: 1;
}

/* Message animations */
.message-wrapper {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Grouped message styling */
.message-wrapper.grouped-message .message-bubble {
  margin-top: 2px;
}

.message-wrapper.own-message.grouped-message .message-bubble {
  margin-left: 0;
  border-top-right-radius: var(--border-radius);
}

.message-wrapper.own-message .message-bubble.grouped-bubble {
  border-top-right-radius: var(--border-radius);
  border-top-left-radius: var(--border-radius-lg);
}

/* Reply preview styling */
.reply-preview {
  display: flex;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius);
  cursor: pointer;
}

.reply-line {
  width: 3px;
  background: var(--primary-color);
  border-radius: 2px;
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-author {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 2px;
}

.reply-text {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Message states */
.edited-indicator {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
  font-style: italic;
}

.deleted-message {
  color: var(--text-secondary);
  font-style: italic;
}

.forwarded-indicator {
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.forwarded-indicator small {
  color: var(--text-secondary);
  font-size: 11px;
}

/* Hover effects */
.message-wrapper.hovered .message-bubble {
  box-shadow: var(--shadow-md);
}

.message-wrapper {
  position: relative;
}

/* Dark theme support for reply preview */
.own-bubble .reply-preview {
  background: rgba(255, 255, 255, 0.1);
}

.own-bubble .reply-text {
  color: rgba(255, 255, 255, 0.8);
}

.own-bubble .edited-indicator {
  color: rgba(255, 255, 255, 0.7);
}

.own-bubble .forwarded-indicator {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.own-bubble .forwarded-indicator small {
  color: rgba(255, 255, 255, 0.7);
}

/* Debug styles */
.debug-message {
  background: #ffeb3b;
  padding: 4px;
  font-size: 10px;
  border-radius: 4px;
  margin: 4px 0;
}

/* Ensure message wrapper takes full width */
.message-wrapper {
  box-sizing: border-box;
}

.message-bubble {
  box-sizing: border-box;
}

/* Responsive design */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .message-area {
    padding: var(--spacing-sm);
  }
}

@media (max-width: 576px) {
  .message-bubble {
    max-width: 95%;
  }
}

/* Custom scrollbar for message area */
.message-area::-webkit-scrollbar {
  width: 6px;
}

.message-area::-webkit-scrollbar-track {
  background: transparent;
}

.message-area::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.message-area::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>