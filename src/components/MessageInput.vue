<script setup>
import { ref, computed } from 'vue'
import { Picker } from 'emoji-mart-vue-fast/dist/emoji-mart.js'
import { 
  SmileOutlined, 
  PaperClipOutlined, 
  SendOutlined
} from '@ant-design/icons-vue'
import { useTypingIndicator } from '../composables/useTypingIndicator'
import { useChatStore } from '../store/chat'

const emit = defineEmits(['send', 'attach'])

const chatStore = useChatStore()
const currentChatId = computed(() => chatStore.state.currentChatId)

// Use typing indicator composable
const {
  isTyping,
  handleKeyDown,
  handleKeyUp,
  handleTypingDebounced,
  stopTyping
} = useTypingIndicator(currentChatId)

const messageText = ref('')
const fileInput = ref(null)
const showEmojiPicker = ref(false)

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
  return messageText.value.trim().length > 0
})

function handleSend() {
  const text = messageText.value.trim()
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
  const file = e.target.files?.[0]
  if (file) {
    emit('attach', file)
  }
  // Reset input
  e.target.value = ''
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
            type="text" 
            @click="selectFile"
            title="Đính kèm file"
          >
            <template #icon><PaperClipOutlined /></template>
          </a-button>
          
          <a-button 
            type="primary" 
            @click="handleSend"
            :disabled="!canSend"
            class="send-button"
          >
            <template #icon><SendOutlined /></template>
            Gửi
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


