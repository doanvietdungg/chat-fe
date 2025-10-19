<template>
  <div class="search-error-state">
    <div class="error-content">
      <ExclamationCircleOutlined class="error-icon" />
      <h4 class="error-title">Search Error</h4>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-actions">
        <a-button 
          v-if="canRetry"
          type="primary" 
          @click="handleRetry"
          :loading="isRetrying"
        >
          <ReloadOutlined />
          Retry Search
        </a-button>
        
        <a-button 
          type="text" 
          @click="handleDismiss"
        >
          Dismiss
        </a-button>
      </div>
      
      <div v-if="retryCount > 0" class="retry-info">
        <span class="retry-text">
          Retry attempt {{ retryCount }} of {{ maxRetries }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  errorMessage: {
    type: String,
    required: true
  },
  canRetry: {
    type: Boolean,
    default: true
  },
  isRetrying: {
    type: Boolean,
    default: false
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['retry', 'dismiss'])

const handleRetry = () => {
  emit('retry')
}

const handleDismiss = () => {
  emit('dismiss')
}
</script>

<style scoped>
.search-error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-content {
  max-width: 300px;
}

.error-icon {
  font-size: 48px;
  color: #ff4d4f;
  margin-bottom: 16px;
}

.error-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 8px 0;
}

.error-message {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.retry-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.retry-text {
  font-size: 12px;
  color: #bfbfbf;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .search-error-state {
    padding: 30px 16px;
  }
  
  .error-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  .error-title {
    font-size: 15px;
  }
  
  .error-message {
    font-size: 13px;
  }
  
  .error-actions {
    gap: 6px;
  }
}
</style>