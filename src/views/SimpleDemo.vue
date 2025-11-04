<template>
  <div class="simple-demo">
    <h1>🚀 Demo Tính năng mới</h1>
    
    <div class="demo-section">
      <h2>🎵 Voice Message</h2>
      <VoiceMessage 
        :audio-url="'#'"
        :duration="45"
        :file-size="1024000"
        :is-own="true"
        status="read"
      />
    </div>

    <div class="demo-section">
      <h2>🔄 Message Reactions</h2>
      <div class="message-bubble">
        Tin nhắn có phản ứng
        <MessageReactions 
          message-id="demo-1"
          :reactions="mockReactions"
        />
      </div>
    </div>

    <div class="demo-section">
      <h2>🌙 Theme Toggle</h2>
      <ThemeToggle />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VoiceMessage from '../components/VoiceMessage.vue'
import MessageReactions from '../components/MessageReactions.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const mockReactions = ref([
  { emoji: '👍', userId: 'user1' },
  { emoji: '❤️', userId: 'user2' }
])
</script>

<style scoped>
.simple-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.message-bubble {
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 280px;
}

h1, h2 {
  color: #262626;
}
</style>