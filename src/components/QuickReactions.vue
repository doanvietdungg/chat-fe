<script setup>
import { ref, computed } from 'vue'
import { SmileOutlined } from '@ant-design/icons-vue'
import { useStores } from '../composables/useStores'

const props = defineProps({
  messageId: { type: String, required: true },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const { messagesStore, uiStore } = useStores()

// Common quick reaction emojis
const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡']

function addQuickReaction(emoji) {
  messagesStore.addReaction(props.messageId, emoji)
  emit('close')
}

function showAllReactions() {
  uiStore.openModal('reactions', { messageId: props.messageId })
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="quick-reactions">
    <div class="quick-reactions-container">
      <button 
        v-for="emoji in quickEmojis" 
        :key="emoji"
        @click="addQuickReaction(emoji)"
        class="quick-reaction-btn"
        :title="`React with ${emoji}`"
      >
        {{ emoji }}
      </button>
      
      <button 
        @click="showAllReactions" 
        class="more-reactions-btn"
        title="More reactions"
      >
        <SmileOutlined />
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-reactions {
  position: absolute;
  top: -45px;
  right: 0;
  z-index: 100;
  animation: quickReactionsSlideIn 0.2s ease-out;
}

.quick-reactions-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 25px;
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-md);
}

.quick-reaction-btn,
.more-reactions-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.quick-reaction-btn:hover,
.more-reactions-btn:hover {
  background: var(--bg-color);
  transform: scale(1.2);
}

.more-reactions-btn {
  color: var(--text-secondary);
}

.more-reactions-btn:hover {
  color: var(--primary-color);
}

/* Animation */
@keyframes quickReactionsSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .quick-reactions-container {
    background: #2f2f2f;
    border-color: #404040;
  }
  
  .quick-reaction-btn:hover,
  .more-reactions-btn:hover {
    background: #404040;
  }
}

/* Mobile responsive */
@media (max-width: 576px) {
  .quick-reactions {
    top: -40px;
    right: -10px;
  }
  
  .quick-reaction-btn,
  .more-reactions-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
  
  .quick-reactions-container {
    padding: 4px;
    gap: 2px;
  }
}
</style>