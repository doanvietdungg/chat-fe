<script setup>
import { computed } from 'vue'
import { SmileOutlined } from '@ant-design/icons-vue'
import { useStores } from '../composables/useStores'

const props = defineProps({
  messageId: { type: String, required: true },
  reactions: { type: Array, default: () => [] }
})

const { messagesStore, uiStore } = useStores()

// Group reactions by emoji and check if current user reacted
const groupedReactions = computed(() => {
  return props.reactions.map(reaction => ({
    ...reaction,
    userReacted: reaction.users.includes(messagesStore.state.currentUser.id)
  }))
})

const hasReactions = computed(() => {
  return props.reactions && props.reactions.length > 0
})

function toggleReaction(emoji) {
  const reaction = props.reactions.find(r => r.emoji === emoji)
  const userReacted = reaction?.users.includes(messagesStore.state.currentUser.id)
  
  if (userReacted) {
    messagesStore.removeReaction(props.messageId, emoji)
  } else {
    messagesStore.addReaction(props.messageId, emoji)
  }
}

function showReactionPicker() {
  uiStore.openModal('reactions', { messageId: props.messageId })
}

function showReactionUsers(reaction) {
  // Show tooltip or modal with users who reacted
  const userNames = reaction.users.map(userId => {
    // In real app, would get user names from user store
    return userId === messagesStore.state.currentUser.id ? 'You' : `User ${userId.slice(-3)}`
  })
  
  uiStore.addNotification({
    type: 'info',
    message: `${reaction.emoji} ${userNames.join(', ')}`,
    duration: 2000
  })
}
</script>

<template>
  <div v-if="hasReactions" class="message-reactions">
    <div class="reactions-container">
      <div 
        v-for="reaction in groupedReactions" 
        :key="reaction.emoji"
        :class="[
          'reaction-item', 
          { 
            'user-reacted': reaction.userReacted,
            'single-reaction': reaction.count === 1
          }
        ]"
        @click="toggleReaction(reaction.emoji)"
        @mouseenter="showReactionUsers(reaction)"
        :title="`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`"
      >
        <span class="reaction-emoji">{{ reaction.emoji }}</span>
        <span v-if="reaction.count > 1" class="reaction-count">{{ reaction.count }}</span>
      </div>
      
      <a-button 
        type="text" 
        size="small" 
        @click="showReactionPicker"
        class="add-reaction-btn"
        :title="'Add reaction'"
      >
        <template #icon><SmileOutlined /></template>
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.message-reactions {
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.reactions-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  align-items: center;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 12px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  min-height: 24px;
}

.reaction-item:hover {
  background: var(--border-light);
  transform: scale(1.05);
}

.reaction-item.user-reacted {
  background: rgba(24, 144, 255, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.reaction-item.user-reacted:hover {
  background: rgba(24, 144, 255, 0.2);
}

.reaction-emoji {
  font-size: 14px;
  line-height: 1;
}

.reaction-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 8px;
  text-align: center;
}

.reaction-item.user-reacted .reaction-count {
  color: var(--primary-color);
}

.add-reaction-btn {
  height: 24px;
  width: 24px;
  padding: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.add-reaction-btn:hover {
  opacity: 1;
  background: var(--border-light);
  transform: scale(1.1);
}

/* Animation for new reactions */
.reaction-item {
  animation: reactionPop 0.3s ease-out;
}

@keyframes reactionPop {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive design */
@media (max-width: 576px) {
  .reaction-item {
    padding: 1px 4px;
    font-size: 11px;
  }
  
  .reaction-emoji {
    font-size: 12px;
  }
  
  .add-reaction-btn {
    height: 20px;
    width: 20px;
  }
}
</style>