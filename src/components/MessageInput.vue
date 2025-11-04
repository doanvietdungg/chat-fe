<script setup>
import { ref, computed, watch } from 'vue'
import { Picker } from 'emoji-mart-vue-fast/dist/emoji-mart.js'
import { 
  SmileOutlined, 
  PaperClipOutlined, 
  SendOutlined,
  LoadingOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { useTypingIndicator } from '../composables/useTypingIndicator'
import { useChatStore } from '../store/chat'
import { useMessagesStore } from '../store/messages'
import { fileMessageService } from '../services/fileMessageService.js'
import { createFilePreview, detectFileType } from '../utils/fileUtils.js'
import FilePreview from './FilePreview.vue'
import { message } from 'ant-design-vue'

const emit = defineEmits(['send', 'attach'])

const chatStore = useChatStore()
const messagesStore = useMessagesStore()
const currentChatId = computed(() => chatStore.state.currentChatId)

// Use typing indicator composable
const {
  isTyping,
  handleKeyDown,
  handleKeyUp,
  handleTypingDebounced,
  stopTyping
} = useTypingIndicator(currentChatId)

// State
const messageText = ref('')
const fileInput = ref(null)
const selectedFiles = ref([])
const showEmojiPicker = ref(false)
const uploadingFile = ref(false)
const uploadProgress = ref(0)

// Edit mode state
const editingMessage = ref(null)
const isEditMode = computed(() => !!editingMessage.value)

// Common emojis for fallback picker
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
]

const canSend = computed(() => {
  return messageText.value.trim().length > 0 || selectedFiles.value.length > 0
})

function handleSend() {
  const text = messageText.value.trim()
  
  // If has files, send files with caption
  if (selectedFiles.value.length > 0) {
    sendFilesWithPreview({
      files: selectedFiles.value.map(f => f.file),
      caption: text
    })
    return
  }
  
  // Send text message
  if (text) {
    emit('send', text)
    messageText.value = ''
    showEmojiPicker.value = false
    // Stop typing when message is sent
    stopTyping()
  }
}

function handleKeyPress(e) {
  // Handle typing indicators
  handleKeyDown(e)
  
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
    handleKeyUp(e)
  }
}

function selectFile() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files || [])
  if (files.length > 0) {
    addFilesToPreview(files)
  }
  // Reset input
  e.target.value = ''
}

function addFilesToPreview(files) {
  files.forEach(file => {
    const fileType = detectFileType(file.name)
    const isImage = fileType === 'image'
    const preview = isImage ? createFilePreview(file) : null
    
    selectedFiles.value.push({
      file,
      isImage,
      preview,
      uploading: false,
      progress: 0,
      error: null
    })
  })
}

// File preview handlers
function removeFileFromPreview(index) {
  const fileItem = selectedFiles.value[index]
  if (fileItem.preview) {
    URL.revokeObjectURL(fileItem.preview)
  }
  selectedFiles.value.splice(index, 1)
}

function clearAllFiles() {
  selectedFiles.value.forEach(fileItem => {
    if (fileItem.preview) {
      URL.revokeObjectURL(fileItem.preview)
    }
  })
  selectedFiles.value = []
}

async function sendFilesWithPreview({ files, caption }) {
  if (!currentChatId.value) {
    message.error('Không xác định được cuộc trò chuyện')
    return
  }

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileItem = selectedFiles.value.find(f => f.file === file)
      
      if (fileItem) {
        fileItem.uploading = true
        fileItem.progress = 0
      }

      console.log('📎 Starting file upload:', file.name)

      // Upload file and get message data
      const result = await fileMessageService.uploadFile(
        file,
        currentChatId.value,
        (progress) => {
          if (fileItem) {
            fileItem.progress = progress
          }
        },
        {
          caption: i === 0 ? caption : '', // Only first file gets caption
          recipientId: chatStore.state.pendingRecipientId
        }
      )

      console.log('📎 Upload result:', result)

      if (result.success) {
        // Send the file message via chat store
        await chatStore.sendMessage(i === 0 ? caption : '', {
          type: result.messageType,
          fileId: result.fileData.id,
          fileName: result.fileData.name,
          fileUrl: result.fileData.url,
          fileSize: result.fileData.size,
          contentType: result.fileData.contentType
        })

        if (fileItem) {
          fileItem.uploading = false
          fileItem.progress = 100
        }
      }
    }

    // Clear files and message after sending
    clearAllFiles()
    messageText.value = ''
    message.success(`Đã gửi ${files.length} file thành công`)

  } catch (error) {
    console.error('📎 File upload error:', error)
    message.error(`Lỗi tải file: ${error.message}`)
    
    // Mark failed files
    selectedFiles.value.forEach(fileItem => {
      if (fileItem.uploading) {
        fileItem.uploading = false
        fileItem.error = error.message
      }
    })
  }
}

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function onEmojiSelect(emoji) {
  console.log('Emoji selected:', emoji) // Debug log
  if (emoji && emoji.native) {
    messageText.value += emoji.native
  } else if (emoji && typeof emoji === 'string') {
    messageText.value += emoji
  }
  // Close picker after selection for better UX
  showEmojiPicker.value = false
}

function addEmoji(emoji) {
  messageText.value += emoji
  showEmojiPicker.value = false
}

// Edit message functions
function startEditMessage(message) {
  editingMessage.value = message
  messageText.value = message.text
  // Focus on input
  setTimeout(() => {
    const textarea = document.querySelector('.message-textarea textarea')
    if (textarea) {
      textarea.focus()
    }
  }, 100)
}

function cancelEdit() {
  editingMessage.value = null
  messageText.value = ''
}

async function saveEdit() {
  if (!editingMessage.value || !messageText.value.trim()) return

  try {
    const success = await messagesStore.editMessage(editingMessage.value.id, messageText.value.trim())
    
    if (success) {
      // Call API to update message on server
      const { messageAPI } = await import('../services/api.js')
      await messageAPI.editMessage(editingMessage.value.id, {
        text: messageText.value.trim()
      })
      
      message.success('Đã cập nhật tin nhắn')
      cancelEdit()
    } else {
      message.error('Không thể sửa tin nhắn này')
    }
  } catch (error) {
    console.error('Edit message error:', error)
    message.error('Lỗi khi sửa tin nhắn')
  }
}

// Delete message function
async function deleteMessage(messageId) {
  try {
    const success = messagesStore.deleteMessage(messageId)
    
    if (success) {
      // Call API to delete message on server
      const { messageAPI } = await import('../services/api.js')
      await messageAPI.deleteMessage(messageId)
      
      message.success('Đã xóa tin nhắn')
    } else {
      message.error('Không thể xóa tin nhắn này')
    }
  } catch (error) {
    console.error('Delete message error:', error)
    message.error('Lỗi khi xóa tin nhắn')
  }
}

// Expose functions for parent components
defineExpose({
  startEditMessage,
  deleteMessage,
  clearAllFiles
})

function handleInput() {
  // Handle typing indicators with debounce
  handleTypingDebounced()
}

// Close emoji picker when clicking outside
function closeEmojiPicker() {
  showEmojiPicker.value = false
}
</script>

<template>
  <div class="message-input-container">
    <!-- Emoji Picker -->
    <div v-if="showEmojiPicker" class="emoji-picker-wrapper">
      <div class="emoji-picker-backdrop" @click="closeEmojiPicker"></div>
      <div class="emoji-picker-container">
        <!-- Simple emoji picker (always use for now) -->
        <div class="simple-emoji-picker">
          <div class="emoji-grid">
            <button 
              v-for="emoji in commonEmojis" 
              :key="emoji"
              @click="addEmoji(emoji)"
              class="emoji-button"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- File Preview -->
    <FilePreview
      v-if="selectedFiles.length > 0"
      :files="selectedFiles"
      @remove-file="removeFileFromPreview"
      @clear-all="clearAllFiles"
      @send-files="sendFilesWithPreview"
    />

    <!-- Edit Mode Header -->
    <div v-if="isEditMode" class="edit-mode-header">
      <div class="edit-info">
        <span class="edit-icon">✏️</span>
        <span class="edit-text">Chỉnh sửa tin nhắn</span>
      </div>
      <a-button size="small" type="text" @click="cancelEdit">
        <template #icon><CloseOutlined /></template>
      </a-button>
    </div>

    <!-- Input Area -->
    <div class="input-wrapper">
      <div class="input-content">
        <!-- Text Input -->
        <a-textarea
          v-model:value="messageText"
          placeholder="Nhập tin nhắn..."
          :auto-size="{ minRows: 1, maxRows: 4 }"
          @keydown="handleKeyPress"
          @input="handleInput"
          class="message-textarea"
          :bordered="false"
        />
        
        <!-- Action Buttons -->
        <div class="input-actions">
          <a-button 
            type="text" 
            @click="toggleEmojiPicker"
            :class="{ 'active-button': showEmojiPicker }"
            title="Thêm emoji"
          >
            <template #icon><SmileOutlined /></template>
          </a-button>
          
          <a-button 
            v-if="!isEditMode"
            type="text" 
            @click="selectFile"
            :disabled="uploadingFile || selectedFiles.length > 0"
            title="Đính kèm file"
          >
            <template #icon>
              <LoadingOutlined v-if="uploadingFile" />
              <PaperClipOutlined v-else />
            </template>
          </a-button>
          
          <!-- Edit Mode Buttons -->
          <template v-if="isEditMode">
            <a-button @click="cancelEdit" class="cancel-edit-btn">
              Hủy
            </a-button>
            <a-button 
              type="primary" 
              @click="saveEdit"
              :disabled="!messageText.trim()"
              class="save-edit-btn"
            >
              <template #icon><SendOutlined /></template>
              Lưu
            </a-button>
          </template>
          
          <!-- Normal Send Button -->
          <a-button 
            v-else
            type="primary" 
            @click="handleSend"
            :disabled="!canSend && selectedFiles.length === 0"
            class="send-button"
          >
            <template #icon><SendOutlined /></template>
            {{ selectedFiles.length > 0 ? `Gửi ${selectedFiles.length} file` : 'Gửi' }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input 
      ref="fileInput" 
      type="file" 
      style="display: none" 
      @change="handleFileSelect"
      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
    />
  </div>
</template>

<style scoped>
.message-input-container {
  position: relative;
  background: var(--chat-bg);
}

.upload-progress {
  padding: 12px 16px;
  background: #f5f5f5;
  border-top: 1px solid #d9d9d9;
}

.edit-mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #e6f7ff;
  border-top: 1px solid #91d5ff;
  border-bottom: 1px solid #91d5ff;
}

.edit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
}

.edit-icon {
  font-size: 16px;
}

.cancel-edit-btn {
  margin-right: 8px;
}

.save-edit-btn {
  background: #52c41a;
  border-color: #52c41a;
}

.save-edit-btn:hover {
  background: #73d13d;
  border-color: #73d13d;
}

.upload-text {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
  color: #1890ff;
}

.input-wrapper {
  padding: var(--spacing-md) var(--spacing-lg);
}

.input-content {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-content:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.message-textarea {
  flex: 1;
  min-height: 20px;
  max-height: 120px;
  resize: none;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 14px;
  line-height: 1.4;
}

.message-textarea:focus {
  box-shadow: none !important;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.send-button {
  height: 32px;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.active-button {
  color: var(--primary-color) !important;
  background-color: rgba(24, 144, 255, 0.1) !important;
}

/* Emoji Picker Styles */
.emoji-picker-wrapper {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
}

.emoji-picker-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

.emoji-picker-container {
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-lg);
  z-index: 1001;
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: white;
}

/* Custom emoji picker styling */
:deep(.emoji-mart) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.emoji-mart-category-label) {
  background: var(--bg-color) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .input-wrapper {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .emoji-picker-container {
    left: var(--spacing-md);
    right: var(--spacing-md);
    width: auto;
  }
}

@media (max-width: 576px) {
  .input-actions {
    gap: 2px;
  }
  
  .send-button span {
    display: none;
  }
  
  .send-button {
    width: 32px;
    padding: 0;
  }
}

/* Animations */
.emoji-picker-container {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button hover effects */
.input-actions .ant-btn {
  transition: all 0.2s ease;
}

.input-actions .ant-btn:hover {
  transform: translateY(-1px);
}

/* Textarea placeholder styling */
:deep(.ant-input::placeholder) {
  color: var(--text-secondary);
}

/* Remove default textarea styling */
:deep(.ant-input) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:deep(.ant-input:focus) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Simple emoji picker styles */
.simple-emoji-picker {
  background: white;
  padding: var(--spacing-md);
  max-width: 320px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-xs);
}

.emoji-button {
  background: none;
  border: none;
  font-size: 20px;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.emoji-button:hover {
  background-color: var(--bg-color);
}
</style>


