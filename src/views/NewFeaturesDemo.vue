<template>
  <div class="new-features-demo">
    <div class="demo-header">
      <h1 class="demo-title">🚀 Tính năng mới Chat App</h1>
      <p class="demo-subtitle">Khám phá các tính năng hiện đại mới được thêm vào</p>
      
      <div class="demo-controls">
        <ThemeToggle @theme-changed="handleThemeChange" />
        <a-button @click="showAllFeatures = !showAllFeatures">
          {{ showAllFeatures ? 'Thu gọn' : 'Xem tất cả' }}
        </a-button>
      </div>
    </div>

    <div class="features-grid" :class="{ 'expanded': showAllFeatures }">
      
      <!-- Voice Messages -->
      <div class="feature-card">
        <div class="feature-header">
          <h3>🎵 Tin nhắn thoại</h3>
          <a-switch v-model:checked="features.voiceMessage" />
        </div>
        <div class="feature-demo" v-if="features.voiceMessage">
          <div class="demo-messages">
            <div class="message-item own">
              <VoiceMessage 
                :audio-url="'#'"
                :duration="45"
                :file-size="1024000"
                :is-own="true"
                status="read"
              />
            </div>
            <div class="message-item">
              <VoiceMessage 
                :audio-url="'#'"
                :duration="23"
                :file-size="512000"
                :is-own="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Message Reactions -->
      <div class="feature-card">
        <div class="feature-header">
          <h3>🔄 Phản ứng tin nhắn</h3>
          <a-switch v-model:checked="features.reactions" />
        </div>
        <div class="feature-demo" v-if="features.reactions">
          <div class="demo-message">
            <div class="message-bubble">
              Tin nhắn có thể có phản ứng emoji! 😊
              <MessageReactions 
                message-id="demo-1"
                :reactions="mockReactions"
                @toggle-reaction="handleReaction"
                @show-picker="showReactionPicker"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Pinned Messages -->
      <div class="feature-card">
        <div class="feature-header">
          <h3>📌 Tin nhắn đã ghim</h3>
          <a-switch v-model:checked="features.pinnedMessages" />
        </div>
        <div class="feature-demo" v-if="features.pinnedMessages">
          <!-- <PinnedMessages 
            chat-id="demo-chat"
            :messages="mockPinnedMessages"
            @scroll-to-message="handleScrollToMessage"
            @unpin-message="handleUnpinMessage"
          /> -->
          <div class="placeholder">PinnedMessages component (đang phát triển)</div>
        </div>
      </div>

      <!-- Selection Mode -->
      <div class="feature-card">
        <div class="feature-header">
          <h3>📋 Chế độ chọn tin nhắn</h3>
          <a-switch v-model:checked="features.selectionMode" />
        </div>
        <div class="feature-demo" v-if="features.selectionMode">
          <!-- <MessageSelectionMode
            :is-selection-mode="true"
            :selected-messages="mockSelectedMessages"
            :total-messages="10"
            @exit-selection="handleExitSelection"
            @select-all="handleSelectAll"
            @forward-messages="handleForwardMessages"
            @copy-messages="handleCopyMessages"
            @pin-messages="handlePinMessages"
            @delete-messages="handleDeleteMessages"
            @download-messages="handleDownloadMessages"
          /> -->
          <div class="placeholder">MessageSelectionMode component (đang phát triển)</div>
        </div>
      </div>

      <!-- Audio/Video Call -->
      <div class="feature-card">
        <div class="feature-header">
          <h3>📞 Cuộc gọi Audio/Video</h3>
          <div class="call-controls">
            <a-button @click="startAudioCall" type="primary">
              <template #icon><PhoneOutlined /></template>
              Gọi thoại
            </a-button>
            <a-button @click="startVideoCall" type="primary">
              <template #icon><VideoCameraOutlined /></template>
              Gọi video
            </a-button>
          </div>
        </div>
        <div class="feature-demo">
          <div class="call-preview">
            <div class="call-info">
              <a-avatar :size="60">JD</a-avatar>
              <div>
                <div class="caller-name">John Doe</div>
                <div class="call-status">Sẵn sàng nhận cuộc gọi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Statistics -->
      <div class="feature-card large">
        <div class="feature-header">
          <h3>📊 Thống kê cuộc trò chuyện</h3>
          <a-switch v-model:checked="features.statistics" />
        </div>
        <div class="feature-demo" v-if="features.statistics">
          <!-- <ChatStatistics 
            chat-id="demo-chat"
            :messages="[]"
          /> -->
          <div class="placeholder">ChatStatistics component (đang phát triển)</div>
        </div>
      </div>

      <!-- Theme Toggle -->
      <div class="feature-card">
        <div class="feature-header">
          <h3>🌙 Chuyển đổi theme</h3>
          <span class="current-theme">{{ currentTheme }}</span>
        </div>
        <div class="feature-demo">
          <div class="theme-preview">
            <div class="theme-sample light">
              <div class="sample-header">Light Theme</div>
              <div class="sample-content">
                <div class="sample-message">Tin nhắn sáng</div>
              </div>
            </div>
            <div class="theme-sample dark">
              <div class="sample-header">Dark Theme</div>
              <div class="sample-content">
                <div class="sample-message">Tin nhắn tối</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Feature Summary -->
    <div class="feature-summary">
      <h2>📋 Tổng quan tính năng</h2>
      <div class="summary-grid">
        <div class="summary-item" v-for="(feature, key) in featureList" :key="key">
          <div class="summary-icon">{{ feature.icon }}</div>
          <div class="summary-info">
            <div class="summary-name">{{ feature.name }}</div>
            <div class="summary-desc">{{ feature.description }}</div>
          </div>
          <div class="summary-status">
            <a-tag :color="feature.status === 'ready' ? 'green' : 'orange'">
              {{ feature.status === 'ready' ? 'Sẵn sàng' : 'Demo' }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- Call Interface -->
    <!-- <AudioVideoCall
      v-if="activeCall"
      :contact="callContact"
      :call-type="callType"
      :is-incoming="false"
      @call-ended="handleCallEnded"
    /> -->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PhoneOutlined, VideoCameraOutlined } from '@ant-design/icons-vue'

// Import components
import VoiceMessage from '../components/VoiceMessage.vue'
import MessageReactions from '../components/MessageReactions.vue'
// import PinnedMessages from '../components/PinnedMessages.vue'
// import MessageSelectionMode from '../components/MessageSelectionMode.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
// import AudioVideoCall from '../components/AudioVideoCall.vue'
// import ChatStatistics from '../components/ChatStatistics.vue'

// State
const showAllFeatures = ref(false)
const currentTheme = ref('light')
const activeCall = ref(false)
const callType = ref('audio')

const features = reactive({
  voiceMessage: true,
  reactions: true,
  pinnedMessages: true,
  selectionMode: true,
  statistics: true
})

// Mock data
const mockReactions = ref([
  { emoji: '👍', userId: 'user1' },
  { emoji: '👍', userId: 'user2' },
  { emoji: '❤️', userId: 'user3' },
  { emoji: '😂', userId: 'user4' }
])

const mockPinnedMessages = ref([
  {
    id: '1',
    text: 'Tin nhắn quan trọng đã được ghim',
    author: 'John Doe',
    timestamp: Date.now() - 86400000,
    pinned: true
  },
  {
    id: '2',
    text: 'Thông tin cuộc họp ngày mai',
    author: 'Jane Smith',
    timestamp: Date.now() - 172800000,
    pinned: true,
    media: { type: 'image', fileName: 'meeting-info.jpg' }
  }
])

const mockSelectedMessages = ref([
  { id: '1', text: 'Tin nhắn được chọn 1', authorId: 'current-user' },
  { id: '2', text: 'Tin nhắn được chọn 2', authorId: 'other-user' }
])

const callContact = ref({
  name: 'John Doe',
  avatar: null
})

const featureList = {
  voiceMessage: {
    icon: '🎵',
    name: 'Tin nhắn thoại',
    description: 'Ghi âm và gửi tin nhắn thoại với waveform hiển thị',
    status: 'ready'
  },
  reactions: {
    icon: '🔄',
    name: 'Phản ứng tin nhắn',
    description: 'Thêm emoji phản ứng vào tin nhắn',
    status: 'ready'
  },
  pinnedMessages: {
    icon: '📌',
    name: 'Ghim tin nhắn',
    description: 'Ghim tin nhắn quan trọng lên đầu cuộc trò chuyện',
    status: 'ready'
  },
  selectionMode: {
    icon: '📋',
    name: 'Chế độ chọn tin nhắn',
    description: 'Chọn nhiều tin nhắn để thực hiện hành động hàng loạt',
    status: 'ready'
  },
  audioVideoCall: {
    icon: '📞',
    name: 'Cuộc gọi Audio/Video',
    description: 'Thực hiện cuộc gọi thoại và video trực tiếp',
    status: 'demo'
  },
  statistics: {
    icon: '📊',
    name: 'Thống kê cuộc trò chuyện',
    description: 'Xem thống kê chi tiết về hoạt động chat',
    status: 'ready'
  },
  themeToggle: {
    icon: '🌙',
    name: 'Chuyển đổi theme',
    description: 'Chuyển đổi giữa chế độ sáng và tối',
    status: 'ready'
  }
}

// Event handlers
function handleThemeChange(theme) {
  currentTheme.value = theme
  message.success(`Đã chuyển sang ${theme === 'dark' ? 'chế độ tối' : 'chế độ sáng'}`)
}

function handleReaction(data) {
  message.info(`Đã ${data.emoji} tin nhắn`)
}

function showReactionPicker(messageId) {
  message.info('Mở bộ chọn phản ứng')
}

function handleScrollToMessage(messageId) {
  message.info(`Cuộn đến tin nhắn ${messageId}`)
}

function handleUnpinMessage(messageId) {
  message.success('Đã bỏ ghim tin nhắn')
}

function handleExitSelection() {
  message.info('Thoát chế độ chọn')
}

function handleSelectAll() {
  message.info('Đã chọn tất cả tin nhắn')
}

function handleForwardMessages(messages) {
  message.success(`Chuyển tiếp ${messages.length} tin nhắn`)
}

function handleCopyMessages(messages) {
  message.success(`Đã sao chép ${messages.length} tin nhắn`)
}

function handlePinMessages(messages) {
  message.success(`Đã ghim ${messages.length} tin nhắn`)
}

function handleDeleteMessages(messages) {
  message.success(`Đã xóa ${messages.length} tin nhắn`)
}

function handleDownloadMessages(messages) {
  message.success(`Đã tải xuống ${messages.length} tin nhắn`)
}

function startAudioCall() {
  callType.value = 'audio'
  activeCall.value = true
  message.info('Bắt đầu cuộc gọi thoại')
}

function startVideoCall() {
  callType.value = 'video'
  activeCall.value = true
  message.info('Bắt đầu cuộc gọi video')
}

function handleCallEnded() {
  activeCall.value = false
  message.info('Cuộc gọi đã kết thúc')
}
</script>

<style scoped>
.new-features-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-color, #ffffff);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border-color, #e8e8e8);
}

.demo-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #262626);
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-subtitle {
  font-size: 16px;
  color: var(--text-secondary, #8c8c8c);
  margin: 0 0 24px 0;
}

.demo-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.features-grid.expanded {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.feature-card {
  background: var(--hover-bg, #f5f5f5);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  border-color: #1890ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
}

.feature-card.large {
  grid-column: span 2;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.feature-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.call-controls {
  display: flex;
  gap: 8px;
}

.feature-demo {
  min-height: 120px;
}

.placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #8c8c8c;
  font-style: italic;
  background: rgba(24, 144, 255, 0.05);
  border: 1px dashed #1890ff;
  border-radius: 8px;
}

.demo-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
}

.message-item.own {
  justify-content: flex-end;
}

.demo-message {
  display: flex;
  justify-content: flex-start;
}

.message-bubble {
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 280px;
  color: #262626;
}

.call-preview {
  padding: 16px;
  background: rgba(24, 144, 255, 0.05);
  border-radius: 12px;
  border: 1px dashed #1890ff;
}

.call-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.caller-name {
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.call-status {
  font-size: 14px;
  color: var(--text-secondary, #8c8c8c);
}

.current-theme {
  font-size: 14px;
  color: var(--text-secondary, #8c8c8c);
  text-transform: capitalize;
}

.theme-preview {
  display: flex;
  gap: 12px;
}

.theme-sample {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.theme-sample.light {
  background: #ffffff;
  color: #262626;
}

.theme-sample.dark {
  background: #1a1a1a;
  color: #ffffff;
}

.sample-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid currentColor;
  opacity: 0.3;
}

.sample-content {
  padding: 12px;
}

.sample-message {
  background: rgba(24, 144, 255, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.feature-summary {
  background: var(--hover-bg, #f5f5f5);
  border-radius: 16px;
  padding: 24px;
  margin-top: 32px;
}

.feature-summary h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #262626);
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-color, #ffffff);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  border-radius: 12px;
  color: white;
}

.summary-info {
  flex: 1;
}

.summary-name {
  font-weight: 600;
  color: var(--text-primary, #262626);
  margin-bottom: 4px;
}

.summary-desc {
  font-size: 14px;
  color: var(--text-secondary, #8c8c8c);
  line-height: 1.4;
}

.summary-status {
  flex-shrink: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .new-features-demo {
    padding: 16px;
  }
  
  .demo-title {
    font-size: 24px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-card.large {
    grid-column: span 1;
  }
  
  .call-controls {
    flex-direction: column;
    gap: 4px;
  }
  
  .theme-preview {
    flex-direction: column;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-controls {
    flex-direction: column;
    gap: 12px;
  }
}

/* Animations */
.feature-card {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.feature-card:hover::before {
  left: 100%;
}
</style>