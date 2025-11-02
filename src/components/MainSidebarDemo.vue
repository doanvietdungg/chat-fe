<template>
  <div class="sidebar-demo">
    <div class="demo-header">
      <h2>Main Sidebar Demo</h2>
      <p>Click the hamburger menu (☰) in the top-left corner to open the sidebar</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h3>Features:</h3>
        <ul>
          <li>✅ Hamburger menu toggle (3 gạch)</li>
          <li>✅ User profile section with avatar</li>
          <li>✅ Multiple account switching</li>
          <li>✅ Unread message badges</li>
          <li>✅ Complete menu items (Profile, Wallet, Groups, etc.)</li>
          <li>✅ Night mode toggle</li>
          <li>✅ Responsive design</li>
          <li>✅ Smooth animations</li>
          <li>✅ Telegram-style design</li>
        </ul>
      </div>

      <div class="demo-section">
        <h3>Menu Actions:</h3>
        <div class="action-log">
          <div 
            v-for="(action, index) in actionLog" 
            :key="index"
            class="action-item"
          >
            <span class="action-time">{{ action.time }}</span>
            <span class="action-text">{{ action.text }}</span>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Controls:</h3>
        <a-space>
          <a-button type="primary" @click="toggleSidebar">
            Toggle Sidebar
          </a-button>
          <a-button @click="clearLog">
            Clear Log
          </a-button>
          <a-button @click="addRandomNotification">
            Add Notification
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- Main Sidebar Component -->
    <MainSidebar 
      v-model:visible="sidebarVisible"
      @menu-click="handleMenuClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import MainSidebar from './MainSidebar.vue'

// State
const sidebarVisible = ref(false)
const actionLog = ref([])

// Methods
function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value
  addToLog(`Sidebar ${sidebarVisible.value ? 'opened' : 'closed'}`)
}

function handleMenuClick(menuItem) {
  addToLog(`Menu clicked: ${menuItem.label}`)
  message.success(`Clicked: ${menuItem.label}`)
}

function clearLog() {
  actionLog.value = []
  message.success('Action log cleared')
}

function addRandomNotification() {
  const notifications = [
    'New message from John',
    'Group chat updated',
    'Call missed from Alice',
    'File shared in work group',
    'New contact added'
  ]
  
  const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
  addToLog(`Notification: ${randomNotification}`)
  message.info(randomNotification)
}

function addToLog(text) {
  const now = new Date()
  actionLog.value.unshift({
    time: now.toLocaleTimeString(),
    text: text
  })
  
  // Keep only last 10 entries
  if (actionLog.value.length > 10) {
    actionLog.value = actionLog.value.slice(0, 10)
  }
}

// Initial log entry
addToLog('Sidebar demo initialized')
</script>

<style scoped>
.sidebar-demo {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 80px 20px 20px 20px; /* Top padding to avoid hamburger menu */
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-header h2 {
  margin: 0 0 12px 0;
  color: #262626;
  font-size: 28px;
}

.demo-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 16px;
}

.demo-content {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.demo-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h3 {
  margin: 0 0 16px 0;
  color: #262626;
  font-size: 18px;
  font-weight: 600;
}

.demo-section ul {
  margin: 0;
  padding-left: 20px;
}

.demo-section li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #595959;
}

.action-log {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.action-item:last-child {
  border-bottom: none;
}

.action-time {
  color: #8c8c8c;
  font-family: monospace;
  min-width: 80px;
}

.action-text {
  color: #262626;
  flex: 1;
}

/* Custom scrollbar for action log */
.action-log::-webkit-scrollbar {
  width: 6px;
}

.action-log::-webkit-scrollbar-track {
  background: transparent;
}

.action-log::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.action-log::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-demo {
    padding: 70px 10px 20px 10px;
  }
  
  .demo-header {
    padding: 20px;
  }
  
  .demo-header h2 {
    font-size: 24px;
  }
  
  .demo-section {
    padding: 16px;
  }
  
  .demo-content {
    gap: 16px;
  }
}

/* Dark theme support */
:global(.dark-theme) .sidebar-demo {
  background: #1a1a1a;
}

:global(.dark-theme) .demo-header,
:global(.dark-theme) .demo-section {
  background: #2a2a2a;
  color: #ffffff;
}

:global(.dark-theme) .demo-header h2,
:global(.dark-theme) .demo-section h3 {
  color: #ffffff;
}

:global(.dark-theme) .demo-header p,
:global(.dark-theme) .demo-section li {
  color: #cccccc;
}

:global(.dark-theme) .action-log {
  background: #1f1f1f;
  border-color: #404040;
}

:global(.dark-theme) .action-item {
  border-bottom-color: #404040;
}

:global(.dark-theme) .action-text {
  color: #ffffff;
}

:global(.dark-theme) .action-time {
  color: #999999;
}
</style>