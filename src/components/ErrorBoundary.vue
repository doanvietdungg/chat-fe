<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <ExclamationCircleOutlined class="error-icon" />
      <h3 class="error-title">Something went wrong</h3>
      <p class="error-message">
        {{ errorMessage || 'An unexpected error occurred. Please try refreshing the page.' }}
      </p>
      
      <div class="error-actions">
        <a-button type="primary" @click="handleRetry">
          <ReloadOutlined />
          Try Again
        </a-button>
        
        <a-button type="text" @click="handleReload">
          Refresh Page
        </a-button>
      </div>
      
      <details v-if="showDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre class="error-stack">{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  fallbackMessage: {
    type: String,
    default: ''
  },
  showDetails: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['error', 'retry'])

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

// Capture errors from child components
onErrorCaptured((error, instance, info) => {
  console.error('Error caught by boundary:', error, info)
  
  hasError.value = true
  errorMessage.value = props.fallbackMessage || error.message
  errorDetails.value = `${error.stack}\n\nComponent: ${info}`
  
  emit('error', { error, instance, info })
  
  // Prevent the error from propagating further
  return false
})

// Handle global errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    hasError.value = true
    errorMessage.value = 'A critical error occurred'
    errorDetails.value = event.error?.stack || event.message
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    hasError.value = true
    errorMessage.value = 'An async operation failed'
    errorDetails.value = event.reason?.stack || event.reason
  })
}

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  emit('retry')
}

const handleReload = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px 20px;
  text-align: center;
}

.error-content {
  max-width: 400px;
}

.error-icon {
  font-size: 64px;
  color: #ff4d4f;
  margin-bottom: 20px;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 12px 0;
}

.error-message {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.error-details {
  text-align: left;
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.error-details summary {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 8px;
}

.error-stack {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #595959;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .error-boundary {
    padding: 30px 16px;
  }
  
  .error-icon {
    font-size: 48px;
  }
  
  .error-title {
    font-size: 18px;
  }
  
  .error-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>