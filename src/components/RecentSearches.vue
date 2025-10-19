<template>
  <div class="recent-searches">
    <div class="section-header">
      <span class="section-title">Recent Searches</span>
      <a-button type="text" size="small" @click="handleClear" class="clear-btn">
        Clear
      </a-button>
    </div>
    
    <div class="searches-list">
      <div
        v-for="(search, index) in searches"
        :key="search.id"
        :class="['search-item', { 'selected': selectedIndex === index }]"
        @click="handleSelect(search)"
        @keydown.enter="handleSelect(search)"
        @keydown.space.prevent="handleSelect(search)"
        tabindex="0"
        role="button"
        :aria-label="`Select ${search.name}`"
      >
        <div class="search-avatar">
          <a-avatar :src="search.avatar" :size="36" :style="{ backgroundColor: getAvatarColor(search.id) }">
            {{ getUserInitials(search.name) }}
          </a-avatar>
          <div v-if="search.isOnline" class="online-indicator"></div>
        </div>
        
        <div class="search-info">
          <div class="search-name">
            {{ search.name }}
            <a-tag v-if="search.isContact" color="blue" size="small">Contact</a-tag>
          </div>
          <div class="search-username">@{{ search.username }}</div>
        </div>
        
        <div class="search-actions">
          <ClockCircleOutlined class="recent-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import { getUserInitials, getAvatarColor } from '../utils/userHelpers.js'

const props = defineProps({
  searches: {
    type: Array,
    default: () => []
  },
  selectedIndex: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['select', 'clear'])

const handleSelect = (search) => {
  emit('select', search)
}

const handleClear = () => {
  emit('clear')
}
</script>

<style scoped>
.recent-searches {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-btn {
  font-size: 12px;
  color: #1890ff;
  padding: 0;
  height: auto;
}

.clear-btn:hover {
  color: #40a9ff;
}

.searches-list {
  max-height: 200px;
  overflow-y: auto;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 8px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f5f5f5;
}

.search-item:focus,
.search-item.selected {
  outline: 2px solid #1890ff;
  outline-offset: -2px;
  background-color: #e6f7ff;
}

.search-avatar {
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

.search-info {
  flex: 1;
  min-width: 0;
}

.search-name {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-username {
  color: #8c8c8c;
  font-size: 12px;
}

.search-actions {
  flex-shrink: 0;
}

.recent-icon {
  color: #bfbfbf;
  font-size: 14px;
}

/* Scrollbar styles */
.searches-list::-webkit-scrollbar {
  width: 6px;
}

.searches-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.searches-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.searches-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .section-header {
    padding: 0 16px 8px;
  }
  
  .search-item {
    padding: 10px 16px;
  }
  
  .search-avatar {
    margin-right: 10px;
  }
  
  .search-name {
    font-size: 15px;
  }
  
  .search-username {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .section-header {
    padding: 0 12px 6px;
  }
  
  .search-item {
    padding: 8px 12px;
  }
  
  .search-avatar {
    margin-right: 8px;
  }
  
  .search-name {
    font-size: 14px;
  }
  
  .search-username {
    font-size: 11px;
  }
}
</style>