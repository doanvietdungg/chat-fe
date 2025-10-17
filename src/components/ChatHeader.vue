<script setup>
import { computed, ref } from 'vue'
import { useChatsStore } from '../store/chats'
import { useChatStore } from '../store/chat'
import { 
  BellOutlined, 
  UserOutlined, 
  TeamOutlined, 
  SoundOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const chats = useChatsStore()
const chat = useChatStore()

const activeChat = computed(() => chats.activeChat)
const isConnected = computed(() => chat.state.isConnected)
const searchQuery = ref('')
const showNotificationModal = ref(false)
const notificationLevel = ref('all')
const muted = ref(false)

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

function showNotificationSettings() {
  const active = activeChat.value
  if (active) {
    notificationLevel.value = active.notificationLevel || 'all'
    muted.value = active.muted || false
    showNotificationModal.value = true
  }
}

function saveNotificationSettings() {
  const active = activeChat.value
  if (active) {
    chats.setNotificationLevel(active.id, notificationLevel.value)
    if (muted.value !== active.muted) {
      chats.toggleMute(active.id)
    }
    showNotificationModal.value = false
  }
}

function onSearch(value) {
  // Emit search event to parent or handle search logic
  console.log('Searching in chat:', value)
}

// Watch for active chat changes to update notification settings
function updateNotificationSettings() {
  const active = activeChat.value
  if (active) {
    notificationLevel.value = active.notificationLevel || 'all'
    muted.value = active.muted || false
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
      
      <div class="chat-info">
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
      <a-input-search 
        v-model:value="searchQuery"
        placeholder="Tìm trong đoạn chat"
        style="width: 280px"
        @search="onSearch"
        allow-clear
      />
      
      <a-button 
        type="text" 
        @click="showNotificationSettings"
        :title="'Cài đặt thông báo'"
        :disabled="!activeChat"
      >
        <template #icon><BellOutlined /></template>
      </a-button>
    </div>

    <!-- Notification Settings Modal -->
    <a-modal
      v-model:open="showNotificationModal"
      title="Cài đặt thông báo"
      @ok="saveNotificationSettings"
      ok-text="Lưu"
      cancel-text="Hủy"
      width="420px"
    >
      <div class="notification-settings">
        <div class="setting-group">
          <h4>Mức độ thông báo</h4>
          <a-radio-group v-model:value="notificationLevel">
            <a-radio value="all">Tất cả tin nhắn</a-radio>
            <a-radio value="mentions">Chỉ khi được nhắc đến</a-radio>
            <a-radio value="none">Tắt thông báo</a-radio>
          </a-radio-group>
        </div>
        
        <div class="setting-group">
          <a-switch 
            v-model:checked="muted" 
            checked-children="Đã tắt tiếng"
            un-checked-children="Bật tiếng"
          />
          <span class="switch-label">Tắt tiếng cuộc trò chuyện</span>
        </div>
      </div>
    </a-modal>
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
  gap: var(--spacing-md);
}

.notification-settings {
  padding: var(--spacing-md) 0;
}

.setting-group {
  margin-bottom: var(--spacing-lg);
}

.setting-group h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-group .ant-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.switch-label {
  margin-left: var(--spacing-sm);
  color: var(--text-primary);
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