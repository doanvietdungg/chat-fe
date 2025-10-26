<template>
  <a-layout-sider width="320" :collapsed-width="0" :breakpoint="'lg'" theme="light" class="chat-sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <h3 class="sidebar-title">Chats</h3>
      <div class="header-actions">
        <a-button type="text" @click="forceRefresh" size="small" title="Refresh chats">
          🔄
        </a-button>
        <a-button type="text" @click="debugChats" size="small" title="Debug chats">
          🐛
        </a-button>
        <a-button type="text" @click="showUserProfile = true" class="profile-btn">
          <a-avatar :size="32" :style="{ backgroundColor: getAvatarColor(currentUser?.id) }">
            {{ userInitials }}
          </a-avatar>
        </a-button>
        <NewChatDropdown />
      </div>
    </div>

    <!-- User Profile Modal -->
    <UserProfile v-model:open="showUserProfile" @logout="handleLogout" />

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
      </div>

      <!-- Chat List -->
      <div v-else class="chat-list">
        <div v-for="chat in chatList" :key="chat?.id || Math.random()" @click="openChat(chat?.id)"
          :class="['chat-item', { 'active': chat?.id === activeChat }]">
          <div class="chat-avatar">
            <a-badge :count="chat?.unread || 0" :offset="[5, 5]">
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
            </div>
          </div>

          <div class="chat-actions">
            <a-button type="text" size="small" :class="{ 'pinned': chat?.pinned }"
              @click.stop="togglePin($event, chat?.id)">
              <template #icon>
                <PushpinOutlined />
              </template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useChatsStore } from '../store/chats'
import { useAuthStore } from '../store/auth'
import {
  PushpinOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import NewChatDropdown from './NewChatDropdown.vue'
import UserProfile from './UserProfile.vue'

// Stores
const chatsStore = useChatsStore()
const authStore = useAuthStore()
const showUserProfile = ref(false)

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

    return sorted
  } catch (error) {
    console.error('Error in chatList computed:', error)
    return []
  }
})

const activeChat = computed(() => chatsStore.state.activeChatId)

// Methods
async function openChat(id) {
  if (!id) return
  console.log('Opening chat:', id)

  // Set active chat in chats store
  chatsStore.setActive(id)

  // Set current chat in chat store (for WebSocket subscriptions)
  const { useChatStore } = await import('../store/chat')
  const chatStore = useChatStore()
  chatStore.setCurrentChat(id)

  // Load messages for this chat
  const { useMessagesStore } = await import('../store/messages')
  const messagesStore = useMessagesStore()

  try {
    console.log('Loading messages for chat:', id)
    await messagesStore.loadMessagesForChat(id)
    console.log('Messages loaded successfully')
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
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
  console.log('========================')
}

function stopLoading() {
  console.log('Force stopping loading...')
  chatsStore.stopLoading()
}

function loadSampleData() {
  console.log('Loading sample data...')
  chatsStore.initSampleData()
}

// Initialize on mount
onMounted(async () => {
  console.log('ChatSidebar mounted with', chatsStore.state.chats.length, 'chats')

  // If there's an active chat, load its messages
  if (chatsStore.state.activeChatId) {
    await openChat(chatsStore.state.activeChatId)
  }
})
</script>

<style scoped>
.chat-sidebar {
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafafa;
}

.sidebar-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-btn {
  padding: 4px;
  border-radius: 50%;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
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

.chat-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.chat-actions .pinned {
  color: #1890ff;
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
    padding: 16px 12px;
  }

  .search-container {
    padding: 12px;
  }

  .chat-item {
    padding: 10px 12px;
  }

  .sidebar-title {
    font-size: 18px;
  }

  .chat-actions {
    display: none;
  }
}
</style>