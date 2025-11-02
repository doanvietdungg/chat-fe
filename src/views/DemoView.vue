<template>
  <div class="demo-view">
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <h1>Chat App Components Demo</h1>
        <p>Showcase of all custom components and features</p>
      </div>

      <!-- Navigation -->
      <div class="demo-nav">
        <a-menu 
          v-model:selectedKeys="selectedKeys" 
          mode="horizontal" 
          @click="scrollToSection"
        >
          <a-menu-item key="notifications">Notifications</a-menu-item>
          <a-menu-item key="telegram-sidebar">Telegram Sidebar</a-menu-item>
          <a-menu-item key="typing">Typing Indicators</a-menu-item>
          <a-menu-item key="search">Chat Search</a-menu-item>
          <a-menu-item key="context-menu">Message Context Menu</a-menu-item>
          <a-menu-item key="main-sidebar">Main Sidebar</a-menu-item>
          <a-menu-item key="emoji">Emoji Picker</a-menu-item>
          <a-menu-item key="media">Media Gallery</a-menu-item>
        </a-menu>
      </div>

      <!-- Demo Sections -->
      <div class="demo-sections">
        <!-- Notifications Demo -->
        <section id="notifications" class="demo-section">
          <h2>🔔 Notification System</h2>
          <p>Complete notification system with toast, bell, and settings</p>
          
          <div class="demo-actions">
            <a-space wrap>
              <a-button type="primary" @click="testSuccess">
                <CheckCircleOutlined /> Success
              </a-button>
              <a-button danger @click="testError">
                <CloseCircleOutlined /> Error
              </a-button>
              <a-button @click="testWarning">
                <ExclamationCircleOutlined /> Warning
              </a-button>
              <a-button @click="testMessage">
                <MessageOutlined /> Message
              </a-button>
              <a-button @click="showNotificationSettings = true">
                <SettingOutlined /> Settings
              </a-button>
            </a-space>
          </div>

          <div class="demo-stats">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic title="Total" :value="notificationStore.state.notifications.length" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="Unread" :value="notificationStore.state.unreadCount" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="Messages" :value="messageNotifications.length" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="System" :value="systemNotifications.length" />
              </a-col>
            </a-row>
          </div>
        </section>

        <!-- Telegram Sidebar Demo -->
        <section id="telegram-sidebar" class="demo-section">
          <h2>📱 Telegram-Style Sidebar</h2>
          <p>Dark theme sidebar with user info and statistics</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="showTelegramSidebar">
                Open User Info
              </a-button>
              <a-button @click="showChatInfo">
                Open Chat Info
              </a-button>
            </a-space>
          </div>

          <div class="feature-list">
            <ul>
              <li>Dark theme matching Telegram design</li>
              <li>User profile with avatar and online status</li>
              <li>Media statistics (photos, videos, files)</li>
              <li>Action buttons (share, edit, delete, block)</li>
              <li>Smooth slide-in animation</li>
              <li>Mobile responsive</li>
            </ul>
          </div>
        </section>

        <!-- Typing Indicators Demo -->
        <section id="typing" class="demo-section">
          <h2>⌨️ Typing Indicators</h2>
          <p>Real-time typing indicators with WebSocket integration</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="testTyping">
                Test Typing (10s)
              </a-button>
              <a-button @click="testMultipleTyping">
                Multiple Users Typing
              </a-button>
              <a-button @click="stopAllTyping">
                Stop All Typing
              </a-button>
            </a-space>
          </div>

          <div class="typing-demo">
            <TypingIndicator />
          </div>

          <div class="feature-list">
            <ul>
              <li>Auto timeout after 10 seconds</li>
              <li>Debounced detection (2 seconds)</li>
              <li>Multiple users support</li>
              <li>Smart text formatting</li>
              <li>WebSocket integration ready</li>
            </ul>
          </div>
        </section>

        <!-- Chat Search Demo -->
        <section id="search" class="demo-section">
          <h2>🔍 Chat Search</h2>
          <p>Advanced message search with navigation</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="showChatSearch = true">
                Open Search
              </a-button>
              <a-button @click="addSampleMessages">
                Add Sample Messages
              </a-button>
            </a-space>
          </div>

          <div class="search-demo">
            <ChatSearch 
              :visible="showChatSearch" 
              @close="showChatSearch = false"
              @result-selected="handleSearchResult"
            />
          </div>

          <div class="feature-list">
            <ul>
              <li>Real-time search as you type</li>
              <li>Navigation between results</li>
              <li>Keyboard shortcuts (Enter, Escape)</li>
              <li>Result highlighting</li>
              <li>Result counter</li>
            </ul>
          </div>
        </section>

        <!-- Emoji Picker Demo -->
        <section id="emoji" class="demo-section">
          <h2>😀 Emoji Picker</h2>
          <p>Complete emoji picker with categories and search</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="showEmojiPicker = true">
                Open Emoji Picker
              </a-button>
              <a-button @click="clearRecentEmojis">
                Clear Recent
              </a-button>
            </a-space>
          </div>

          <div class="selected-emojis">
            <h4>Selected Emojis:</h4>
            <div class="emoji-display">
              <span v-for="emoji in selectedEmojis" :key="emoji.code" class="selected-emoji">
                {{ emoji.emoji }}
              </span>
            </div>
          </div>

          <div class="feature-list">
            <ul>
              <li>9 emoji categories</li>
              <li>Search functionality</li>
              <li>Recently used emojis</li>
              <li>Responsive grid layout</li>
              <li>LocalStorage persistence</li>
            </ul>
          </div>
        </section>

        <!-- Message Context Menu Demo -->
        <section id="context-menu" class="demo-section">
          <h2>📝 Message Context Menu</h2>
          <p>Right-click context menu for messages with reactions and actions</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="showContextMenuDemo = true">
                Show Context Menu Demo
              </a-button>
              <a-button @click="addDemoMessages">
                Add Demo Messages
              </a-button>
            </a-space>
          </div>

          <div class="context-menu-demo" v-if="showContextMenuDemo">
            <div class="demo-messages">
              <div 
                v-for="message in demoMessages" 
                :key="message.id"
                class="demo-message"
                :class="{ 'own-message': message.isOwn }"
                @contextmenu="showDemoContextMenu($event, message)"
              >
                <div class="message-bubble" :class="{ 'own-bubble': message.isOwn }">
                  <div class="message-author" v-if="!message.isOwn">{{ message.author }}</div>
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
            </div>
            
            <div class="demo-instructions">
              <p><strong>Hướng dẫn:</strong> Nhấn chuột phải vào tin nhắn để mở context menu</p>
            </div>
          </div>

          <div class="feature-list">
            <ul>
              <li>Quick emoji reactions bar</li>
              <li>Reply, Edit, Pin, Delete actions</li>
              <li>Copy text and message link</li>
              <li>Forward and Select options</li>
              <li>Smart positioning (avoid screen edges)</li>
              <li>Permission-based actions (edit/delete own messages)</li>
            </ul>
          </div>
        </section>

        <!-- Main Sidebar Demo -->
        <section id="main-sidebar" class="demo-section">
          <h2>☰ Main Sidebar</h2>
          <p>Telegram-style main sidebar with hamburger menu toggle</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="showMainSidebar = true">
                Open Main Sidebar
              </a-button>
              <a-button @click="goToSidebarDemo">
                Full Demo Page
              </a-button>
            </a-space>
          </div>

          <div class="feature-list">
            <ul>
              <li>Hamburger menu toggle (3 gạch)</li>
              <li>User profile section with avatar</li>
              <li>Multiple account switching with badges</li>
              <li>Complete menu: Profile, Wallet, Groups, Contacts, etc.</li>
              <li>Night mode toggle with persistence</li>
              <li>Smooth slide-in animation</li>
              <li>Responsive design (mobile-friendly)</li>
              <li>Telegram Desktop styling</li>
              <li>Keyboard shortcuts (ESC to close)</li>
            </ul>
          </div>
        </section>

        <!-- Media Gallery Demo -->
        <section id="media" class="demo-section">
          <h2>🖼️ Media Gallery</h2>
          <p>Media gallery with photos, videos, files, and links</p>
          
          <div class="demo-actions">
            <a-space>
              <a-button type="primary" @click="showMediaGallery = true">
                Open Media Gallery
              </a-button>
              <a-button @click="addSampleMedia">
                Add Sample Media
              </a-button>
            </a-space>
          </div>

          <div class="feature-list">
            <ul>
              <li>Photos with lightbox view</li>
              <li>Videos with play controls</li>
              <li>File downloads</li>
              <li>Link previews</li>
              <li>Responsive grid layout</li>
              <li>Date and size formatting</li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <!-- Components -->
    <NotificationBell />
    <NotificationToast />
    <NotificationSettings v-model:visible="showNotificationSettings" />
    <TelegramSidebar v-model:visible="telegramSidebarVisible" :userId="selectedUserId" />
    <EmojiPicker 
      :visible="showEmojiPicker" 
      @close="showEmojiPicker = false"
      @select="handleEmojiSelect"
    />
    <MessageContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :message-data="contextMenuMessage"
      @close="closeDemoContextMenu"
      @action="handleDemoContextMenuAction"
    />
    <MainSidebar 
      v-model:visible="showMainSidebar"
      @menu-click="(item) => notificationStore.showSuccess('Menu Click', `Clicked: ${item.label}`)"
    />
    <MediaGallery 
      :visible="showMediaGallery"
      @update:visible="showMediaGallery = $event"
      :chatId="'demo-chat'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { useNotificationsStore } from '../store/notifications'
import { useMessagesStore } from '../store/messages'
import NotificationBell from '../components/NotificationBell.vue'
import NotificationToast from '../components/NotificationToast.vue'
import NotificationSettings from '../components/NotificationSettings.vue'
import TelegramSidebar from '../components/TelegramSidebar.vue'
import TypingIndicator from '../components/TypingIndicator.vue'
import ChatSearch from '../components/ChatSearch.vue'
import MessageContextMenu from '../components/MessageContextMenu.vue'
import MainSidebar from '../components/MainSidebar.vue'
import EmojiPicker from '../components/EmojiPicker.vue'
import MediaGallery from '../components/MediaGallery.vue'

const notificationStore = useNotificationsStore()
const messagesStore = useMessagesStore()

// Reactive data
const selectedKeys = ref(['notifications'])
const showNotificationSettings = ref(false)
const telegramSidebarVisible = ref(false)
const selectedUserId = ref(null)
const showChatSearch = ref(false)
const showMainSidebar = ref(false)
const showEmojiPicker = ref(false)
const showMediaGallery = ref(false)
const selectedEmojis = ref([])

// Context menu demo
const showContextMenuDemo = ref(false)
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuMessage = ref(null)
const demoMessages = ref([
  {
    id: 'demo-1',
    text: 'Xin chào! Đây là tin nhắn demo',
    author: 'Demo User',
    authorId: 'demo-user',
    time: '10:30',
    isOwn: false
  },
  {
    id: 'demo-2', 
    text: 'Nhấn chuột phải vào tin nhắn này để xem context menu',
    author: 'You',
    authorId: 'current-user',
    time: '10:31',
    isOwn: true
  },
  {
    id: 'demo-3',
    text: 'Context menu có các tùy chọn như Reply, Edit, Pin, Delete...',
    author: 'Demo User',
    authorId: 'demo-user', 
    time: '10:32',
    isOwn: false
  }
])

// Computed
const messageNotifications = computed(() => {
  return notificationStore.messageNotifications.value
})

const systemNotifications = computed(() => {
  return notificationStore.systemNotifications.value
})

// Methods
function scrollToSection(e) {
  const sectionId = e.key
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Notification tests
function testSuccess() {
  notificationStore.showSuccess('Success!', 'Operation completed successfully')
}

function testError() {
  notificationStore.showError('Error!', 'Something went wrong. Please try again.')
}

function testWarning() {
  notificationStore.showWarning('Warning!', 'Are you sure you want to continue?')
}

function testMessage() {
  notificationStore.showMessageNotification({
    senderName: 'Demo User',
    text: 'This is a test message notification',
    senderAvatar: 'https://via.placeholder.com/32/1890ff/ffffff?text=D',
    chatId: 'demo-chat',
    senderId: 'demo-user'
  })
}

// Telegram sidebar
function showTelegramSidebar() {
  selectedUserId.value = null
  telegramSidebarVisible.value = true
}

function showChatInfo() {
  selectedUserId.value = 'demo-user'
  telegramSidebarVisible.value = true
}

// Typing indicators
function testTyping() {
  messagesStore.setTyping('demo-user-1', true)
  setTimeout(() => {
    messagesStore.setTyping('demo-user-1', false)
  }, 10000)
  
  notificationStore.showInfo('Typing Test', 'Demo user is typing for 10 seconds')
}

function testMultipleTyping() {
  messagesStore.setTyping('demo-user-1', true)
  messagesStore.setTyping('demo-user-2', true)
  messagesStore.setTyping('demo-user-3', true)
  
  setTimeout(() => {
    messagesStore.setTyping('demo-user-1', false)
  }, 5000)
  
  setTimeout(() => {
    messagesStore.setTyping('demo-user-2', false)
  }, 8000)
  
  setTimeout(() => {
    messagesStore.setTyping('demo-user-3', false)
  }, 12000)
  
  notificationStore.showInfo('Multiple Typing', '3 users are typing with different durations')
}

function stopAllTyping() {
  messagesStore.setTyping('demo-user-1', false)
  messagesStore.setTyping('demo-user-2', false)
  messagesStore.setTyping('demo-user-3', false)
}

// Search
function addSampleMessages() {
  const sampleMessages = [
    { id: 'msg-1', text: 'Hello world!', authorId: 'user-1', chatId: 'demo-chat' },
    { id: 'msg-2', text: 'How are you doing today?', authorId: 'user-2', chatId: 'demo-chat' },
    { id: 'msg-3', text: 'The weather is nice', authorId: 'user-1', chatId: 'demo-chat' },
    { id: 'msg-4', text: 'Let\'s meet tomorrow', authorId: 'user-2', chatId: 'demo-chat' },
    { id: 'msg-5', text: 'Great idea! See you then', authorId: 'user-1', chatId: 'demo-chat' }
  ]
  
  sampleMessages.forEach(msg => {
    messagesStore.addMessage(msg)
  })
  
  notificationStore.showSuccess('Sample Messages', 'Added 5 sample messages for search testing')
}

function handleSearchResult(result) {
  notificationStore.showInfo('Search Result', `Found: "${result.text}"`)
}

// Emoji picker
function handleEmojiSelect(emoji) {
  selectedEmojis.value.push(emoji)
  if (selectedEmojis.value.length > 20) {
    selectedEmojis.value = selectedEmojis.value.slice(-20)
  }
  showEmojiPicker.value = false
}

function clearRecentEmojis() {
  localStorage.removeItem('recentEmojis')
  notificationStore.showSuccess('Cleared', 'Recent emojis cleared')
}

// Media gallery
function addSampleMedia() {
  notificationStore.showInfo('Sample Media', 'Media gallery contains sample photos, videos, files, and links')
}

// Main sidebar demo
function goToSidebarDemo() {
  window.open('/demo/sidebar', '_blank')
}

// Context menu demo
function showDemoContextMenu(event, message) {
  event.preventDefault()
  
  contextMenuMessage.value = message
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
}

function closeDemoContextMenu() {
  contextMenuVisible.value = false
  contextMenuMessage.value = null
}

function handleDemoContextMenuAction(action, data) {
  notificationStore.showInfo('Context Menu Action', `Action: ${action}`)
  
  switch (action) {
    case 'reply':
      notificationStore.showSuccess('Reply', `Replying to: "${data.text}"`)
      break
    case 'edit':
      notificationStore.showSuccess('Edit', `Editing message: "${data.text}"`)
      break
    case 'react':
      notificationStore.showSuccess('Reaction', `Added ${data.emoji} reaction`)
      break
    case 'copy-text':
      notificationStore.showSuccess('Copied', 'Message text copied to clipboard')
      break
    case 'forward':
      notificationStore.showSuccess('Forward', 'Message forwarded')
      break
    case 'delete':
      notificationStore.showSuccess('Delete', 'Message deleted')
      break
    case 'pin':
      notificationStore.showSuccess('Pin', 'Message pinned')
      break
    case 'select':
      notificationStore.showSuccess('Select', 'Message selected')
      break
  }
}

function addDemoMessages() {
  const newMessages = [
    {
      id: `demo-${Date.now()}-1`,
      text: 'Tin nhắn mới được thêm vào',
      author: 'Demo User 2',
      authorId: 'demo-user-2',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: false
    },
    {
      id: `demo-${Date.now()}-2`,
      text: 'Bạn có thể nhấn chuột phải vào tin nhắn này',
      author: 'You',
      authorId: 'current-user',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    }
  ]
  
  demoMessages.value.push(...newMessages)
  notificationStore.showSuccess('Demo Messages', 'Added 2 new demo messages')
}

onMounted(() => {
  notificationStore.init()
})
</script>

<style scoped>
.demo-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-header h1 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: #262626;
}

.demo-header p {
  margin: 0;
  font-size: 16px;
  color: #8c8c8c;
}

.demo-nav {
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.demo-nav :deep(.ant-menu) {
  border-bottom: none;
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.demo-section > p {
  margin: 0 0 24px 0;
  color: #8c8c8c;
  font-size: 16px;
}

.demo-actions {
  margin-bottom: 24px;
}

.demo-stats {
  margin-top: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.feature-list ul {
  margin: 0;
  padding-left: 20px;
  color: #595959;
}

.feature-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.typing-demo {
  margin: 24px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  align-items: center;
}

.search-demo {
  position: relative;
  height: 60px;
  background: #fafafa;
  border-radius: 8px;
  margin: 24px 0;
}

.selected-emojis {
  margin: 24px 0;
}

.selected-emojis h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #262626;
}

.emoji-display {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.selected-emoji {
  font-size: 24px;
  padding: 4px;
  border-radius: 4px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.context-menu-demo {
  margin: 24px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 2px dashed #d9d9d9;
}

.demo-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.demo-message {
  display: flex;
  width: 100%;
}

.demo-message.own-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: #f0f0f0;
  color: #262626;
  cursor: context-menu;
  transition: all 0.2s ease;
}

.message-bubble:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.message-bubble.own-bubble {
  background: #1890ff;
  color: white;
  border-bottom-right-radius: 6px;
}

.demo-message:not(.own-message) .message-bubble {
  border-bottom-left-radius: 6px;
}

.message-author {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1890ff;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
}

.demo-instructions {
  padding: 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  text-align: center;
}

.demo-instructions p {
  margin: 0;
  color: #0050b3;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .demo-container {
    padding: 10px;
  }
  
  .demo-section {
    padding: 20px;
  }
  
  .demo-header {
    padding: 20px;
  }
  
  .demo-header h1 {
    font-size: 24px;
  }
  
  .demo-nav :deep(.ant-menu) {
    overflow-x: auto;
  }
}
</style>