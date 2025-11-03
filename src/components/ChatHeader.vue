<script setup>
import { computed, ref } from 'vue'

import { useChatsStore } from '../store/chats'
import { useChatStore } from '../store/chat'
import { 
  UserOutlined, 
  TeamOutlined, 
  SoundOutlined,
  SearchOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'
import TelegramSidebarLight from './TelegramSidebarLight.vue'
import { useUsersStore } from '../store/users'

const chats = useChatsStore()
const chat = useChatStore()
const usersStore = useUsersStore()

const activeChat = chats.activeChat

const isConnected = computed(() => chat.state.isConnected)
const showTelegramSidebar = ref(false)



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

function toggleSearch() {
  console.log('Toggle search')
  // Implement search functionality
}

function startCall() {
  console.log('Start voice call')
  // Implement voice call
}

function startVideoCall() {
  console.log('Start video call')
  // Implement video call
}

function showMoreOptions() {
  showTelegramSidebar.value = true
}

function showChatUserInfo() {
  // Only show user info for private chats
  if (activeChat?.type === 'private') {
    showTelegramSidebar.value = true
  }
}
</script>

<template>
  <div class="chat-header">
    <div class="header-left">
      <a-avatar 
        :style="{ backgroundColor: '#1890ff' }"
        size="large"
      >
        {{ getChatAvatar(activeChat) }}
      </a-avatar>
      
      <div class="chat-info" @click="showChatUserInfo" style="cursor: pointer;">
        <div class="chat-title">
          <component 
            :is="getChatIcon(activeChat?.type)" 
            class="chat-type-icon"
            v-if="activeChat?.type !== 'private'"
          />
          <span class="chat-name">{{ activeChat?.title || 'Chọn cuộc trò chuyện' }}</span>
        </div>
        <div class="chat-status" v-if="activeChat">
          <a-badge 
            :status="isConnected ? 'success' : 'warning'"
            :text="isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'"
          />
        </div>
      </div>
    </div>

    <div class="header-right">
      <!-- Search Button -->
      <a-button 
        type="text" 
        size="large"
        @click="toggleSearch"
        :title="'Tìm kiếm'"
        :disabled="!activeChat"
        class="telegram-btn"
      >
        <template #icon><SearchOutlined /></template>
      </a-button>
      
      <!-- Call Button -->
      <a-button 
        type="text" 
        size="large"
        @click="startCall"
        :title="'Gọi điện'"
        :disabled="!activeChat"
        class="telegram-btn"
      >
        <template #icon><PhoneOutlined /></template>
      </a-button>
      
      <!-- Video Call Button -->
      <a-button 
        type="text" 
        size="large"
        @click="startVideoCall"
        :title="'Gọi video'"
        :disabled="!activeChat"
        class="telegram-btn"
      >
        <template #icon><VideoCameraOutlined /></template>
      </a-button>
      
      <!-- More Options -->
      <a-button 
        type="text" 
        size="large"
        @click="showMoreOptions"
        :title="'Tùy chọn khác'"
        :disabled="!activeChat"
        class="telegram-btn"
      >
        <template #icon><MoreOutlined /></template>
      </a-button>
    </div>

    <!-- Telegram Sidebar (Chat Info) -->
    <TelegramSidebarLight 
      v-model:visible="showTelegramSidebar" 
      :userId="activeChat?.id"
    />
  </div>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--chat-bg);
  border-bottom: 1px solid var(--border-light);
  min-height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-type-icon {
  font-size: 14px;
  color: var(--text-secondary);
}

.chat-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-status {
  margin-top: 2px;
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.telegram-btn {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #8c8c8c !important;
  transition: all 0.2s ease !important;
}

.telegram-btn:hover {
  background-color: #f5f5f5 !important;
  color: #1890ff !important;
}

.telegram-btn:disabled {
  color: #d9d9d9 !important;
  background-color: transparent !important;
}



/* Responsive design */
@media (max-width: 768px) {
  .chat-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .header-right .ant-input-search {
    width: 200px !important;
  }
}

@media (max-width: 576px) {
  .header-right .ant-input-search {
    display: none;
  }
}
</style>