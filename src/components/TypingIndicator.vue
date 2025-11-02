<template>
  <transition name="typing-fade">
    <div v-if="typingUsers.length > 0" class="typing-indicator">
      <div class="typing-content">
        <!-- Typing animation dots -->
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        
        <!-- Typing text -->
        <span class="typing-text">
          {{ typingText }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useMessagesStore } from '../store/messages'
import { useUsersStore } from '../store/users'

const messagesStore = useMessagesStore()
const usersStore = useUsersStore()

// Computed
const typingUsers = computed(() => {
  return messagesStore.state.typingUsers || []
})

const typingText = computed(() => {
  const users = typingUsers.value
  if (users.length === 0) return ''

  // Get user names
  const userNames = users.map(userId => {
    const user = usersStore.getUserById(userId)
    return user?.name || user?.username || `User ${userId.slice(-4)}`
  })

  if (userNames.length === 1) {
    return `${userNames[0]} đang nhập...`
  } else if (userNames.length === 2) {
    return `${userNames[0]} và ${userNames[1]} đang nhập...`
  } else if (userNames.length === 3) {
    return `${userNames[0]}, ${userNames[1]} và ${userNames[2]} đang nhập...`
  } else {
    return `${userNames[0]}, ${userNames[1]} và ${userNames.length - 2} người khác đang nhập...`
  }
})
</script>

<style scoped>
.typing-indicator {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  margin: 4px 0;
  display: inline-block;
  max-width: 200px;
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-dots {
  display: flex;
  gap: 2px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #8c8c8c;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 12px;
  color: #8c8c8c;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Transition animations */
.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: all 0.3s ease;
}

.typing-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.typing-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .typing-indicator {
    max-width: 150px;
  }
  
  .typing-text {
    font-size: 11px;
  }
}
</style>