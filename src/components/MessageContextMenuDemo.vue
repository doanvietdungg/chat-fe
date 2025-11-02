<template>
  <div class="context-menu-demo-container">
    <div class="demo-header">
      <h2>Message Context Menu Demo</h2>
      <p>Nhấn chuột phải vào tin nhắn để xem context menu</p>
    </div>

    <div class="demo-chat">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message-wrapper"
        :class="{ 'own-message': message.isOwn }"
        @contextmenu="showContextMenu($event, message)"
      >
        <div class="message-bubble" :class="{ 'own-bubble': message.isOwn }">
          <div v-if="!message.isOwn" class="message-author">{{ message.author }}</div>
          <div class="message-text">{{ message.text }}</div>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </div>

    <div class="demo-actions">
      <a-space>
        <a-button type="primary" @click="addMessage">
          Thêm tin nhắn
        </a-button>
        <a-button @click="clearMessages">
          Xóa tất cả
        </a-button>
      </a-space>
    </div>

    <!-- Context Menu -->
    <MessageContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :message-data="contextMenuMessage"
      @close="closeContextMenu"
      @action="handleContextMenuAction"
    />

    <!-- Action Log -->
    <div class="action-log">
      <h3>Action Log:</h3>
      <div class="log-entries">
        <div 
          v-for="(log, index) in actionLog" 
          :key="index"
          class="log-entry"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-action">{{ log.action }}</span>
          <span class="log-details">{{ log.details }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import MessageContextMenu from './MessageContextMenu.vue'

// Demo data
const messages = ref([
  {
    id: 'msg-1',
    text: 'Xin chào! Đây là tin nhắn demo đầu tiên',
    author: 'Alice',
    authorId: 'user-alice',
    time: '10:30',
    isOwn: false
  },
  {
    id: 'msg-2',
    text: 'Chào Alice! Tôi đang test context menu',
    author: 'You',
    authorId: 'current-user',
    time: '10:31',
    isOwn: true
  },
  {
    id: 'msg-3',
    text: 'Nhấn chuột phải vào tin nhắn này để xem menu 👆',
    author: 'Alice',
    authorId: 'user-alice',
    time: '10:32',
    isOwn: false
  },
  {
    id: 'msg-4',
    text: 'Wow! Context menu rất đẹp và đầy đủ tính năng 🎉',
    author: 'You',
    authorId: 'current-user',
    time: '10:33',
    isOwn: true
  }
])

// Context menu state
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuMessage = ref(null)

// Action log
const actionLog = ref([])

// Methods
function showContextMenu(event, messageData) {
  event.preventDefault()
  
  contextMenuMessage.value = messageData
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
  
  addToLog('show-context-menu', `Opened context menu for message: "${messageData.text.slice(0, 30)}..."`)
}

function closeContextMenu() {
  contextMenuVisible.value = false
  contextMenuMessage.value = null
  
  addToLog('close-context-menu', 'Context menu closed')
}

function handleContextMenuAction(action, data) {
  let details = ''
  
  switch (action) {
    case 'reply':
      details = `Replying to: "${data.text.slice(0, 30)}..."`
      message.success('Reply action triggered')
      break
    case 'edit':
      details = `Editing message: "${data.text.slice(0, 30)}..."`
      message.success('Edit action triggered')
      break
    case 'react':
      details = `Added ${data.emoji} reaction`
      message.success(`Added ${data.emoji} reaction`)
      break
    case 'copy-text':
      details = 'Message text copied to clipboard'
      message.success('Text copied to clipboard')
      break
    case 'copy-link':
      details = 'Message link copied to clipboard'
      message.success('Message link copied')
      break
    case 'forward':
      details = `Forwarding message: "${data.text.slice(0, 30)}..."`
      message.success('Forward action triggered')
      break
    case 'delete':
      details = `Deleted message: "${data.text.slice(0, 30)}..."`
      message.success('Message deleted')
      // Remove message from demo
      const index = messages.value.findIndex(m => m.id === data.id)
      if (index > -1) {
        messages.value.splice(index, 1)
      }
      break
    case 'pin':
      details = `Pinned message: "${data.text.slice(0, 30)}..."`
      message.success('Message pinned')
      break
    case 'select':
      details = `Selected message: "${data.text.slice(0, 30)}..."`
      message.success('Message selected')
      break
    case 'show-more-reactions':
      details = 'Opened reaction picker'
      message.info('Reaction picker would open here')
      break
    default:
      details = `Unknown action: ${action}`
  }
  
  addToLog(action, details)
}

function addMessage() {
  const newMessage = {
    id: `msg-${Date.now()}`,
    text: `Tin nhắn mới được thêm lúc ${new Date().toLocaleTimeString()}`,
    author: Math.random() > 0.5 ? 'You' : 'Alice',
    authorId: Math.random() > 0.5 ? 'current-user' : 'user-alice',
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    isOwn: Math.random() > 0.5
  }
  
  messages.value.push(newMessage)
  message.success('Added new message')
}

function clearMessages() {
  messages.value = []
  actionLog.value = []
  message.success('Cleared all messages and logs')
}

function addToLog(action, details) {
  actionLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    action: action,
    details: details
  })
  
  // Keep only last 20 entries
  if (actionLog.value.length > 20) {
    actionLog.value = actionLog.value.slice(0, 20)
  }
}
</script>

<style scoped>
.context-menu-demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h2 {
  margin: 0 0 8px 0;
  color: #262626;
}

.demo-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.demo-chat {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.own-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: #ffffff;
  color: #262626;
  cursor: context-menu;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-bubble:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.message-bubble.own-bubble {
  background: #1890ff;
  color: white;
  border-bottom-right-radius: 6px;
}

.message-wrapper:not(.own-message) .message-bubble {
  border-bottom-left-radius: 6px;
}

.message-author {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1890ff;
}

.own-bubble .message-author {
  color: rgba(255, 255, 255, 0.9);
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
}

.demo-actions {
  text-align: center;
  margin-bottom: 30px;
}

.action-log {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
}

.action-log h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #262626;
}

.log-entries {
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #8c8c8c;
  font-family: monospace;
  min-width: 60px;
}

.log-action {
  color: #1890ff;
  font-weight: 500;
  min-width: 120px;
}

.log-details {
  color: #595959;
  flex: 1;
}

/* Custom scrollbar */
.demo-chat::-webkit-scrollbar,
.log-entries::-webkit-scrollbar {
  width: 6px;
}

.demo-chat::-webkit-scrollbar-track,
.log-entries::-webkit-scrollbar-track {
  background: transparent;
}

.demo-chat::-webkit-scrollbar-thumb,
.log-entries::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.demo-chat::-webkit-scrollbar-thumb:hover,
.log-entries::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .context-menu-demo-container {
    padding: 10px;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .log-entry {
    flex-direction: column;
    gap: 4px;
  }
  
  .log-time,
  .log-action {
    min-width: auto;
  }
}
</style>