<template>
  <div class="suggested-contacts">
    <div class="section-header">
      <span class="section-title">Suggested Contacts</span>
    </div>
    
    <div class="contacts-list">
      <div
        v-for="(contact, index) in contacts"
        :key="contact.id"
        :class="['contact-item', { 'selected': selectedIndex === index }]"
        @click="handleSelect(contact)"
        @keydown.enter="handleSelect(contact)"
        @keydown.space.prevent="handleSelect(contact)"
        tabindex="0"
        role="button"
        :aria-label="`Select ${contact.name}`"
      >
        <div class="contact-avatar">
          <a-avatar :src="contact.avatar" :size="36" :style="{ backgroundColor: getAvatarColor(contact.id) }">
            {{ getUserInitials(contact.name) }}
          </a-avatar>
          <div v-if="contact.isOnline" class="online-indicator"></div>
        </div>
        
        <div class="contact-info">
          <div class="contact-name">
            {{ contact.name }}
            <a-tag v-if="contact.isContact" color="blue" size="small">Contact</a-tag>
          </div>
          <div class="contact-username">@{{ contact.username }}</div>
          <div v-if="contact.mutualContacts && contact.mutualContacts > 0" class="mutual-info">
            <UsergroupAddOutlined class="mutual-icon" />
            {{ contact.mutualContacts }} mutual contact{{ contact.mutualContacts > 1 ? 's' : '' }}
          </div>
        </div>
        
        <div class="contact-actions">
          <UserStatusIndicator
            :is-online="contact.isOnline"
            :last-seen="contact.lastSeen"
            :show-text="false"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UsergroupAddOutlined } from '@ant-design/icons-vue'
import { getUserInitials, getAvatarColor } from '../utils/userHelpers.js'
import UserStatusIndicator from './UserStatusIndicator.vue'

const props = defineProps({
  contacts: {
    type: Array,
    default: () => []
  },
  selectedIndex: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['select'])

const handleSelect = (contact) => {
  emit('select', contact)
}
</script>

<style scoped>
.suggested-contacts {
  padding: 16px 0;
}

.section-header {
  padding: 0 24px 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contacts-list {
  max-height: 250px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 8px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: #f5f5f5;
}

.contact-item:focus,
.contact-item.selected {
  outline: 2px solid #1890ff;
  outline-offset: -2px;
  background-color: #e6f7ff;
}

.contact-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background-color: #52c41a;
  border: 2px solid white;
  border-radius: 50%;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-username {
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 4px;
}

.mutual-info {
  display: flex;
  align-items: center;
  color: #1890ff;
  font-size: 11px;
}

.mutual-icon {
  margin-right: 4px;
  font-size: 12px;
}

.contact-actions {
  flex-shrink: 0;
}

/* Scrollbar styles */
.contacts-list::-webkit-scrollbar {
  width: 6px;
}

.contacts-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.contacts-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.contacts-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .section-header {
    padding: 0 16px 8px;
  }
  
  .contact-item {
    padding: 10px 16px;
  }
  
  .contact-avatar {
    margin-right: 10px;
  }
  
  .contact-name {
    font-size: 15px;
  }
  
  .contact-username {
    font-size: 12px;
  }
  
  .mutual-info {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .section-header {
    padding: 0 12px 6px;
  }
  
  .contact-item {
    padding: 8px 12px;
  }
  
  .contact-avatar {
    margin-right: 8px;
  }
  
  .contact-name {
    font-size: 14px;
  }
  
  .contact-username {
    font-size: 11px;
  }
  
  .mutual-info {
    font-size: 10px;
  }
}
</style>