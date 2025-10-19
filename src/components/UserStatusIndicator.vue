<template>
  <div class="user-status-indicator">
    <!-- Online indicator -->
    <div v-if="isOnline" class="status-indicator online" :title="statusText">
      <div class="status-dot online-dot"></div>
      <span v-if="showText" class="status-text">{{ statusText }}</span>
    </div>
    
    <!-- Offline indicator -->
    <div v-else class="status-indicator offline" :title="statusText">
      <div class="status-dot offline-dot"></div>
      <span v-if="showText" class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatLastSeen } from '../utils/userHelpers.js'

const props = defineProps({
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: String,
    default: null
  },
  showText: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const statusText = computed(() => {
  if (props.isOnline) {
    return 'Online'
  }
  return `Last seen ${formatLastSeen(props.lastSeen)}`
})
</script>

<style scoped>
.user-status-indicator {
  display: inline-flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  border-radius: 50%;
  flex-shrink: 0;
}

/* Size variants */
.user-status-indicator[data-size="small"] .status-dot {
  width: 6px;
  height: 6px;
}

.user-status-indicator[data-size="medium"] .status-dot {
  width: 8px;
  height: 8px;
}

.user-status-indicator[data-size="large"] .status-dot {
  width: 10px;
  height: 10px;
}

/* Online status */
.online-dot {
  background-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.status-indicator.online .status-text {
  color: #52c41a;
  font-weight: 500;
}

/* Offline status */
.offline-dot {
  background-color: #bfbfbf;
}

.status-indicator.offline .status-text {
  color: #8c8c8c;
}

.status-text {
  font-size: 12px;
  white-space: nowrap;
}

/* Animation for online status */
.online-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(82, 196, 26, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}
</style>