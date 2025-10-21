<script setup>
import { computed, ref } from 'vue'
import { useStores } from '../composables/useStores'
import { useAuthStore } from '../store/auth'
import { 
  UserOutlined, 
  TeamOutlined,
  SoundOutlined,
  PushpinOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import NewChatDropdown from './NewChatDropdown.vue'
import UserProfile from './UserProfile.vue'

const { chatsStore, setActiveChat } = useStores()
const authStore = useAuthStore()
const filteredChats = computed(() => chatsStore.filtered)
const showUserProfile = ref(false)

const currentUser = computed(() => authStore.currentUser)
const userInitials = computed(() => authStore.userInitials)

function openChat(id) { 
  setActiveChat(id) 
}

function togglePin(e, id) { 
  e.stopPropagation()
  chatsStore.togglePin(id) 
}

function toggleMute(e, id) { 
  e.stopPropagation()
  chatsStore.toggleMute(id) 
}

function onSearch(value) { 
  chatsStore.setSearch(value) 
}

function newGroup() { 
  chatsStore.createGroup('Nhóm mới') 
}

function newChannel() { 
  chatsStore.createChannel('Channel mới') 
}

function getChatIcon(type) {
  switch (type) {
    case 'group': return TeamOutlined
    case 'channel': return SoundOutlined
    default: return UserOutlined
  }
}

function getChatAvatar(chat) {
  return chat?.title?.[0]?.toUpperCase() || '?'
}

function formatLastMessage(message) {
  if (!message) return 'Không có tin nhắn'
  return message.length > 30 ? message.substring(0, 30) + '...' : message
}

function getAvatarColor(userId) {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
  if (!userId) return colors[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function handleLogout() {
  // Logout is handled by the UserProfile component
  // The app will automatically redirect to auth when isAuthenticated becomes false
}
</script>

<template>
  <a-layout-sider 
    width="320" 
    :collapsed-width="0"
    :breakpoint="'lg'"
    theme="light" 
    class="chat-sidebar"
    :style="{ borderRight: '1px solid var(--border-light)' }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <h3 class="sidebar-title">Chats</h3>
      <div class="header-actions">
        <a-button 
          type="text" 
          @click="showUserProfile = true"
          class="profile-btn"
          :title="'Thông tin tài khoản'"
        >
          <a-avatar :size="32" :style="{ backgroundColor: getAvatarColor(currentUser?.id) }">
            {{ userInitials }}
          </a-avatar>
        </a-button>
        <NewChatDropdown />
      </div>
    </div>
    
    <!-- User Profile Modal -->
    <UserProfile 
      v-model:open="showUserProfile"
      @logout="handleLogout"
    />

    <!-- Search Input -->
    <div class="search-container">
      <a-input 
        placeholder="Tìm kiếm cuộc trò chuyện..."
        @input="e => onSearch(e.target.value)"
        allow-clear
        class="search-input"
      >
        <template #prefix>
          <SearchOutlined class="search-icon" />
        </template>
      </a-input>
    </div>

    <!-- Chat List -->
    <div class="chat-list-container">
      <div class="chat-list">
        <template v-for="chat in filteredChats" :key="chat?.id">
          <div
            v-if="chat && chat.id"
            @click="openChat(chat.id)"
            :class="['chat-item', { 'active': chat.id === chatsStore.state.activeChatId }]"
          >
            <div class="chat-item-content">
              <div class="chat-avatar">
                <a-badge 
                  :count="chat?.unread || 0" 
                  :offset="[5, 5]"
                  :number-style="{ backgroundColor: '#ff4d4f' }"
                >
                  <a-avatar 
                    :style="{ backgroundColor: '#1890ff' }"
                    size="large"
                  >
                    {{ getChatAvatar(chat) }}
                  </a-avatar>
                </a-badge>
              </div>
              
              <div class="chat-info">
                <div class="chat-title">
                  <component 
                    :is="getChatIcon(chat?.type)" 
                    class="chat-type-icon"
                    v-if="chat?.type !== 'private'"
                  />
                  <span class="chat-name text-ellipsis">{{ chat?.title || 'Unknown' }}</span>
                </div>
                
                <div class="chat-description text-ellipsis">
                  {{ formatLastMessage(chat?.last) }}
                </div>
              </div>

              <div class="chat-actions">
                <a-button 
                  type="text" 
                  size="small"
                  :class="{ 'active-action': chat?.pinned }"
                  @click="e => togglePin(e, chat?.id)"
                  :title="chat?.pinned ? 'Bỏ ghim' : 'Ghim'"
                >
                  <template #icon><PushpinOutlined /></template>
                </a-button>
                
                <a-button 
                  type="text" 
                  size="small"
                  :class="{ 'active-action': chat?.muted }"
                  @click="e => toggleMute(e, chat?.id)"
                  :title="chat?.muted ? 'Bỏ tắt tiếng' : 'Tắt tiếng'"
                >
                  <template #icon><BellOutlined /></template>
                </a-button>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Loading State -->
        <div v-if="chatsStore.state.loading" class="loading-state">
          <div v-for="i in 5" :key="i" class="skeleton-item">
            <a-skeleton-avatar :active="true" size="large" />
            <div class="skeleton-content">
              <a-skeleton-input :active="true" size="small" />
              <a-skeleton-input :active="true" size="small" style="width: 60%; margin-top: 4px;" />
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredChats.length === 0" class="empty-state">
          <p>Không có cuộc trò chuyện nào</p>
        </div>
      </div>
    </div>
  </a-layout-sider>
</template>

<style scoped>
.chat-sidebar {
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-btn {
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
}

.profile-btn:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
}

.sidebar-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.search-input {
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}

.search-input:hover {
  border-color: #40a9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.search-input:focus-within {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.search-icon {
  color: #bfbfbf;
  transition: color 0.2s;
}

.search-input:focus-within .search-icon {
  color: #1890ff;
}

.chat-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar */
.chat-list-container::-webkit-scrollbar {
  width: 6px;
}

.chat-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list-container::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
  transition: background 0.2s;
}

.chat-list-container::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

.chat-list-container::-webkit-scrollbar-thumb:active {
  background: #8c8c8c;
}

.chat-list {
  height: 100%;
}

.chat-item {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
  margin: 0 8px;
  border-radius: 12px;
  margin-bottom: 4px;
}

.chat-item:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chat-item.active {
  background-color: #e6f7ff;
  border: 2px solid #1890ff;
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.chat-item.active::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #1890ff;
  border-radius: 2px;
}

.chat-item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.chat-avatar {
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  margin-bottom: 2px;
}

.chat-type-icon {
  font-size: 12px;
  color: var(--text-secondary);
}

.chat-name {
  flex: 1;
  min-width: 0;
}

.chat-description {
  color: var(--text-secondary);
  font-size: 13px;
}

.chat-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.active-action {
  color: var(--primary-color) !important;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.loading-state {
  padding: var(--spacing-md);
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}

.skeleton-content {
  flex: 1;
}

/* Responsive Design */
@media (max-width: 992px) {
  .chat-sidebar {
    position: fixed !important;
    z-index: 100;
    height: 100vh;
  }
}

@media (max-width: 768px) {
  .sidebar-header {
    padding: 16px 12px 12px;
  }
  
  .search-container {
    padding: 12px;
  }
  
  .chat-item-content {
    padding: 10px 12px;
  }
  
  .chat-item {
    margin: 0 4px;
    margin-bottom: 2px;
  }
  
  .sidebar-title {
    font-size: 18px;
  }
}

@media (max-width: 576px) {
  .sidebar-title {
    font-size: 16px;
  }
  
  .chat-actions {
    display: none;
  }
  
  .chat-item:hover .chat-actions {
    display: none;
  }
  
  .search-container {
    padding: 8px;
  }
  
  .sidebar-header {
    padding: 12px 8px 8px;
  }
}
</style>