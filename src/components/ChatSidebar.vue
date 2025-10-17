<script setup>
import { computed } from 'vue'
import { useStores } from '../composables/useStores'
import { 
  UserAddOutlined, 
  SoundOutlined, 
  UserOutlined, 
  TeamOutlined,
  PushpinOutlined,
  BellOutlined
} from '@ant-design/icons-vue'

const { chatsStore, setActiveChat } = useStores()
const filteredChats = computed(() => chatsStore.filtered)

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
      <a-space>
        <a-button 
          type="text" 
          @click="newGroup"
          :title="'Tạo nhóm mới'"
        >
          <template #icon><UserAddOutlined /></template>
        </a-button>
        <a-button 
          type="text" 
          @click="newChannel"
          :title="'Tạo channel mới'"
        >
          <template #icon><SoundOutlined /></template>
        </a-button>
      </a-space>
    </div>

    <!-- Search Input -->
    <div class="search-container">
      <a-input-search 
        placeholder="Tìm kiếm cuộc trò chuyện"
        @search="onSearch"
        @input="e => onSearch(e.target.value)"
        allow-clear
      />
    </div>

    <!-- Chat List -->
    <div class="chat-list-container">
      <div class="chat-list">
        <div
          v-for="chat in filteredChats"
          :key="chat?.id || Math.random()"
          @click="chat?.id && openChat(chat.id)"
          :class="['chat-item', { 'active': chat?.id === chatsStore.state.activeChatId }]"
          v-if="chat && chat.id"
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
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.search-container {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.chat-list-container {
  flex: 1;
  overflow-y: auto;
}

.chat-list {
  height: 100%;
}

.chat-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-light);
  position: relative;
}

.chat-item:hover {
  background-color: #f5f5f5;
  transform: translateX(2px);
}

.chat-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid var(--primary-color);
}

.chat-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
}

.chat-item-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
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
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .search-container {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .chat-item-content {
    padding: var(--spacing-sm) var(--spacing-md);
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
}
</style>