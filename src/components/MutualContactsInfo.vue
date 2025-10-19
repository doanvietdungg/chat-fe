<template>
  <div v-if="hasMutualInfo" class="mutual-contacts-info">
    <div v-if="mutualContacts > 0" class="mutual-item">
      <UsergroupAddOutlined class="mutual-icon" />
      <span class="mutual-text">
        {{ mutualContacts }} mutual contact{{ mutualContacts > 1 ? 's' : '' }}
      </span>
    </div>
    
    <div v-if="mutualGroups > 0" class="mutual-item">
      <TeamOutlined class="mutual-icon" />
      <span class="mutual-text">
        {{ mutualGroups }} mutual group{{ mutualGroups > 1 ? 's' : '' }}
      </span>
    </div>
    
    <!-- Detailed mutual contacts (when expanded) -->
    <div v-if="showDetails && mutualContactsList.length > 0" class="mutual-details">
      <div class="mutual-details-header">
        <span>Mutual Contacts</span>
        <a-button type="text" size="small" @click="toggleDetails">
          <UpOutlined v-if="showDetails" />
          <DownOutlined v-else />
        </a-button>
      </div>
      
      <div class="mutual-contacts-list">
        <div 
          v-for="contact in mutualContactsList.slice(0, 5)" 
          :key="contact.id"
          class="mutual-contact-item"
        >
          <a-avatar :src="contact.avatar" :size="24">
            {{ getUserInitials(contact.name) }}
          </a-avatar>
          <span class="contact-name">{{ contact.name }}</span>
        </div>
        
        <div v-if="mutualContactsList.length > 5" class="more-contacts">
          +{{ mutualContactsList.length - 5 }} more
        </div>
      </div>
    </div>
    
    <!-- Toggle button for details -->
    <a-button 
      v-if="mutualContacts > 0 && !showDetails"
      type="text" 
      size="small" 
      @click="toggleDetails"
      class="show-details-btn"
    >
      Show details
      <DownOutlined />
    </a-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  UsergroupAddOutlined, 
  TeamOutlined, 
  DownOutlined, 
  UpOutlined 
} from '@ant-design/icons-vue'
import { getUserInitials } from '../utils/userHelpers.js'

const props = defineProps({
  mutualContacts: {
    type: Number,
    default: 0
  },
  mutualGroups: {
    type: Number,
    default: 0
  },
  mutualContactsList: {
    type: Array,
    default: () => []
  },
  showDetailsButton: {
    type: Boolean,
    default: false
  }
})

// Local state
const showDetails = ref(false)

// Computed
const hasMutualInfo = computed(() => {
  return props.mutualContacts > 0 || props.mutualGroups > 0
})

// Methods
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}
</script>

<style scoped>
.mutual-contacts-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mutual-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  font-size: 12px;
}

.mutual-icon {
  font-size: 14px;
}

.mutual-text {
  font-weight: 500;
}

.mutual-details {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-top: 4px;
}

.mutual-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #595959;
}

.mutual-contacts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mutual-contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-name {
  font-size: 12px;
  color: #262626;
}

.more-contacts {
  font-size: 11px;
  color: #8c8c8c;
  font-style: italic;
  margin-left: 32px;
}

.show-details-btn {
  align-self: flex-start;
  padding: 0;
  height: auto;
  font-size: 11px;
  color: #1890ff;
}

.show-details-btn:hover {
  color: #40a9ff;
}
</style>