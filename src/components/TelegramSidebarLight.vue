<template>
  <div class="telegram-sidebar" :class="{ 'visible': visible }">
    <!-- Backdrop -->
    <div class="sidebar-backdrop" @click="closeSidebar"></div>
    
    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="header-controls">
          <a-button type="text" class="menu-btn" @click="toggleMenu">
            <MenuOutlined />
          </a-button>
          
          <h2 class="sidebar-title">{{ currentUser?.isChat ? 'Chat Info' : 'User Info' }}</h2>
          
          <a-button type="text" class="close-btn" @click="closeSidebar">
            <CloseOutlined />
          </a-button>
        </div>
      </div>

      <!-- User Profile Section -->
      <div class="user-profile-section">
        <div class="user-avatar-container">
          <a-avatar 
            :size="80" 
            :src="currentUser?.avatar"
            :style="{ backgroundColor: getAvatarColor(currentUser?.id) }"
            class="user-avatar"
          >
            {{ userInitials }}
          </a-avatar>
          
          <!-- Online Status -->
          <div class="online-status" :class="{ 'online': isOnline }"></div>
        </div>
        
        <div class="user-info">
          <h3 class="user-name">
            {{ currentUser?.name || currentUser?.username || 'Unknown User' }}
            <span class="user-badges">
              <span v-if="currentUser?.verified" class="badge verified">✓</span>
              <span v-if="currentUser?.premium" class="badge premium">⭐</span>
            </span>
          </h3>
          <p class="user-status">{{ userStatus }}</p>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="contact-info-section">
        <div class="info-item" v-if="currentUser?.phone">
          <div class="info-icon">
            <PhoneOutlined />
          </div>
          <div class="info-content">
            <div class="info-value">{{ currentUser.phone }}</div>
            <div class="info-label">Mobile</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <BellOutlined />
          </div>
          <div class="info-content">
            <div class="info-value">Notifications</div>
            <a-switch 
              v-model:checked="notificationsEnabled" 
              size="small"
              @change="toggleNotifications"
            />
          </div>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="stats-section">
        <div class="stats-item" @click="showMediaModal">
          <div class="stats-icon">
            <FileTextOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.posts }}</div>
            <div class="stats-label">posts</div>
          </div>
        </div>

        <div class="stats-item" @click="showPhotosModal">
          <div class="stats-icon">
            <PictureOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.photos }}</div>
            <div class="stats-label">photos</div>
          </div>
        </div>

        <div class="stats-item" @click="showVideosModal">
          <div class="stats-icon">
            <VideoCameraOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.videos }}</div>
            <div class="stats-label">videos</div>
          </div>
        </div>

        <div class="stats-item" @click="showFilesModal">
          <div class="stats-icon">
            <FileOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.files }}</div>
            <div class="stats-label">files</div>
          </div>
        </div>

        <div class="stats-item" @click="showLinksModal">
          <div class="stats-icon">
            <LinkOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.sharedLinks }}</div>
            <div class="stats-label">shared links</div>
          </div>
        </div>

        <div class="stats-item" @click="showVoiceModal">
          <div class="stats-icon">
            <AudioOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.voiceMessages }}</div>
            <div class="stats-label">voice messages</div>
          </div>
        </div>

        <div class="stats-item" @click="showGifsModal">
          <div class="stats-icon">
            <GifOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.gifs }}</div>
            <div class="stats-label">GIFs</div>
          </div>
        </div>

        <div class="stats-item" @click="showGroupsModal">
          <div class="stats-icon">
            <TeamOutlined />
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userStats.commonGroups }}</div>
            <div class="stats-label">group in common</div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="actions-section">
        <div class="action-item" @click="shareContact">
          <div class="action-icon">
            <ShareAltOutlined />
          </div>
          <div class="action-label">Share this contact</div>
        </div>

        <div class="action-item" @click="editContact">
          <div class="action-icon">
            <EditOutlined />
          </div>
          <div class="action-label">Edit contact</div>
        </div>

        <div class="action-item" @click="deleteContact">
          <div class="action-icon">
            <DeleteOutlined />
          </div>
          <div class="action-label">Delete contact</div>
        </div>

        <div class="action-item danger" @click="blockUser">
          <div class="action-icon">
            <StopOutlined />
          </div>
          <div class="action-label">Block user</div>
        </div>
      </div>

      <!-- Voice Message Button -->
      <div class="voice-message-section">
        <a-button 
          type="primary" 
          shape="circle" 
          size="large"
          class="voice-btn"
          @mousedown="startVoiceMessage"
          @mouseup="stopVoiceMessage"
          @mouseleave="stopVoiceMessage"
        >
          <AudioOutlined />
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  MenuOutlined,
  CloseOutlined,
  PhoneOutlined,
  BellOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FileOutlined,
  LinkOutlined,
  AudioOutlined,
  GifOutlined,
  TeamOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '../store/auth'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'update:visible'])

const authStore = useAuthStore()

// Reactive data
const notificationsEnabled = ref(true)
const isOnline = ref(true)

// Computed
const currentUser = computed(() => {
  if (props.userId) {
    // Mock data for chat info - in real app, get from chats store
    return { 
      id: props.userId, 
      name: 'Chat User', 
      phone: '+84 865725519', 
      verified: true,
      isChat: true 
    }
  }
  return authStore.user || {}
})

const userInitials = computed(() => {
  const user = currentUser.value
  if (user.name) {
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return user.username?.[0]?.toUpperCase() || '?'
})

const userStatus = computed(() => {
  if (isOnline.value) {
    return 'last seen recently'
  }
  return 'offline'
})

const userStats = computed(() => {
  // Mock data - in real app, this would come from API
  return {
    posts: 3,
    photos: 2216,
    videos: 193,
    files: 13,
    sharedLinks: 262,
    voiceMessages: 151,
    gifs: 63,
    commonGroups: 1
  }
})

// Methods
function closeSidebar() {
  emit('update:visible', false)
  emit('close')
}

function toggleMenu() {
  console.log('Toggle menu')
}

function getAvatarColor(userId) {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']
  if (!userId) return colors[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function toggleNotifications(enabled) {
  notificationsEnabled.value = enabled
  message.success(enabled ? 'Notifications enabled' : 'Notifications disabled')
}

// Stats modal functions
function showMediaModal() {
  message.info('Show media gallery')
}

function showPhotosModal() {
  message.info('Show photos')
}

function showVideosModal() {
  message.info('Show videos')
}

function showFilesModal() {
  message.info('Show files')
}

function showLinksModal() {
  message.info('Show shared links')
}

function showVoiceModal() {
  message.info('Show voice messages')
}

function showGifsModal() {
  message.info('Show GIFs')
}

function showGroupsModal() {
  message.info('Show common groups')
}

// Action functions
function shareContact() {
  message.info('Share contact')
}

function editContact() {
  message.info('Edit contact')
}

function deleteContact() {
  message.warning('Delete contact')
}

function blockUser() {
  message.error('Block user')
}

// Voice message functions
function startVoiceMessage() {
  console.log('Start voice message')
}

function stopVoiceMessage() {
  console.log('Stop voice message')
}

onMounted(() => {
  // Initialize component
})
</script>

<style scoped>
.telegram-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.telegram-sidebar.visible {
  opacity: 1;
  visibility: visible;
}

.sidebar-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.sidebar-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100vh;
  background: #ffffff;
  color: #262626;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.telegram-sidebar.visible .sidebar-content {
  transform: translateX(0);
}

/* Header */
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.header-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.menu-btn,
.close-btn {
  color: #8c8c8c !important;
  border: none !important;
  background: transparent !important;
}

.menu-btn:hover,
.close-btn:hover {
  color: #262626 !important;
  background: rgba(0, 0, 0, 0.05) !important;
}

/* User Profile Section */
.user-profile-section {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.user-avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.user-avatar {
  border: 3px solid #f0f0f0;
}

.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 2px solid #ffffff;
}

.online-status.online {
  background: #52c41a;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.user-badges {
  display: flex;
  gap: 4px;
}

.badge {
  font-size: 14px;
}

.badge.verified {
  color: #1890ff;
}

.badge.premium {
  color: #faad14;
}

.user-status {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* Contact Info Section */
.contact-info-section {
  padding: 0 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-size: 16px;
}

.info-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-value {
  color: #262626;
  font-size: 16px;
}

.info-label {
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 2px;
}

/* Stats Section */
.stats-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
  gap: 16px;
}

.stats-item:hover {
  background: #f5f5f5;
  padding-left: 8px;
  padding-right: 8px;
}

.stats-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-size: 16px;
}

.stats-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-value {
  color: #262626;
  font-size: 16px;
  font-weight: 500;
}

.stats-label {
  color: #8c8c8c;
  font-size: 16px;
}

/* Actions Section */
.actions-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
  gap: 16px;
}

.action-item:hover {
  background: #f5f5f5;
  padding-left: 8px;
  padding-right: 8px;
}

.action-item.danger {
  color: #ff4d4f;
}

.action-item.danger:hover {
  background: #fff2f0;
}

.action-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: inherit;
}

.action-label {
  font-size: 16px;
  color: inherit;
}

/* Voice Message Section */
.voice-message-section {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.voice-btn {
  width: 56px !important;
  height: 56px !important;
  background: #1890ff !important;
  border-color: #1890ff !important;
  font-size: 20px;
}

.voice-btn:hover {
  background: #40a9ff !important;
  border-color: #40a9ff !important;
}

/* Scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-content {
    width: 100vw;
  }
}

/* Ant Design Switch Override */
:deep(.ant-switch) {
  background-color: #d9d9d9;
}

:deep(.ant-switch-checked) {
  background-color: #1890ff;
}
</style>