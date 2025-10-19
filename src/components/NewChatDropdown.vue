<template>
  <div class="dropdown-container">
    <a-button 
      type="primary" 
      class="new-chat-dropdown-btn"
      @click="toggleDropdown"
    >
      <PlusOutlined />
      New
      <DownOutlined />
    </a-button>
    
    <div v-if="dropdownVisible" class="dropdown-menu" @click.stop>
      <div class="menu-item" @click="handleMenuClick('private')">
        <UserOutlined class="menu-icon" />
        <div class="menu-content">
          <div class="menu-title">Private Chat</div>
          <div class="menu-desc">Start a conversation with someone</div>
        </div>
      </div>
      
      <div class="menu-divider"></div>
      
      <div class="menu-item" @click="handleMenuClick('group')">
        <TeamOutlined class="menu-icon" />
        <div class="menu-content">
          <div class="menu-title">New Group</div>
          <div class="menu-desc">Create a group conversation</div>
        </div>
      </div>
      
      <div class="menu-divider"></div>
      
      <div class="menu-item" @click="handleMenuClick('channel')">
        <SoundOutlined class="menu-icon" />
        <div class="menu-content">
          <div class="menu-title">New Channel</div>
          <div class="menu-desc">Broadcast to many people</div>
        </div>
      </div>
    </div>
    
    <!-- User Search Modal -->
    <UserSearchModalSimple />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  PlusOutlined, 
  DownOutlined, 
  UserOutlined, 
  TeamOutlined, 
  SoundOutlined 
} from '@ant-design/icons-vue'
import { useUserSearchStore } from '../store/userSearch.js'
import { useChatsStore } from '../store/chats.js'
import UserSearchModalSimple from './UserSearchModalSimple.vue'

const userSearchStore = useUserSearchStore()
const chatsStore = useChatsStore()

const dropdownVisible = ref(false)

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const handleMenuClick = (key) => {
  // Close dropdown
  dropdownVisible.value = false
  
  try {
    switch (key) {
      case 'private':
        // Open user search modal for private chat
        userSearchStore.openSearchModal()
        break
      case 'group':
        // Create new group
        chatsStore.createGroup('Nhóm mới')
        break
      case 'channel':
        // Create new channel
        chatsStore.createChannel('Channel mới')
        break
    }
  } catch (error) {
    console.error('Error in handleMenuClick:', error)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    dropdownVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.new-chat-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  height: 36px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.new-chat-dropdown-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.new-chat-dropdown-btn:active {
  transform: translateY(0);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 240px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #f5f5f5;
  transform: translateX(2px);
}

.menu-item:last-child {
  margin-bottom: 0;
}

.menu-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #1890ff;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
}

.menu-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.3;
}

/* Animation */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>