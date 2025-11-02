<template>
  <a-modal
    v-model:open="visible"
    title="Cài đặt thông báo"
    :width="500"
    @ok="saveSettings"
    @cancel="resetSettings"
  >
    <div class="notification-settings">
      <!-- General Settings -->
      <div class="settings-section">
        <h4>Cài đặt chung</h4>
        
        <div class="setting-item">
          <div class="setting-label">
            <span>Bật thông báo trong ứng dụng</span>
            <p class="setting-description">Hiển thị thông báo toast trong ứng dụng</p>
          </div>
          <a-switch v-model:checked="localSettings.enableInApp" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Bật thông báo desktop</span>
            <p class="setting-description">Hiển thị thông báo trên desktop khi ứng dụng không được focus</p>
          </div>
          <a-switch 
            v-model:checked="localSettings.enableDesktop" 
            @change="handleDesktopToggle"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Bật âm thanh thông báo</span>
            <p class="setting-description">Phát âm thanh khi có thông báo mới</p>
          </div>
          <a-switch v-model:checked="localSettings.enableSound" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Tự động ẩn thông báo</span>
            <p class="setting-description">Tự động ẩn thông báo sau một khoảng thời gian</p>
          </div>
          <a-switch v-model:checked="localSettings.autoHide" />
        </div>

        <div v-if="localSettings.autoHide" class="setting-item">
          <div class="setting-label">
            <span>Thời gian tự động ẩn (giây)</span>
            <p class="setting-description">Thời gian chờ trước khi tự động ẩn thông báo</p>
          </div>
          <a-slider
            v-model:value="hideDelaySeconds"
            :min="1"
            :max="30"
            :marks="{ 1: '1s', 5: '5s', 10: '10s', 15: '15s', 30: '30s' }"
            :tooltip-formatter="(value) => `${value}s`"
          />
        </div>
      </div>

      <!-- Message Notifications -->
      <div class="settings-section">
        <h4>Thông báo tin nhắn</h4>
        
        <div class="setting-item">
          <div class="setting-label">
            <span>Thông báo tin nhắn mới</span>
            <p class="setting-description">Nhận thông báo khi có tin nhắn mới</p>
          </div>
          <a-switch v-model:checked="localSettings.messageNotifications" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Thông báo khi được mention</span>
            <p class="setting-description">Nhận thông báo khi được tag trong tin nhắn</p>
          </div>
          <a-switch v-model:checked="localSettings.mentionNotifications" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Thông báo tin nhắn nhóm</span>
            <p class="setting-description">Nhận thông báo từ các cuộc trò chuyện nhóm</p>
          </div>
          <a-switch v-model:checked="localSettings.groupNotifications" />
        </div>
      </div>

      <!-- System Notifications -->
      <div class="settings-section">
        <h4>Thông báo hệ thống</h4>
        
        <div class="setting-item">
          <div class="setting-label">
            <span>Thông báo cập nhật</span>
            <p class="setting-description">Nhận thông báo về các cập nhật ứng dụng</p>
          </div>
          <a-switch v-model:checked="localSettings.updateNotifications" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Thông báo bảo trì</span>
            <p class="setting-description">Nhận thông báo về lịch bảo trì hệ thống</p>
          </div>
          <a-switch v-model:checked="localSettings.maintenanceNotifications" />
        </div>
      </div>

      <!-- Do Not Disturb -->
      <div class="settings-section">
        <h4>Chế độ không làm phiền</h4>
        
        <div class="setting-item">
          <div class="setting-label">
            <span>Bật chế độ không làm phiền</span>
            <p class="setting-description">Tạm thời tắt tất cả thông báo</p>
          </div>
          <a-switch v-model:checked="localSettings.doNotDisturb" />
        </div>

        <div v-if="localSettings.doNotDisturb" class="setting-item">
          <div class="setting-label">
            <span>Thời gian không làm phiền</span>
            <p class="setting-description">Chọn khoảng thời gian tắt thông báo</p>
          </div>
          <a-time-range-picker
            v-model:value="dndTimeRange"
            format="HH:mm"
            placeholder="['Từ', 'Đến']"
          />
        </div>
      </div>

      <!-- Test Notifications -->
      <div class="settings-section">
        <h4>Kiểm tra thông báo</h4>
        
        <div class="test-buttons">
          <a-button @click="testNotification('success')">
            <CheckCircleOutlined /> Test Success
          </a-button>
          <a-button @click="testNotification('error')">
            <CloseCircleOutlined /> Test Error
          </a-button>
          <a-button @click="testNotification('warning')">
            <ExclamationCircleOutlined /> Test Warning
          </a-button>
          <a-button @click="testNotification('message')">
            <MessageOutlined /> Test Message
          </a-button>
        </div>
      </div>

      <!-- Permission Status -->
      <div class="settings-section">
        <h4>Trạng thái quyền</h4>
        
        <div class="permission-status">
          <div class="permission-item">
            <span>Desktop Notifications:</span>
            <a-tag :color="desktopPermissionColor">
              {{ desktopPermissionText }}
            </a-tag>
            <a-button 
              v-if="!hasDesktopPermission" 
              type="link" 
              size="small"
              @click="requestDesktopPermission"
            >
              Cấp quyền
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <a-button @click="resetToDefaults">Khôi phục mặc định</a-button>
        <div>
          <a-button @click="resetSettings">Hủy</a-button>
          <a-button type="primary" @click="saveSettings">Lưu</a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined
} from '@ant-design/icons-vue'
import { useNotificationsStore } from '../store/notifications'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const notificationStore = useNotificationsStore()

// Local settings state
const localSettings = ref({
  enableInApp: true,
  enableDesktop: true,
  enableSound: true,
  autoHide: true,
  hideDelay: 5000,
  messageNotifications: true,
  mentionNotifications: true,
  groupNotifications: true,
  updateNotifications: true,
  maintenanceNotifications: true,
  doNotDisturb: false,
  dndStartTime: null,
  dndEndTime: null
})

const hideDelaySeconds = computed({
  get: () => Math.round(localSettings.value.hideDelay / 1000),
  set: (value) => {
    localSettings.value.hideDelay = value * 1000
  }
})

const dndTimeRange = ref([])

// Desktop permission status
const desktopPermission = ref('default')

const hasDesktopPermission = computed(() => {
  return desktopPermission.value === 'granted'
})

const desktopPermissionColor = computed(() => {
  switch (desktopPermission.value) {
    case 'granted': return 'success'
    case 'denied': return 'error'
    default: return 'warning'
  }
})

const desktopPermissionText = computed(() => {
  switch (desktopPermission.value) {
    case 'granted': return 'Đã cấp quyền'
    case 'denied': return 'Bị từ chối'
    default: return 'Chưa cấp quyền'
  }
})

// Methods
function loadSettings() {
  // Load from store
  Object.assign(localSettings.value, notificationStore.state.settings)
  
  // Load DND time range
  if (localSettings.value.dndStartTime && localSettings.value.dndEndTime) {
    dndTimeRange.value = [
      localSettings.value.dndStartTime,
      localSettings.value.dndEndTime
    ]
  }
}

function saveSettings() {
  // Save DND time range
  if (dndTimeRange.value && dndTimeRange.value.length === 2) {
    localSettings.value.dndStartTime = dndTimeRange.value[0]
    localSettings.value.dndEndTime = dndTimeRange.value[1]
  }

  // Update store
  notificationStore.updateSettings(localSettings.value)
  
  message.success('Đã lưu cài đặt thông báo')
  emit('update:visible', false)
}

function resetSettings() {
  loadSettings()
  emit('update:visible', false)
}

function resetToDefaults() {
  localSettings.value = {
    enableInApp: true,
    enableDesktop: true,
    enableSound: true,
    autoHide: true,
    hideDelay: 5000,
    messageNotifications: true,
    mentionNotifications: true,
    groupNotifications: true,
    updateNotifications: true,
    maintenanceNotifications: true,
    doNotDisturb: false,
    dndStartTime: null,
    dndEndTime: null
  }
  dndTimeRange.value = []
}

async function handleDesktopToggle(enabled) {
  if (enabled && !hasDesktopPermission.value) {
    const granted = await requestDesktopPermission()
    if (!granted) {
      localSettings.value.enableDesktop = false
    }
  }
}

async function requestDesktopPermission() {
  const granted = await notificationStore.requestDesktopPermission()
  checkDesktopPermission()
  
  if (granted) {
    message.success('Đã cấp quyền thông báo desktop')
  } else {
    message.error('Không thể cấp quyền thông báo desktop')
  }
  
  return granted
}

function checkDesktopPermission() {
  if ('Notification' in window) {
    desktopPermission.value = Notification.permission
  }
}

function testNotification(type) {
  const testMessages = {
    success: {
      title: 'Thành công!',
      message: 'Đây là thông báo thành công test'
    },
    error: {
      title: 'Lỗi!',
      message: 'Đây là thông báo lỗi test'
    },
    warning: {
      title: 'Cảnh báo!',
      message: 'Đây là thông báo cảnh báo test'
    },
    message: {
      title: 'Tin nhắn mới',
      message: 'Đây là thông báo tin nhắn test',
      avatar: 'https://via.placeholder.com/32'
    }
  }

  const testData = testMessages[type]
  
  switch (type) {
    case 'success':
      notificationStore.showSuccess(testData.title, testData.message)
      break
    case 'error':
      notificationStore.showError(testData.title, testData.message)
      break
    case 'warning':
      notificationStore.showWarning(testData.title, testData.message)
      break
    case 'message':
      notificationStore.showMessageNotification({
        senderName: testData.title,
        text: testData.message,
        senderAvatar: testData.avatar,
        chatId: 'test-chat',
        senderId: 'test-user'
      })
      break
  }
}

// Watch for visibility changes
watch(() => props.visible, (visible) => {
  if (visible) {
    loadSettings()
    checkDesktopPermission()
  }
})

onMounted(() => {
  checkDesktopPermission()
})
</script>

<style scoped>
.notification-settings {
  max-height: 60vh;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  flex: 1;
}

.setting-label span {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  display: block;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.4;
}

.test-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.permission-status {
  background: #fafafa;
  padding: 12px;
  border-radius: 6px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-footer > div {
  display: flex;
  gap: 8px;
}

/* Scrollbar styling */
.notification-settings::-webkit-scrollbar {
  width: 6px;
}

.notification-settings::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notification-settings::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notification-settings::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>