<template>
  <div class="message-reactions" v-if="reactions && reactions.length > 0">
    <div 
      v-for="reaction in groupedReactions" 
      :key="reaction.emoji"
      class="reaction-item"
      :class="{ 'user-reacted': reaction.userReacted }"
      @click="toggleReaction(reaction.emoji)"
    >
      <span class="reaction-emoji">{{ reaction.emoji }}</span>
      <span class="reaction-count">{{ reaction.count }}</span>
    </div>
    
    <a-button 
      type="text" 
      size="small" 
      class="add-reaction-btn"
      @click="showReactionPicker"
    >
      <template #icon>
        <SmileOutlined />
      </template>
    </a-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SmileOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  messageId: { type: String, required: true },
  reactions: { type: Array, default: () => [] }
})

const emit = defineEmits(['toggle-reaction', 'show-picker'])

const authStore = useAuthStore()

const groupedReactions = computed(() => {
  const grouped = {}
  
  props.reactions.forEach(reaction => {
    if (!grouped[reaction.emoji]) {
      grouped[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        userReacted: false
      }
    }
    
    grouped[reaction.emoji].count++
    grouped[reaction.emoji].users.push(reaction.userId)
    
    if (reaction.userId === authStore.user?.id) {
      grouped[reaction.emoji].userReacted = true
    }
  })
  
  return Object.values(grouped).sort((a, b) => b.count - a.count)
})

function toggleReaction(emoji) {
  emit('toggle-reaction', { messageId: props.messageId, emoji })
}

function showReactionPicker() {
  emit('show-picker', props.messageId)
}
</script>

<style scoped>
.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  align-items: center;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  min-height: 24px;
}

.reaction-item:hover {
  background: rgba(24, 144, 255, 0.1);
  border-color: #1890ff;
  transform: scale(1.05);
}

.reaction-item.user-reacted {
  background: rgba(24, 144, 255, 0.15);
  border-color: #1890ff;
  color: #1890ff;
}

.reaction-emoji {
  font-size: 14px;
  line-height: 1;
}

.reaction-count {
  font-weight: 500;
  font-size: 11px;
  min-width: 8px;
  text-align: center;
}

.add-reaction-btn {
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8c8c8c;
  border: 1px dashed rgba(0, 0, 0, 0.2);
}

.add-reaction-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

/* Dark theme for own messages */
.own-message .message-reactions .reaction-item {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.own-message .message-reactions .reaction-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.own-message .message-reactions .reaction-item.user-reacted {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.own-message .add-reaction-btn {
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
}

.own-message .add-reaction-btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

/* Animation */
.reaction-item {
  animation: reactionAppear 0.3s ease-out;
}

@keyframes reactionAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .reaction-item {
    padding: 1px 6px;
    font-size: 11px;
    min-height: 22px;
  }
  
  .reaction-emoji {
    font-size: 13px;
  }
  
  .add-reaction-btn {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }
}
</style>