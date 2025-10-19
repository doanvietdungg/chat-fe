<template>
  <div class="user-profile-preview">
    <div class="profile-header">
      <a-button
        type="text"
        size="small"
        @click="handleClose"
        class="close-btn"
      >
        <ArrowLeftOutlined />
      </a-button>
      <span class="header-title">User Profile</span>
    </div>
    
    <div class="profile-content">
      <div class="profile-avatar-section">
        <a-avatar 
          :src="user.avatar" 
          :size="80" 
          :style="{ backgroundColor: getAvatarColor(user.id) }"
          class="profile-avatar"
        >
          {{ getUserInitials(user.name) }}
        </a-avatar>
        
        <div class="status-section">
          <div v-if="user.isOnline" class="online-status">
            <div class="online-dot"></div>
            <span class="status-text">Online</span>
          </div>
          <div v-else class="offline-status">
            <span class="status-text">Last seen {{ formatLastSeen(user.lastSeen) }}</span>
          </div>
        </div>
      </div>
      
      <div class="profile-info">
        <h3 class="user-name">{{ user.name }}</h3>
        <p class="user-username">@{{ user.username }}</p>
        
        <div v-if="user.bio" class="user-bio">
          <p>{{ user.bio }}</p>
        </div>
        
        <div class="user-details">
          <div v-if="user.email" class="detail-item">
            <MailOutlined class="detail-icon" />
            <span class="detail-text">{{ user.email }}</span>
          </div>
          
          <div v-if="user.mutualContacts && user.mutualContacts > 0" class="detail-item">
            <UsergroupAddOutlined class="detail-icon" />
            <span class="detail-text">
              {{ user.mutualContacts }} mutual contact{{ user.mutualContacts > 1 ? 's' : '' }}
            </span>
          </div>
          
          <div v-if="user.mutualGroups && user.mutualGroups > 0" class="detail-item">
            <TeamOutlined class="detail-icon" />
            <span class="detail-text">
              {{ user.mutualGroups }} mutual group{{ user.mutualGroups > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
        
        <div v-if="user.isContact" class="contact-badge">
          <a-tag color="blue" size="large">
            <UserOutlined />
            Contact
          </a-tag>
        </div>
      </div>
      
      <div class="profile-actions">
        <a-button
          type="primary"
          size="large"
          @click="handleStartChat"
          block
          class="start-chat-btn"
        >
          <MessageOutlined />
          Start Chat
        </a-button>
        
        <a-button
          v-if="!user.isContact"
          @click="handleAddContact"
          :loading="isAddingContact"
          block
          class="add-contact-btn"
        >
          <UserAddOutlined />
          Add to Contacts
        </a-button>
        
        <a-button
          v-else
          @click="handleRemoveContact"
          :loading="isRemovingContact"
          block
          class="remove-contact-btn"
          danger
        >
          <UserDeleteOutlined />
          Remove from Contacts
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  ArrowLeftOutlined, 
  MessageOutlined, 
  UserAddOutlined, 
  UserDeleteOutlined,
  UserOutlined,
  MailOutlined,
  UsergroupAddOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'
import { getUserInitials, getAvatarColor, formatLastSeen } from '../utils/userHelpers.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'start-chat', 'add-contact', 'remove-contact'])

// Local state
const isAddingContact = ref(false)
const isRemovingContact = ref(false)

// Event handlers
const handleClose = () => {
  emit('close')
}

const handleStartChat = () => {
  emit('start-chat', props.user)
}

const handleAddContact = async () => {
  isAddingContact.value = true
  try {
    emit('add-contact', props.user)
  } finally {
    isAddingContact.value = false
  }
}

const handleRemoveContact = async () => {
  isRemovingContact.value = true
  try {
    emit('remove-contact', props.user)
  } finally {
    isRemovingContact.value = false
  }
}
</script>

<style scoped>
.user-profile-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1;
}

.close-btn {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-weight: 500;
  font-size: 16px;
  color: #262626;
}

.profile-content {
  flex: 1;
  padding: 24px;
  text-align: center;
  overflow-y: auto;
}

.profile-avatar-section {
  margin-bottom: 24px;
}

.profile-avatar {
  margin-bottom: 12px;
}

.status-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.online-status {
  display: flex;
  align-items: center;
  color: #52c41a;
  font-size: 14px;
  font-weight: 500;
}

.online-dot {
  width: 8px;
  height: 8px;
  background-color: #52c41a;
  border-radius: 50%;
  margin-right: 6px;
}

.offline-status {
  color: #8c8c8c;
  font-size: 14px;
}

.status-text {
  font-weight: 500;
}

.profile-info {
  margin-bottom: 32px;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.user-username {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0 0 16px 0;
}

.user-bio {
  margin: 16px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  text-align: left;
}

.user-bio p {
  margin: 0;
  color: #595959;
  line-height: 1.5;
}

.user-details {
  margin: 20px 0;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.detail-icon {
  color: #8c8c8c;
  margin-right: 12px;
  font-size: 16px;
  width: 16px;
}

.detail-text {
  color: #595959;
  font-size: 14px;
}

.contact-badge {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.start-chat-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.add-contact-btn,
.remove-contact-btn {
  height: 40px;
  font-size: 14px;
  border-radius: 6px;
}

.add-contact-btn {
  border-color: #1890ff;
  color: #1890ff;
}

.add-contact-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-header {
    padding: 12px 16px;
  }
  
  .profile-content {
    padding: 20px 16px;
  }
  
  .user-name {
    font-size: 22px;
  }
  
  .user-username {
    font-size: 15px;
  }
  
  .detail-item {
    padding: 6px 0;
  }
  
  .start-chat-btn {
    height: 44px;
  }
  
  .add-contact-btn,
  .remove-contact-btn {
    height: 36px;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 16px 12px;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .user-username {
    font-size: 14px;
  }
  
  .profile-avatar {
    margin-bottom: 8px;
  }
  
  .user-bio {
    padding: 12px;
    margin: 12px 0;
  }
  
  .detail-item {
    margin-bottom: 8px;
    padding: 4px 0;
  }
  
  .detail-text {
    font-size: 13px;
  }
  
  .start-chat-btn {
    height: 40px;
    font-size: 15px;
  }
  
  .add-contact-btn,
  .remove-contact-btn {
    height: 32px;
    font-size: 13px;
  }
}

/* Animation */
.user-profile-preview {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Scrollbar styles */
.profile-content::-webkit-scrollbar {
  width: 6px;
}

.profile-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.profile-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.profile-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>