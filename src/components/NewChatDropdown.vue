<template>
  <div class="dropdown-container">
    <a-button 
      type="text" 
      class="new-chat-dropdown-btn"
      @click="toggleDropdown"
      title="Tạo cuộc trò chuyện mới"
    >
      <PlusOutlined />
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
  justify-content: center;
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  padding: 0 !important;
  color: #8c8c8c !important;
  transition: all 0.2s ease !important;
  font-size: 16px;
}

.new-chat-dropdown-btn:hover {
  background-color: #f5f5f5 !important;
  color: #1890ff !important;
  transform: scale(1.05);
}

.new-chat-dropdown-btn:active {
  transform: scale(0.95);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: white;
  border-radius: 8px;
  padding: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e8e8e8;
  z-index: 1000;
  animation: slideDown 0.15s ease-out;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 2px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #f0f8ff;
  transform: translateX(1px);
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

/* Responsive */
@media (max-width: 768px) {
  .new-chat-dropdown-btn {
    width: 32px !important;
    height: 32px !important;
    font-size: 14px;
  }

  .dropdown-menu {
    min-width: 200px;
    right: -8px;
  }

  .menu-item {
    padding: 8px 10px;
  }

  .menu-icon {
    font-size: 16px;
    margin-right: 10px;
  }

  .menu-title {
    font-size: 13px;
  }

  .menu-desc {
    font-size: 11px;
  }
}
</style>