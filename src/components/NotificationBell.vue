<template>
  <div class="notification-bell">
    <a-badge 
      :count="notificationStore.state.unreadCount" 
      :offset="[-5, 5]"
      :number-style="{ backgroundColor: '#ff4d4f' }"
    >
      <a-button 
        type="text" 
        shape="circle" 
        size="large"
        @click="togglePanel"
        :class="{ 'bell-active': notificationStore.state.isVisible }"
      >
        <template #icon>
          <BellOutlined v-if="!notificationStore.state.unreadCount" />
          <BellFilled v-else class="bell-filled" />
        </template>
      </a-button>
    </a-badge>

    <!-- Notification Panel -->
    <div 
      v-if="notificationStore.state.isVisible" 
      class="notification-panel"
      v-click-outside="hidePanel"
    >
      <!-- Header -->
      <div class="panel-header">
        <div class="header-title">
          <h4>Thông báo</h4>
          <span class="count">({{ notificationStore.state.unreadCount }} chưa đọc)</span>
        </div>
        <div class="header-actions">
          <a-button 
            type="text" 
            size="small" 
            @click="markAllAsRead"
            :disabled="!notificationStore.state.unreadCount"
          >
            Đánh dấu tất cả
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="clearRead"
            :disabled="!hasReadNotifications"
          >
            Xóa đã đọc
          </a-button>
        </div>
      </div>

      <!-- Filters -->
      <div class="panel-filters">
        <a-radio-group v-model:value="activeFilter" size="small" button-style="solid">
          <a-radio-button value="all">Tất cả</a-radio-button>
          <a-radio-button value="unread">Chưa đọc</a-radio-button>
          <a-radio-button value="messages">Tin nhắn</a-radio-button>
          <a-radio-button value="system">Hệ thống</a-radio-button>
        </a-radio-group>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <InboxOutlined class="empty-icon" />
          <p>Không có thông báo nào</p>
        </div>

        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 
            'unread': !notification.read,
            'message-type': notification.type === 'message',
            'error-type': notification.type === 'error'
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Avatar/Icon -->
          <div class="notification-avatar">
            <a-avatar 
              v-if="notification.avatar" 
              :src="notification.avatar" 
              :size="32"
            />
            <div v-else class="notification-icon" :class="`icon-${notification.type}`">
              <CheckCircleOutlined v-if="notification.type === 'success'" />
              <ExclamationCircleOutlined v-else-if="notification.type === 'warning'" />
              <CloseCircleOutlined v-else-if="notification.type === 'error'" />
              <MessageOutlined v-else-if="notification.type === 'message'" />
              <InfoCircleOutlined v-else />
            </div>
          </div>

          <!-- Content -->
          <div class="notification-content">
            <div class="notification-header">
              <h5 class="notification-title">{{ notification.title }}</h5>
              <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
            </div>
            
            <p class="notification-message">{{ notification.message }}</p>
            
            <div v-if="notification.description" class="notification-description">
              {{ notification.description }}
            </div>

            <!-- Actions -->
            <div v-if="notification.actions && notification.actions.length" class="notification-actions">
              <a-button 
                v-for="action in notification.actions" 
                :key="action.action"
                :type="action.primary ? 'primary' : 'default'"
                size="small"
                @click.stop="handleAction(notification, action)"
              >
                {{ action.label }}
              </a-button>
            </div>
          </div>

          <!-- Mark as read button -->
          <div class="notification-controls">
            <a-button 
              v-if="!notification.read"
              type="text" 
              size="small" 
              shape="circle"
              @click.stop="markAsRead(notification.id)"
              title="Đánh dấu đã đọc"
            >
              <CheckOutlined />
            </a-button>
            
            <a-button 
              type="text" 
              size="small" 
              shape="circle"
              @click.stop="removeNotification(notification.id)"
              title="Xóa thông báo"
            >
              <CloseOutlined />
            </a-button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="panel-footer">
        <a-button type="link" @click="openSettings">
          <SettingOutlined /> Cài đặt thông báo
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  BellOutlined, 
  BellFilled,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { useNotificationsStore } from '../store/notifications'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const notificationStore = useNotificationsStore()
const activeFilter = ref('all')

// Computed
const filteredNotifications = computed(() => {
  let notifications = notificationStore.state.notifications

  switch (activeFilter.value) {
    case 'unread':
      return notifications.filter(n => !n.read)
    case 'messages':
      return notifications.filter(n => n.type === 'message')
    case 'system':
      return notifications.filter(n => n.type === 'system')
    default:
      return notifications
  }
})

const hasReadNotifications = computed(() => {
  return notificationStore.state.notifications.some(n => n.read)
})

// Methods
function togglePanel() {
  notificationStore.toggleVisibility()
}

function hidePanel() {
  notificationStore.hidePanel()
}

function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function clearRead() {
  notificationStore.clearRead()
}

function markAsRead(id) {
  notificationStore.markAsRead(id)
}

function removeNotification(id) {
  notificationStore.removeNotification(id)
}

function handleNotificationClick(notification) {
  // Mark as read when clicked
  if (!notification.read) {
    markAsRead(notification.id)
  }

  // Handle different notification types
  if (notification.type === 'message' && notification.chatId) {
    // Navigate to chat
    console.log('Navigate to chat:', notification.chatId)
    // $router.push(`/chat/${notification.chatId}`)
  }
}

function handleAction(notification, action) {
  console.log('Handle action:', action.action, 'for notification:', notification.id)
  
  switch (action.action) {
    case 'reply':
      // Open chat and focus input
      break
    case 'view':
      // Navigate to relevant page
      break
    default:
      // Custom action handler
      break
  }
}

function openSettings() {
  console.log('Open notification settings')
  // Open settings modal or navigate to settings page
}

function formatTime(timestamp) {
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: vi 
    })
  } catch {
    return 'Vừa xong'
  }
}

// Click outside directive
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

onMounted(() => {
  notificationStore.init()
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-active {
  background-color: #f0f0f0;
}

.bell-filled {
  color: #ff4d4f;
  animation: ring 2s ease-in-out infinite;
}

@keyframes ring {
  0%, 20%, 50%, 80%, 100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(-5deg);
  }
  70% {
    transform: rotate(5deg);
  }
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #d9d9d9;
  z-index: 1000;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.count {
  color: #8c8c8c;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.panel-filters {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notifications-list {
  max-height: 320px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #d9d9d9;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #fafafa;
}

.notification-item.unread {
  background-color: #f6ffed;
  border-left: 3px solid #52c41a;
}

.notification-item.message-type.unread {
  background-color: #e6f7ff;
  border-left-color: #1890ff;
}

.notification-item.error-type {
  background-color: #fff2f0;
  border-left: 3px solid #ff4d4f;
}

.notification-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.icon-success {
  background-color: #f6ffed;
  color: #52c41a;
}

.icon-error {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.icon-warning {
  background-color: #fffbe6;
  color: #faad14;
}

.icon-info {
  background-color: #e6f7ff;
  color: #1890ff;
}

.icon-message {
  background-color: #f0f5ff;
  color: #722ed1;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.notification-time {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
  margin-left: 8px;
}

.notification-message {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #595959;
  line-height: 1.4;
}

.notification-description {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
  flex-shrink: 0;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

/* Scrollbar styling */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>