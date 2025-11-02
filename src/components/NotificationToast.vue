<template>
  <teleport to="body">
    <div class="notification-toasts">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in visibleToasts"
          :key="toast.id"
          class="toast-item"
          :class="[
            `toast-${toast.type}`,
            { 'toast-persistent': toast.persistent }
          ]"
        >
          <!-- Toast Content -->
          <div class="toast-content">
            <!-- Icon -->
            <div class="toast-icon">
              <CheckCircleOutlined v-if="toast.type === 'success'" />
              <ExclamationCircleOutlined v-else-if="toast.type === 'warning'" />
              <CloseCircleOutlined v-else-if="toast.type === 'error'" />
              <MessageOutlined v-else-if="toast.type === 'message'" />
              <InfoCircleOutlined v-else />
            </div>

            <!-- Text Content -->
            <div class="toast-text">
              <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
              <p class="toast-message">{{ toast.message }}</p>
              <p v-if="toast.description" class="toast-description">{{ toast.description }}</p>
            </div>

            <!-- Avatar for message toasts -->
            <div v-if="toast.avatar" class="toast-avatar">
              <a-avatar :src="toast.avatar" :size="32" />
            </div>
          </div>

          <!-- Actions -->
          <div v-if="toast.actions && toast.actions.length" class="toast-actions">
            <a-button
              v-for="action in toast.actions"
              :key="action.action"
              :type="action.primary ? 'primary' : 'default'"
              size="small"
              @click="handleAction(toast, action)"
            >
              {{ action.label }}
            </a-button>
          </div>

          <!-- Close Button -->
          <a-button
            type="text"
            size="small"
            shape="circle"
            class="toast-close"
            @click="removeToast(toast.id)"
          >
            <CloseOutlined />
          </a-button>

          <!-- Progress Bar for auto-hide -->
          <div
            v-if="!toast.persistent && toast.showProgress"
            class="toast-progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { useNotificationsStore } from '../store/notifications'

const notificationStore = useNotificationsStore()

// Local state for toast management
const toastQueue = ref([])
const maxToasts = 5
const defaultDuration = 5000

// Computed
const visibleToasts = computed(() => {
  return toastQueue.value.slice(0, maxToasts)
})

// Methods
function addToast(notification) {
  const toast = {
    ...notification,
    duration: notification.duration || defaultDuration,
    showProgress: !notification.persistent
  }

  // Add to queue
  toastQueue.value.unshift(toast)

  // Auto remove if not persistent
  if (!toast.persistent) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }

  // Keep queue size manageable
  if (toastQueue.value.length > maxToasts * 2) {
    toastQueue.value = toastQueue.value.slice(0, maxToasts * 2)
  }
}

function removeToast(id) {
  const index = toastQueue.value.findIndex(t => t.id === id)
  if (index > -1) {
    toastQueue.value.splice(index, 1)
  }
}

function handleAction(toast, action) {
  console.log('Toast action:', action.action, 'for toast:', toast.id)
  
  // Handle common actions
  switch (action.action) {
    case 'reply':
      // Open chat and focus input
      if (toast.chatId) {
        // Navigate to chat
        console.log('Navigate to chat:', toast.chatId)
      }
      break
    case 'view':
      // Navigate to relevant page
      break
    case 'dismiss':
      removeToast(toast.id)
      break
    default:
      // Custom action handler
      break
  }

  // Remove toast after action (unless it's a view action)
  if (action.action !== 'view') {
    removeToast(toast.id)
  }
}

// Listen for new notifications
let unsubscribe = null

onMounted(() => {
  // Watch for new notifications and show as toasts
  unsubscribe = notificationStore.state.notifications
  
  // Simple way to detect new notifications
  let lastCount = notificationStore.state.notifications.length
  
  const checkForNew = () => {
    const currentCount = notificationStore.state.notifications.length
    if (currentCount > lastCount) {
      // New notification added
      const newNotification = notificationStore.state.notifications[0]
      
      // Only show toast if in-app notifications are enabled
      if (notificationStore.state.settings.enableInApp) {
        addToast(newNotification)
      }
    }
    lastCount = currentCount
  }

  // Check every 100ms for new notifications
  const interval = setInterval(checkForNew, 100)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.notification-toasts {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  pointer-events: none;
}

.toast-item {
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #d9d9d9;
  margin-bottom: 12px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast-success {
  border-left: 4px solid #52c41a;
}

.toast-error {
  border-left: 4px solid #ff4d4f;
}

.toast-warning {
  border-left: 4px solid #faad14;
}

.toast-info {
  border-left: 4px solid #1890ff;
}

.toast-message {
  border-left: 4px solid #722ed1;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  padding-right: 40px; /* Space for close button */
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-success .toast-icon {
  color: #52c41a;
}

.toast-error .toast-icon {
  color: #ff4d4f;
}

.toast-warning .toast-icon {
  color: #faad14;
}

.toast-info .toast-icon {
  color: #1890ff;
}

.toast-message .toast-icon {
  color: #722ed1;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.toast-message {
  margin: 0;
  font-size: 13px;
  color: #595959;
  line-height: 1.4;
}

.toast-description {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #8c8c8c;
}

.toast-avatar {
  margin-left: 12px;
  flex-shrink: 0;
}

.toast-actions {
  padding: 0 16px 16px 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #8c8c8c;
}

.toast-close:hover {
  color: #595959;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  animation: progress linear;
  transform-origin: left;
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transitions */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Persistent toast styling */
.toast-persistent {
  border-left-width: 6px;
}

.toast-persistent .toast-progress {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-toasts {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .toast-item {
    width: 100%;
  }
}
</style>