<template>
  <div class="notification-demo">
    <a-card title="Demo Hệ thống Thông báo" style="margin: 20px;">
      <!-- Notification Bell -->
      <div class="demo-section">
        <h4>Notification Bell</h4>
        <p>Click vào chuông để xem panel thông báo:</p>
        <NotificationBell />
      </div>

      <a-divider />

      <!-- Test Buttons -->
      <div class="demo-section">
        <h4>Test Notifications</h4>
        <div class="button-grid">
          <a-button type="primary" @click="testSuccess">
            <CheckCircleOutlined /> Success
          </a-button>
          
          <a-button danger @click="testError">
            <CloseCircleOutlined /> Error
          </a-button>
          
          <a-button @click="testWarning">
            <ExclamationCircleOutlined /> Warning
          </a-button>
          
          <a-button type="dashed" @click="testInfo">
            <InfoCircleOutlined /> Info
          </a-button>
          
          <a-button type="primary" ghost @click="testMessage">
            <MessageOutlined /> Message
          </a-button>
          
          <a-button @click="testSystem">
            <SettingOutlined /> System
          </a-button>
          
          <a-button @click="testTyping">
            🔤 Test Typing
          </a-button>
        </div>
      </div>

      <a-divider />

      <!-- Advanced Tests -->
      <div class="demo-section">
        <h4>Advanced Tests</h4>
        <div class="button-grid">
          <a-button @click="testPersistent">
            Persistent Notification
          </a-button>
          
          <a-button @click="testWithActions">
            With Actions
          </a-button>
          
          <a-button @click="testMultiple">
            Multiple Notifications
          </a-button>
          
          <a-button @click="testLongMessage">
            Long Message
          </a-button>
        </div>
      </div>

      <a-divider />

      <!-- Settings -->
      <div class="demo-section">
        <h4>Settings</h4>
        <a-button @click="openSettings">
          <SettingOutlined /> Mở cài đặt thông báo
        </a-button>
      </div>

      <a-divider />

      <!-- Statistics -->
      <div class="demo-section">
        <h4>Statistics</h4>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic 
              title="Tổng thông báo" 
              :value="notificationStore.state.notifications.length" 
            />
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="Chưa đọc" 
              :value="notificationStore.state.unreadCount"
              :value-style="{ color: '#cf1322' }"
            />
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="Tin nhắn" 
              :value="messageCount" 
            />
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="Hệ thống" 
              :value="systemCount" 
            />
          </a-col>
        </a-row>
      </div>

      <a-divider />

      <!-- Actions -->
      <div class="demo-section">
        <h4>Actions</h4>
        <a-space>
          <a-button @click="markAllAsRead">
            Đánh dấu tất cả đã đọc
          </a-button>
          
          <a-button @click="clearRead">
            Xóa đã đọc
          </a-button>
          
          <a-button danger @click="clearAll">
            Xóa tất cả
          </a-button>
        </a-space>
      </div>
    </a-card>

    <!-- Settings Modal -->
    <NotificationSettings 
      v-model:visible="settingsVisible" 
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { useNotificationsStore } from '../store/notifications'
import { useMessagesStore } from '../store/messages'
import NotificationBell from './NotificationBell.vue'
import NotificationSettings from './NotificationSettings.vue'

const notificationStore = useNotificationsStore()
const messagesStore = useMessagesStore()
const settingsVisible = ref(false)

// Computed
const messageCount = computed(() => {
  return notificationStore.messageNotifications.value.length
})

const systemCount = computed(() => {
  return notificationStore.systemNotifications.value.length
})

// Test Methods
function testSuccess() {
  notificationStore.showSuccess(
    'Thành công!',
    'Thao tác đã được thực hiện thành công'
  )
}

function testError() {
  notificationStore.showError(
    'Lỗi xảy ra!',
    'Không thể thực hiện thao tác. Vui lòng thử lại sau.'
  )
}

function testWarning() {
  notificationStore.showWarning(
    'Cảnh báo!',
    'Bạn có chắc chắn muốn thực hiện thao tác này không?'
  )
}

function testInfo() {
  notificationStore.showInfo(
    'Thông tin',
    'Đây là một thông báo thông tin quan trọng'
  )
}

function testMessage() {
  notificationStore.showMessageNotification({
    senderName: 'Nguyễn Văn A',
    text: 'Xin chào! Bạn có khỏe không?',
    senderAvatar: 'https://via.placeholder.com/32/1890ff/ffffff?text=A',
    chatId: 'chat-123',
    senderId: 'user-123'
  })
}

function testSystem() {
  notificationStore.showSystemNotification(
    'Cập nhật hệ thống',
    'Hệ thống sẽ được bảo trì vào 2:00 AM ngày mai'
  )
}

function testPersistent() {
  notificationStore.showError(
    'Lỗi nghiêm trọng!',
    'Đây là thông báo persistent, không tự động ẩn',
    { persistent: true }
  )
}

function testWithActions() {
  notificationStore.showMessageNotification({
    senderName: 'Trần Thị B',
    text: 'Bạn có muốn tham gia cuộc họp không?',
    senderAvatar: 'https://via.placeholder.com/32/52c41a/ffffff?text=B',
    chatId: 'chat-456',
    senderId: 'user-456',
    actions: [
      { label: 'Tham gia', action: 'join', primary: true },
      { label: 'Từ chối', action: 'decline' },
      { label: 'Xem chi tiết', action: 'view' }
    ]
  })
}

function testMultiple() {
  // Create multiple notifications quickly
  setTimeout(() => testSuccess(), 0)
  setTimeout(() => testInfo(), 200)
  setTimeout(() => testWarning(), 400)
  setTimeout(() => testMessage(), 600)
}

function testLongMessage() {
  notificationStore.showInfo(
    'Thông báo dài',
    'Đây là một thông báo có nội dung rất dài để test việc hiển thị text trong notification. Nội dung này sẽ được wrap và hiển thị đầy đủ trong notification panel.',
    {
      description: 'Mô tả bổ sung: Đây là phần mô tả chi tiết hơn về thông báo này. Nó cung cấp thêm thông tin để người dùng hiểu rõ hơn về nội dung thông báo.'
    }
  )
}

// Action Methods
function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function clearRead() {
  notificationStore.clearRead()
}

function clearAll() {
  notificationStore.clearAll()
}

function openSettings() {
  settingsVisible.value = true
}

function testTyping() {
  // Test typing indicator
  const messagesStore = useMessagesStore()
  
  // Simulate user typing
  messagesStore.setTyping('user-123', true)
  
  // Stop typing after 10 seconds
  setTimeout(() => {
    messagesStore.setTyping('user-123', false)
  }, 10000)
  
  notificationStore.showInfo(
    'Typing Test',
    'Đã test typing indicator - sẽ tự động tắt sau 10 giây'
  )
}
</script>

<style scoped>
.notification-demo {
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 20px;
}

.demo-section h4 {
  margin-bottom: 12px;
  color: #262626;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.demo-section p {
  margin-bottom: 12px;
  color: #595959;
}
</style>