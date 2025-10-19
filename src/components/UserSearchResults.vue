<template>
  <div class="search-results">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <a-spin size="small" />
      <span class="loading-text">Searching users...</span>
    </div>
    
    <!-- Error state -->
    <SearchErrorState
      v-if="hasError"
      :error-message="errorMessage"
      :can-retry="canRetry"
      :is-retrying="loading"
      :retry-count="retryCount"
      :max-retries="maxRetries"
      @retry="handleRetry"
      @dismiss="handleDismissError"
    />
    
    <!-- No results state -->
    <div v-else-if="results.length === 0 && searchQuery && !loading" class="no-results">
      <UserOutlined class="no-results-icon" />
      <p class="no-results-title">No users found</p>
      <p class="no-results-subtitle">Try searching with a different name or username</p>
    </div>
    
    <!-- Results list -->
    <div v-else-if="results.length > 0" class="results-list" @scroll="handleScroll">
      <div class="results-header">
        <span class="results-count">{{ results.length }} user{{ results.length > 1 ? 's' : '' }} found</span>
        <span v-if="totalResults > results.length" class="total-count">
          of {{ totalResults }} total
        </span>
      </div>
      
      <div
        v-for="(user, index) in results"
        :key="user.id"
        :class="['user-result-item', { 'selected': selectedIndex === index }]"
        @click="handleSelectUser(user)"
        @keydown.enter="handleSelectUser(user)"
        @keydown.space.prevent="handleSelectUser(user)"
        tabindex="0"
        role="button"
        :aria-label="`Select ${user.name}`"
      >
        <div class="user-avatar">
          <a-avatar :src="user.avatar" :size="40" :style="{ backgroundColor: getAvatarColor(user.id) }">
            {{ getUserInitials(user.name) }}
          </a-avatar>
          <div v-if="user.isOnline" class="online-indicator" title="Online"></div>
        </div>
        
        <div class="user-info">
          <div class="user-name">
            <span v-html="highlightSearchTerm(user.name, searchQuery)"></span>
            <ContactIndicator 
              v-if="user.isContact"
              :is-contact="true"
              :show-icon="false"
              size="small"
            />
          </div>
          <div class="user-username">
            @<span v-html="highlightSearchTerm(user.username, searchQuery)"></span>
          </div>
          <MutualContactsInfo
            v-if="user.mutualContacts > 0 || user.mutualGroups > 0"
            :mutual-contacts="user.mutualContacts"
            :mutual-groups="user.mutualGroups"
            class="mutual-info"
          />
          <div v-if="user.bio" class="user-bio">
            {{ truncateText(user.bio, 60) }}
          </div>
        </div>
        
        <div class="user-actions">
          <a-tooltip title="View profile">
            <a-button
              type="text"
              size="small"
              @click.stop="handlePreviewUser(user)"
              class="preview-btn"
            >
              <InfoCircleOutlined />
            </a-button>
          </a-tooltip>
          
          <UserStatusIndicator
            :is-online="user.isOnline"
            :last-seen="user.lastSeen"
            :show-text="true"
            size="small"
            class="user-status"
          />
        </div>
      </div>
      
      <!-- Load more indicator -->
      <div v-if="canLoadMore" class="load-more-container">
        <a-button @click="handleLoadMore" :loading="loading" type="text">
          Load More Results
        </a-button>
      </div>
      
      <!-- Loading more indicator -->
      <div v-if="loading && results.length > 0" class="loading-more">
        <a-spin size="small" />
        <span>Loading more users...</span>
      </div>
    </div>
    
    <!-- Empty state when no search query -->
    <div v-else class="empty-state">
      <SearchOutlined class="empty-icon" />
      <p class="empty-text">Start typing to search for users</p>
    </div>
  </div>
</template>

<script setup>
import { UserOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { getUserInitials, getAvatarColor, highlightSearchTerm } from '../utils/userHelpers.js'
import UserStatusIndicator from './UserStatusIndicator.vue'
import MutualContactsInfo from './MutualContactsInfo.vue'
import ContactIndicator from './ContactIndicator.vue'
import SearchErrorState from './SearchErrorState.vue'

const props = defineProps({
  results: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  },
  totalResults: {
    type: Number,
    default: 0
  },
  canLoadMore: {
    type: Boolean,
    default: false
  },
  selectedIndex: {
    type: Number,
    default: -1
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  canRetry: {
    type: Boolean,
    default: false
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['select', 'preview', 'load-more', 'retry', 'dismiss-error'])

// Event handlers
const handleSelectUser = (user) => {
  emit('select', user)
}

const handlePreviewUser = (user) => {
  emit('preview', user)
}

// Event handlers for load more
const handleLoadMore = () => {
  emit('load-more')
}

const handleRetry = () => {
  emit('retry')
}

const handleDismissError = () => {
  emit('dismiss-error')
}

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  
  // Load more when scrolled to bottom
  if (scrollTop + clientHeight >= scrollHeight - 10 && props.canLoadMore && !props.loading) {
    handleLoadMore()
  }
}

// Utility functions
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.search-results {
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8c8c8c;
  animation: fadeIn 0.3s ease-in-out;
}

.loading-text {
  margin-top: 8px;
  font-size: 14px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  animation: fadeIn 0.4s ease-in-out;
}

.no-results-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.no-results-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 8px 0;
}

.no-results-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  animation: fadeIn 0.4s ease-in-out;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.results-header {
  padding: 12px 24px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.results-count {
  font-size: 12px;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-count {
  font-size: 11px;
  color: #bfbfbf;
  margin-left: 8px;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.user-result-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-bottom: 1px solid #f5f5f5;
  animation: slideInLeft 0.3s ease-out;
  animation-fill-mode: both;
}

.user-result-item:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-result-item:focus,
.user-result-item.selected {
  outline: 2px solid #1890ff;
  outline-offset: -2px;
  background-color: #e6f7ff;
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.user-result-item:last-child {
  border-bottom: none;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: #52c41a;
  border: 2px solid white;
  border-radius: 50%;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-username {
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 4px;
}

.mutual-info {
  margin-bottom: 4px;
}

.user-bio {
  color: #595959;
  font-size: 12px;
  line-height: 1.4;
}

.user-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.preview-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.user-result-item:hover .preview-btn {
  opacity: 1;
}

.user-status {
  text-align: right;
}

/* Highlight styles */
:deep(mark) {
  background-color: #fff2e8;
  color: #fa541c;
  padding: 0 2px;
  border-radius: 2px;
}

/* Scrollbar styles */
.results-list::-webkit-scrollbar {
  width: 6px;
}

.results-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.results-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.results-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Load more styles */
.load-more-container {
  padding: 16px 24px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  color: #8c8c8c;
  font-size: 14px;
  animation: fadeIn 0.3s ease-in-out;
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Stagger animation for multiple items */
.user-result-item:nth-child(1) { animation-delay: 0ms; }
.user-result-item:nth-child(2) { animation-delay: 50ms; }
.user-result-item:nth-child(3) { animation-delay: 100ms; }
.user-result-item:nth-child(4) { animation-delay: 150ms; }
.user-result-item:nth-child(5) { animation-delay: 200ms; }
.user-result-item:nth-child(n+6) { animation-delay: 250ms; }

/* Mobile responsive styles */
@media (max-width: 768px) {
  .results-header {
    padding: 8px 16px;
  }
  
  .user-result-item {
    padding: 12px 16px;
  }
  
  .user-avatar {
    margin-right: 10px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .user-username {
    font-size: 13px;
  }
  
  .user-bio {
    font-size: 12px;
  }
  
  .load-more-container {
    padding: 12px 16px;
  }
  
  .loading-more {
    padding: 12px 16px;
  }
  
  .preview-btn {
    opacity: 1; /* Always show on mobile */
  }
}

@media (max-width: 480px) {
  .user-result-item {
    padding: 10px 12px;
  }
  
  .user-avatar {
    margin-right: 8px;
  }
  
  .user-info {
    min-width: 0;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-username {
    font-size: 12px;
  }
  
  .mutual-info {
    font-size: 10px;
  }
  
  .user-bio {
    display: none; /* Hide bio on very small screens */
  }
  
  .user-actions {
    flex-direction: column;
    gap: 2px;
  }
}
</style>