<template>
  <div class="test-container">
    <h2>Context Menu Test</h2>
    <div 
      class="test-message"
      @contextmenu="showContextMenu"
    >
      Nhấn chuột phải vào đây để test context menu
    </div>

    <MessageContextMenu
      :visible="visible"
      :position="position"
      :message-data="messageData"
      @close="closeMenu"
      @action="handleAction"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import MessageContextMenu from './MessageContextMenu.vue'

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const messageData = ref({
  id: 'test-msg',
  text: 'Test message content',
  content: 'Test message content',
  senderId: 'current-user',
  authorId: 'current-user',
  chatId: 'test-chat'
})

function showContextMenu(event) {
  event.preventDefault()
  
  position.value = {
    x: event.clientX,
    y: event.clientY
  }
  visible.value = true
}

function closeMenu() {
  visible.value = false
}

function handleAction(action, data) {
  message.success(`Action: ${action}`)
  console.log('Context menu action:', action, data)
}
</script>

<style scoped>
.test-container {
  padding: 50px;
  text-align: center;
}

.test-message {
  background: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  cursor: context-menu;
  margin: 20px 0;
  user-select: none;
}

.test-message:hover {
  background: #e6f7ff;
}
</style>