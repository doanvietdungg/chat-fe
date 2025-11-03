<template>
  <div>
    <!-- Hamburger Menu Button -->
    <div 
      v-if="!isVisible && !isPinnedViewOpen"
      class="hamburger-menu"
      @click="toggleSidebar"
    >
      <MenuOutlined />
    </div>

    <!-- Sidebar Overlay -->
    <div 
      v-if="isVisible"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Main Sidebar -->
    <div 
      class="main-sidebar"
      :class="{ visible: isVisible }"
    >
      <!-- User Profile Section -->
      <div class="user-profile-section">
        <div class="current-user">
          <a-avatar 
            :size="40" 
            :src="currentUser?.avatar"
            class="user-avatar"
          >
            {{ currentUser?.name?.[0]?.toUpperCase() || 'U' }}
          </a-avatar>
          <div class="user-info">
            <div class="user-name">{{ currentUser?.name || 'User' }}</div>
            <div class="user-status" @click="showStatusModal = true">
              Set Emoji Status
            </div>
          </div>
          <UpOutlined class="collapse-icon" />
        </div>

        <!-- Account List -->
        <div class="account-list">
          <div 
            v-for="account in accounts" 
            :key="account.id"
            class="account-item"
            @click="switchAccount(account)"
          >
            <a-avatar :size="32" :src="account.avatar">
              {{ account.name[0]?.toUpperCase() }}
            </a-avatar>
            <span class="account-name">{{ account.name }}</span>
            <a-badge 
              v-if="account.unreadCount > 0"
              :count="account.unreadCount" 
              class="account-badge"
            />
          </div>
          
          <div class="account-item add-account" @click="showAddAccount">
            <div class="add-icon">
              <PlusOutlined />
            </div>
            <span class="account-name">Add Account</span>
          </div>
        </div>
      </div>

      <!-- Main Menu -->
      <div class="main-menu">
        <div 
          v-for="item in menuItems" 
          :key="item.key"
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <component :is="item.icon" class="menu-icon" />
          <span class="menu-text">{{ item.label }}</span>
          <a-badge 
            v-if="item.badge > 0" 
            :count="item.badge" 
            class="menu-badge"
          />
          <a-switch 
            v-if="item.key === 'night-mode'"
            v-model:checked="nightMode"
            size="small"
            class="menu-switch"
            @click.stop
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="app-info">
          <div class="app-name">Telegram Desktop</div>
          <div class="app-version">Version 6.2.4 x64 - About</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  MenuOutlined,
  UpOutlined,
  PlusOutlined,
  UserOutlined,
  WalletOutlined,
  TeamOutlined,
  MessageOutlined,
  ContactsOutlined,
  PhoneOutlined,
  BookOutlined,
  SettingOutlined,
  BulbOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isPinnedViewOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'menu-click'])

const authStore = useAuthStore()
const router = useRouter()

// State
const isVisible = ref(props.visible)
const showStatusModal = ref(false)
const nightMode = ref(false)

// Computed
const currentUser = computed(() => authStore.user)

// Mock accounts data
const accounts = ref([
  {
    id: 'jace',
    name: 'Jace',
    avatar: null,
    unreadCount: 0
  },
  {
    id: 'xuan',
    name: 'Xuan',
    avatar: null,
    unreadCount: 1051
  },
  {
    id: '45kg',
    name: '45kg',
    avatar: null,
    unreadCount: 3472
  }
])

// Menu items
const menuItems = ref([
  {
    key: 'profile',
    label: 'My Profile',
    icon: UserOutlined,
    badge: 0
  },
  {
    key: 'wallet',
    label: 'Wallet',
    icon: WalletOutlined,
    badge: 0
  },
  {
    key: 'new-group',
    label: 'New Group',
    icon: TeamOutlined,
    badge: 0
  },
  {
    key: 'new-channel',
    label: 'New Channel',
    icon: MessageOutlined,
    badge: 0
  },
  {
    key: 'contacts',
    label: 'Contacts',
    icon: ContactsOutlined,
    badge: 0
  },
  {
    key: 'calls',
    label: 'Calls',
    icon: PhoneOutlined,
    badge: 0
  },
  {
    key: 'saved-messages',
    label: 'Saved Messages',
    icon: BookOutlined,
    badge: 0
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingOutlined,
    badge: 0
  },
  {
    key: 'night-mode',
    label: 'Night Mode',
    icon: BulbOutlined,
    badge: 0
  }
])

// Methods
function toggleSidebar() {
  isVisible.value = !isVisible.value
  emit('update:visible', isVisible.value)
}

function closeSidebar() {
  isVisible.value = false
  emit('update:visible', false)
}

function switchAccount(account) {
  console.log('Switching to account:', account.name)
  // Handle account switching logic
}

function showAddAccount() {
  console.log('Show add account modal')
  // Handle add account logic
}

function handleMenuClick(item) {
  console.log('Menu clicked:', item.key)
  emit('menu-click', item)
  
  // Handle specific menu actions
  switch (item.key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'contacts':
      router.push('/contacts')
      break
    case 'new-group':
      // Show new group modal
      break
    case 'new-channel':
      // Show new channel modal
      break
    default:
      break
  }
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}

// Handle escape key
function handleEscape(event) {
  if (event.key === 'Escape' && isVisible.value) {
    closeSidebar()
  }
}

// Watch props
watch(() => props.visible, (newValue) => {
  isVisible.value = newValue
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  
  // Load night mode from localStorage
  const savedNightMode = localStorage.getItem('nightMode')
  if (savedNightMode) {
    nightMode.value = JSON.parse(savedNightMode)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Watch night mode changes
watch(nightMode, (newValue) => {
  localStorage.setItem('nightMode', JSON.stringify(newValue))
  document.body.classList.toggle('dark-theme', newValue)
})
</script>

<style scoped>
.hamburger-menu {
  position: fixed;
  top: 10px;
  left: 20px;
  z-index: 1100;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8c8c8c;
  font-size: 24px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.hamburger-menu:hover {
  color: #1890ff;
  transform: scale(1.1);
  background: rgba(255, 255, 255, 1);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.main-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: #ffffff;
  color: #262626;
  border-right: 1px solid #e8e8e8;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.main-sidebar.visible {
  transform: translateX(0);
}

.user-profile-section {
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
}

.current-user {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.current-user:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  margin-right: 12px;
  background: #3498db;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.user-status {
  font-size: 13px;
  color: #8c8c8c;
  cursor: pointer;
}

.user-status:hover {
  color: #1890ff;
}

.collapse-icon {
  font-size: 12px;
  color: #bfbfbf;
}

.account-list {
  padding: 0 20px;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 6px;
  margin-bottom: 4px;
}

.account-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.account-item .ant-avatar {
  margin-right: 12px;
  background: #e74c3c;
}

.account-name {
  flex: 1;
  font-size: 14px;
}

.account-badge {
  margin-left: auto;
}

.add-account {
  color: #8c8c8c;
}

.add-account:hover {
  color: #1890ff;
}

.add-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
}

.main-menu {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-icon {
  width: 20px;
  margin-right: 16px;
  font-size: 18px;
  color: #8c8c8c;
}

.menu-text {
  flex: 1;
}

.menu-badge {
  margin-left: auto;
  margin-right: 8px;
}

.menu-switch {
  margin-left: auto;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  margin-top: auto;
}

.app-info {
  text-align: center;
}

.app-name {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.app-version {
  font-size: 11px;
  color: #bfbfbf;
}

/* Custom scrollbar */
.main-sidebar::-webkit-scrollbar {
  width: 6px;
}

.main-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.main-sidebar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.main-sidebar::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .main-sidebar {
    width: 100vw;
    max-width: 320px;
  }
  
  .hamburger-menu {
    top: 15px;
    left: 15px;
    width: 44px;
    height: 44px;
    font-size: 24px;
  }
}

/* Dark theme support */
:global(.dark-theme) .hamburger-menu {
  color: #ffffff;
}

:global(.dark-theme) .hamburger-menu:hover {
  color: #1890ff;
}

:global(.dark-theme) .main-sidebar {
  background: #1a1a1a;
  color: #ffffff;
}

:global(.dark-theme) .user-profile-section {
  border-bottom-color: #333333;
}

:global(.dark-theme) .sidebar-footer {
  border-top-color: #333333;
}

:global(.dark-theme) .menu-item:hover,
:global(.dark-theme) .current-user:hover,
:global(.dark-theme) .account-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Animation for menu items */
.menu-item {
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #1890ff;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.menu-item:hover::before {
  transform: translateX(0);
}

/* Badge animations */
.account-badge :deep(.ant-badge-count),
.menu-badge :deep(.ant-badge-count) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>