<template>
  <div class="selection-mode" v-if="isSelectionMode">
    <!-- Selection Header -->
    <div class="selection-header">
      <div class="selection-info">
        <a-button type="text" @click="exitSelectionMode" class="close-btn">
          <template #icon><CloseOutlined /></template>
        </a-button>
        <span class="selection-count">{{ selectedMessages.length }} đã chọn</span>
      </div>
      
      <div class="selection-actions">
        <a-button 
          type="text" 
          @click="selectAll"
          :disabled="selectedMessages.length === totalMessages"
        >
          Chọn tất cả
        </a-button>
      </div>
    </div>
    
    <!-- Action Bar -->
    <div class="action-bar">
      <a-button 
        type="text" 
        @click="forwardMessages"
        :disabled="selectedMessages.length === 0"
        class="action-btn"
      >
        <template #icon><ForwardOutlined /></template>
        Chuyển tiếp
      </a-button>
      
      <a-button 
        type="text" 
        @click="copyMessages"
        :disabled="selectedMessages.length === 0"
        class="action-btn"
      >
        <template #icon><CopyOutlined /></template>
        Sao chép
      </a-button>
      
      <a-button 
        type="text" 
        @click="pinMessages"
        :disabled="selectedMessages.length === 0"
        class="action-btn"
      >
        <template #icon><PushpinOutlined /></template>
        Ghim
      </a-button>
      
      <a-button 
        type="text" 
        @click="deleteMessages"
        :disabled="selectedMessages.length === 0 || !canDeleteSelected"
        class="action-btn danger"
      >
        <template #icon><DeleteOutlined /></template>
        Xóa
      </a-button>
      
      <a-button 
        type="text" 
        @click="downloadMessages"
        :disabled="selectedMessages.length === 0"
        class="action-btn"
      >
        <template #icon><DownloadOutlined /></template>
        Tải xuống
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  CloseOutlined,
  ForwardOutlined,
  CopyOutlined,
  PushpinOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  isSelectionMode: { type: Boolean, default: false },
  selectedMessages: { type: Array, default: () => [] },
  totalMessages: { type: Number, default: 0 }
})

const emit = defineEmits([
  'exit-selection',
  'select-all',
  'forward-messages',
  'copy-messages',
  'pin-messages',
  'delete-messages',
  'download-messages'
])

const authStore = useAuthStore()

const canDeleteSelected = computed(() => {
  return props.selectedMessages.every(msg => 
    msg.authorId === authStore.user?.id
  )
})

function exitSelectionMode() {
  emit('exit-selection')
}

function selectAll() {
  emit('select-all')
}

function forwardMessages() {
  if (props.selectedMessages.length === 0) return
  emit('forward-messages', props.selectedMessages)
}

function copyMessages() {
  if (props.selectedMessages.length === 0) return
  
  const textToCopy = props.selectedMessages
    .map(msg => `${msg.author}: ${msg.text || '[File đính kèm]'}`)
    .join('\n')
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    message.success(`Đã sao chép ${props.selectedMessages.length} tin nhắn`)
    emit('copy-messages', props.selectedMessages)
  }).catch(() => {
    message.error('Không thể sao chép tin nhắn')
  })
}

function pinMessages() {
  if (props.selectedMessages.length === 0) return
  
  Modal.confirm({
    title: `Ghim ${props.selectedMessages.length} tin nhắn?`,
    content: 'Các tin nhắn được ghim sẽ hiển thị ở đầu cuộc trò chuyện.',
    okText: 'Ghim',
    cancelText: 'Hủy',
    onOk: () => {
      emit('pin-messages', props.selectedMessages)
      message.success(`Đã ghim ${props.selectedMessages.length} tin nhắn`)
    }
  })
}

function deleteMessages() {
  if (props.selectedMessages.length === 0 || !canDeleteSelected.value) return
  
  Modal.confirm({
    title: `Xóa ${props.selectedMessages.length} tin nhắn?`,
    content: 'Hành động này không thể hoàn tác. Bạn chỉ có thể xóa tin nhắn của chính mình.',
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: () => {
      emit('delete-messages', props.selectedMessages)
      message.success(`Đã xóa ${props.selectedMessages.length} tin nhắn`)
    }
  })
}

function downloadMessages() {
  if (props.selectedMessages.length === 0) return
  
  // Create downloadable content
  const content = props.selectedMessages.map(msg => {
    const timestamp = new Date(msg.timestamp).toLocaleString('vi-VN')
    const text = msg.text || '[File đính kèm]'
    return `[${timestamp}] ${msg.author}: ${text}`
  }).join('\n')
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chat-messages-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  message.success(`Đã tải xuống ${props.selectedMessages.length} tin nhắn`)
  emit('download-messages', props.selectedMessages)
}
</script>

<style scoped>
.selection-mode {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.selection-count {
  font-weight: 600;
  color: #1890ff;
  font-size: 16px;
}

.selection-actions .ant-btn {
  color: #1890ff;
  font-weight: 500;
}

.action-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 16px;
  background: white;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #595959;
  transition: all 0.2s;
  min-width: 60px;
}

.action-btn:hover:not(:disabled) {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.action-btn:disabled {
  color: #bfbfbf;
  cursor: not-allowed;
}

.action-btn.danger:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.action-btn .anticon {
  font-size: 18px;
  margin-bottom: 2px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .selection-header {
    padding: 10px 12px;
  }
  
  .selection-count {
    font-size: 14px;
  }
  
  .action-bar {
    padding: 6px 8px;
    overflow-x: auto;
    gap: 4px;
  }
  
  .action-btn {
    padding: 6px 8px;
    min-width: 50px;
    font-size: 11px;
    flex-shrink: 0;
  }
  
  .action-btn .anticon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .action-bar {
    justify-content: flex-start;
    gap: 2px;
  }
  
  .action-btn {
    min-width: 45px;
    padding: 4px 6px;
  }
  
  .action-btn span:not(.anticon) {
    display: none;
  }
}

/* Animation */
.selection-mode {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.95);
}

/* Custom scrollbar for mobile action bar */
.action-bar::-webkit-scrollbar {
  height: 2px;
}

.action-bar::-webkit-scrollbar-track {
  background: transparent;
}

.action-bar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 1px;
}
</style>