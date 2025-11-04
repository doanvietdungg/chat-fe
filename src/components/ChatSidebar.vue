<template>
  <a-layout-sider width="320" :collapsed-width="0" :breakpoint="'lg'" theme="light" class="chat-sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="header-actions">
        <a-button type="text" @click="showUserProfile = true" class="profile-btn">
          <a-avatar :size="40" :style="{ backgroundColor: getAvatarColor(currentUser?.id) }">
            {{ userInitials }}
          </a-avatar>
        </a-button>
        <NewChatDropdown />
      </div>
    </div>

    <!-- User Profile Modal -->
    <UserProfile v-model:open="showUserProfile" @logout="handleLogout" />
    
    <!-- Context Menu -->
    <ChatContextMenu 
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :chatData="selectedChat"
      @close="contextMenuVisible = false"
      @action="handleContextMenuAction"
    />

    <!-- Search -->
    <div class="search-container">
      <a-input placeholder="Tìm kiếm cuộc trò chuyện..." @input="e => onSearch(e.target.value)" allow-clear
        class="search-input">
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>
    </div>

    <!-- Chat List -->
    <div class="chat-list-container">
      <!-- Loading State -->
      <div v-if="chatsStore.state.loading" class="loading-state">
        <a-spin size="large" />
        <p>Đang tải danh sách chat...</p>
        <a-button type="default" @click="stopLoading" style="margin-top: 16px;">
          Dừng tải
        </a-button>
      </div>

      <!-- Empty State -->
      <div v-else-if="chatList.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>Chưa có cuộc trò chuyện nào</p>
        <a-button type="primary" @click="forceRefresh">Tải lại từ API</a-button>
        <a-button type="default" @click="loadSampleData" style="margin-top: 8px;">Tạo dữ liệu mẫu</a-button>
        <a-button type="default" @click="debugChats" style="margin-top: 8px;">Debug</a-button>
        <a-button type="default" @click="testUnreadIncrement" style="margin-top: 8px;">Test Unread</a-button>
        <a-button type="default" @click="simulateNewMessage" style="margin-top: 8px;">Simulate Message</a-button>
      </div>

      <!-- Chat List -->
      <div v-else class="chat-list">
        <div v-for="chat in chatList" :key="chat?.id || Math.random()" 
          @click="openChat(chat?.id)"
          @contextmenu.prevent="showContextMenu($event, chat)"
          :class="['chat-item', { 'active': chat?.id === activeChat }]">
          <div class="chat-avatar">
            <a-badge 
              :count="chat?.unread || 0" 
              :offset="[5, 5]"
              :show-zero="false"
              :style="{ zIndex: 10 }">
              <a-avatar :style="{ backgroundColor: getAvatarColor(chat?.id) }" size="large">
                {{ getChatAvatar(chat) }}
              </a-avatar>
            </a-badge>
          </div>

          <div class="chat-info">
            <div class="chat-header">
              <span class="chat-name">{{ chat?.title || 'Unknown' }}</span>
              <span class="chat-time">{{ formatTime(chat?.lastMessageTime) }}</span>
            </div>

            <div class="chat-last-message">
              {{ formatLastMessage(chat?.last) }}
              <span v-if="chat?.unread > 0" class="unread-debug" style="color: red; font-weight: bold;">
                ({{ chat.unread }} unread)
              </span>
            </div>
          </div>

          <!-- Pin indicator -->
          <div v-if="chat?.pinned" class="pin-indicator">
            <PushpinOutlined />
          </div>
        </div>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatsStore } from '../store/chats'
import { useAuthStore } from '../store/auth'
import {
  PushpinOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import NewChatDropdown from './NewChatDropdown.vue'
import UserProfile from './UserProfile.vue'
import ChatContextMenu from './ChatContextMenu.vue'

// Stores and router
const router = useRouter()
const chatsStore = useChatsStore()
const authStore = useAuthStore()
const showUserProfile = ref(false)
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedChat = ref(null)

// No local state needed - using store directly

// Computed properties
const currentUser = computed(() => authStore.currentUser || {})
const userInitials = computed(() => authStore.userInitials || '?')

const chatList = computed(() => {
  try {
    // Direct access to state.chats and apply filtering logic here
    const q = chatsStore.state.query?.trim().toLowerCase() || ''
    const chatsArray = Array.isArray(chatsStore.state.chats) ? chatsStore.state.chats : []
    const validChats = chatsArray.filter(c => c && typeof c === 'object' && c.id && c.title)

    const items = q
      ? validChats.filter(c => c.title && c.title.toLowerCase().includes(q))
      : validChats.slice()

    // Sort: pinned first then by unread desc
    const sorted = items.sort((a, b) => {
      const aPinned = a && a.pinned ? 1 : 0
      const bPinned = b && b.pinned ? 1 : 0
      const aUnread = a && a.unread ? a.unread : 0
      const bUnread = b && b.unread ? b.unread : 0

      return (bPinned - aPinned) || (bUnread - aUnread)
    })

    // Debug log unread counts
    console.log('📊 ChatList computed - Unread counts:')
    sorted.forEach(chat => {
      if (chat.unread > 0) {
        console.log(`  - ${chat.title}: ${chat.unread} unread`)
      }
    })

    return sorted
  } catch (error) {
    console.error('Error in chatList computed:', error)
    return []
  }
})

const activeChat = computed(() => chatsStore.state.activeChatId)

// Methods
function openChat(id) {
  if (!id) return
  console.log('Opening chat via router:', id)

  // Navigate to chat route - this will trigger the chat loading in ChatView
  router.push(`/chat/${id}`)
}

function togglePin(e, id) {
  e.stopPropagation()
  if (!id) return
  chatsStore.togglePin(id)
}

function onSearch(value) {
  chatsStore.setSearch(value || '')
}

function getChatAvatar(chat) {
  return chat?.title?.[0]?.toUpperCase() || '?'
}

function formatLastMessage(message) {
  if (!message) return 'Không có tin nhắn'
  return message.length > 40 ? message.substring(0, 40) + '...' : message
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time

  if (diff < 60000) return 'vừa xong'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`

  return time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
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

function handleLogout() {
  // Handled by UserProfile component
}

async function forceRefresh() {
  console.log('Force refreshing chats...')
  try {
    await chatsStore.loadChats()
    console.log('Chats refreshed successfully')
  } catch (error) {
    console.error('Failed to refresh chats:', error)
  }
}

function debugChats() {
  console.log('=== CHAT DEBUG INFO ===')
  console.log('Auth token:', localStorage.getItem('auth_token'))
  console.log('Auth user:', localStorage.getItem('auth_user'))
  console.log('Is authenticated:', authStore.isAuthenticated)
  console.log('Chats store state:', chatsStore.state)
  console.log('Chats store filtered:', chatsStore.filtered)
  console.log('Chats store loading:', chatsStore.state.loading)
  console.log('Active chat ID:', chatsStore.state.activeChatId)
  console.log('Unread counts:')
  chatsStore.state.chats.forEach(chat => {
    console.log(`  - ${chat.title}: ${chat.unread || 0} unread`)
  })
  console.log('========================')
}

function stopLoading() {
  console.log('Force stopping loading...')
  chatsStore.stopLoading()
}

function showContextMenu(event, chat) {
  event.preventDefault()
  
  selectedChat.value = chat
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  
  // Adjust position if menu would go off-screen
  const menuWidth = 220
  const menuHeight = 300
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  if (contextMenuPosition.value.x + menuWidth > windowWidth) {
    contextMenuPosition.value.x = windowWidth - menuWidth - 10
  }
  
  if (contextMenuPosition.value.y + menuHeight > windowHeight) {
    contextMenuPosition.value.y = windowHeight - menuHeight - 10
  }
  
  contextMenuVisible.value = true
}

function handleContextMenuAction(action) {
  console.log('Context menu action:', action, 'for chat:', selectedChat.value?.title)
  // Actions are handled in the context menu component
}

function loadSampleData() {
  console.log('Loading sample data...')
  chatsStore.initSampleData()
}

function testUnreadIncrement() {
  console.log('Testing unread increment...')
  const firstChat = chatsStore.state.chats[0]
  if (firstChat) {
    console.log(`Before increment - Chat: ${firstChat.title}, Unread: ${firstChat.unread || 0}, Active: ${chatsStore.state.activeChatId}`)
    chatsStore.incrementUnread(firstChat.id)
    console.log(`After increment - Chat: ${firstChat.title}, Unread: ${firstChat.unread || 0}`)
  }
}

function simulateNewMessage() {
  console.log('Simulating new message...')
  const firstChat = chatsStore.state.chats[0]
  if (firstChat) {
    // Simulate a message from another user
    chatsStore.updateChatLastMessage(firstChat.id, {
      text: 'Test message from another user',
      timestamp: new Date().toISOString()
    })
    chatsStore.incrementUnread(firstChat.id)
    console.log(`Simulated message for chat: ${firstChat.title}, New unread: ${firstChat.unread}`)
  }
}

// Initialize on mount
onMounted(() => {
  console.log('ChatSidebar mounted with', chatsStore.state.chats.length, 'chats')
})
</script>

<style scoped>
.chat-sidebar {
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 60px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  padding: 6px 8px !important;
  border-radius: 8px !important;
  color: #8c8c8c !important;
  transition: all 0.2s ease !important;
  font-size: 14px;
}

.action-btn:hover {
  background-color: #f5f5f5 !important;
  color: #1890ff !important;
}

.profile-btn {
  padding: 0 !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 44px !important;
  height: 44px !important;
}

.profile-btn:hover {
  background-color: #f0f8ff !important;
  transform: scale(1.05);
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.search-input {
  border-radius: 8px;
}

.chat-list-container {
  flex: 1;
  overflow-y: auto;
}

.chat-list {
  padding: 8px 0;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 12px;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.chat-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.chat-avatar {
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-weight: 500;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 12px;
  color: #8c8c8c;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-last-message {
  font-size: 13px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pin-indicator {
  flex-shrink: 0;
  color: #1890ff;
  font-size: 12px;
  margin-left: 8px;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.loading-state p {
  margin-top: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-state .ant-btn {
  margin: 4px;
  min-width: 120px;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

/* Scrollbar */
.chat-list-container::-webkit-scrollbar {
  width: 6px;
}

.chat-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list-container::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.chat-list-container::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-header {
    padding: 10px 12px;
    min-height: 56px;
  }

  .header-actions {
    gap: 4px;
  }

  .action-btn {
    padding: 4px 6px !important;
    font-size: 12px;
  }

  .profile-btn .ant-avatar {
    width: 28px !important;
    height: 28px !important;
    font-size: 12px !important;
  }

  .search-container {
    padding: 12px;
  }

  .chat-item {
    padding: 10px 12px;
  }

  .pin-indicator {
    font-size: 10px;
  }
}
</style>