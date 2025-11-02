<template>
  <div class="telegram-sidebar-demo">
    <a-card title="Telegram Sidebar Demo" style="margin: 20px;">
      <div class="demo-content">
        <p>Click the button below to open the Telegram-style sidebar:</p>
        
        <a-space>
          <a-button type="primary" @click="showSidebar">
            Open User Info Sidebar
          </a-button>
          
          <a-button @click="showChatSidebar">
            Open Chat Info Sidebar
          </a-button>
        </a-space>

        <a-divider />

        <h4>Features:</h4>
        <ul>
          <li>Dark theme matching Telegram design</li>
          <li>User profile with avatar and status</li>
          <li>Contact information section</li>
          <li>Media statistics (photos, videos, files, etc.)</li>
          <li>Action buttons (share, edit, delete, block)</li>
          <li>Voice message button</li>
          <li>Smooth slide-in animation</li>
          <li>Mobile responsive</li>
        </ul>

        <a-divider />

        <h4>Usage:</h4>
        <pre><code>&lt;TelegramSidebar 
  v-model:visible="sidebarVisible" 
  :userId="selectedUserId"
/&gt;</code></pre>
      </div>
    </a-card>

    <!-- Telegram Sidebar -->
    <TelegramSidebar 
      v-model:visible="sidebarVisible" 
      :userId="selectedUserId"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TelegramSidebar from './TelegramSidebar.vue'

const sidebarVisible = ref(false)
const selectedUserId = ref(null)

function showSidebar() {
  selectedUserId.value = null // Show current user info
  sidebarVisible.value = true
}

function showChatSidebar() {
  selectedUserId.value = 'user-123' // Show specific user info
  sidebarVisible.value = true
}
</script>

<style scoped>
.telegram-sidebar-demo {
  max-width: 800px;
  margin: 0 auto;
}

.demo-content {
  line-height: 1.6;
}

pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 4px;
}
</style>