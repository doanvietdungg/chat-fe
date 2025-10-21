<template>
  <a-modal
    v-model:open="visible"
    title="Search Users"
    :footer="null"
    width="500px"
    class="user-search-modal"
  >
    <div class="search-container">
      <!-- Search Input -->
      <a-input 
        v-model:value="searchQuery"
        placeholder="Search users by name or username..."
        size="large"
        class="search-input"
        @input="handleSearch"
        @pressEnter="forceSearch"
      >
        <template #prefix>
          <SearchOutlined class="search-icon" />
        </template>
      </a-input>
      
      <!-- Recent Searches (when no query) -->
      <div v-if="!searchQuery && recentSearches.length > 0" class="recent-section">
        <div class="section-header">
          <span class="section-title">Recent Searches</span>
          <a-button type="text" size="small" @click="clearRecentSearches" class="clear-btn">
            Clear
          </a-button>
        </div>
        <div class="results-list">
          <div
            v-for="user in recentSearches"
            :key="user.id"
            class="user-result-item"
            @click="handleSelectUser(user)"
          >
            <a-avatar :size="36" :style="{ backgroundColor: getAvatarColor(user.id) }">
              {{ getUserInitials(user.name) }}
            </a-avatar>
            
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-username">@{{ user.username }}</div>
            </div>
            
            <ClockCircleOutlined class="recent-icon" />
          </div>
        </div>
      </div>
      
      <!-- Suggested Contacts (when no query) -->
      <div v-if="!searchQuery && suggestedContacts.length > 0" class="suggested-section">
        <div class="section-header">
          <span class="section-title">Suggested Contacts</span>
        </div>
        <div class="results-list">
          <div
            v-for="user in suggestedContacts"
            :key="user.id"
            class="user-result-item"
            @click="handleSelectUser(user)"
          >
            <a-avatar :size="36" :style="{ backgroundColor: getAvatarColor(user.id) }">
              {{ getUserInitials(user.name) }}
            </a-avatar>
            
            <div class="user-info">
              <div class="user-name">
                {{ user.name }}
                <a-tag v-if="user.isContact" color="blue" size="small">Contact</a-tag>
              </div>
              <div class="user-username">@{{ user.username }}</div>
              <div v-if="user.mutualContacts > 0" class="mutual-info">
                {{ user.mutualContacts }} mutual contact{{ user.mutualContacts > 1 ? 's' : '' }}
              </div>
            </div>
            
            <div class="user-status">
              <div v-if="user.isOnline" class="status-online">Online</div>
              <div v-else class="status-offline">Offline</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchQuery" class="search-results">
        <div v-if="isSearching" class="loading-state">
          <a-spin size="small" />
          <span>Searching users...</span>
        </div>
        
        <div v-else-if="searchResults.length === 0" class="no-results">
          <UserOutlined class="no-results-icon" />
          <p>No users found</p>
          <p class="no-results-subtitle">Try searching with a different name</p>
        </div>
        
        <div v-else class="results-list">
          <div class="results-header">
            <span class="results-count">{{ searchResults.length }} user{{ searchResults.length > 1 ? 's' : '' }} found</span>
          </div>
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="user-result-item"
            @click="handleSelectUser(user)"
          >
            <a-avatar :size="40" :style="{ backgroundColor: getAvatarColor(user.id) }">
              {{ getUserInitials(user.name) }}
            </a-avatar>
            
            <div class="user-info">
              <div class="user-name">
                {{ user.name }}
                <a-tag v-if="user.isContact" color="blue" size="small">Contact</a-tag>
              </div>
              <div class="user-username">@{{ user.username }}</div>
              <div v-if="user.mutualContacts > 0" class="mutual-info">
                {{ user.mutualContacts }} mutual contact{{ user.mutualContacts > 1 ? 's' : '' }}
              </div>
            </div>
            
            <div class="user-status">
              <div v-if="user.isOnline" class="status-online">Online</div>
              <div v-else class="status-offline">Offline</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!searchQuery && recentSearches.length === 0 && suggestedContacts.length === 0" class="empty-state">
        <SearchOutlined class="empty-icon" />
        <p>Start typing to search for users</p>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SearchOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import { useUserSearchStore } from '../store/userSearch.js'
import { useChatCreation } from '../composables/useChatCreation.js'

const userSearchStore = useUserSearchStore()
const { startDraft } = useChatCreation()

const searchQuery = ref('')
const isSearching = computed(() => userSearchStore.isLoading)

const visible = computed({
  get: () => userSearchStore.isModalOpen,
  set: (value) => {
    if (!value) {
      userSearchStore.closeSearchModal()
      searchQuery.value = ''
    }
  }
})

const searchResults = computed(() => userSearchStore.searchResults)
const recentSearches = computed(() => userSearchStore.recentSearches)
const suggestedContacts = computed(() => userSearchStore.suggestedContacts)

// Ensure data is loaded when modal opens
watch(() => visible.value, (isOpen) => {
  if (isOpen) {
    // Ensure store is initialized and data is loaded
    try { userSearchStore.init() } catch (_) {}
    userSearchStore.loadRecentSearches()
    userSearchStore.loadSuggestedContacts()
  }
})

// Trigger debounced search when model changes
watch(searchQuery, (q) => {
  const query = (q || '').trim()
  if (query.length >= 2) {
    userSearchStore.debouncedSearch(query)
  }
})

// Search function (debounced in store)
const handleSearch = async (e) => {
  const query = e.target.value
  searchQuery.value = query
  
  if (query && query.trim().length >= 2) {
    userSearchStore.debouncedSearch(query)
  }
}

const forceSearch = async () => {
  const query = (searchQuery.value || '').trim()
  if (query.length >= 2) {
    await userSearchStore.searchUsers(query, true)
  }
}

const handleSelectUser = async (user) => {
  try {
    startDraft(user)
    userSearchStore.addToRecentSearches(user)
    userSearchStore.closeSearchModal()
    searchQuery.value = ''
  } catch (error) {
    console.error('Failed to start draft chat:', error)
  }
}

const clearRecentSearches = () => {
  userSearchStore.clearSearchHistory()
}

// Utility functions
const getUserInitials = (name) => {
  if (!name) return '?'
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

const getAvatarColor = (userId) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
  if (!userId) return colors[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.search-container {
  padding: 0;
}

.search-input {
  margin-bottom: 16px;
  border-radius: 8px;
}

.search-icon {
  color: #bfbfbf;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #8c8c8c;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
}

.no-results-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.no-results-subtitle {
  color: #8c8c8c;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.results-list {
  border-radius: 8px;
  overflow: hidden;
}

.user-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.user-result-item:hover {
  background-color: #f5f5f5;
}

.user-result-item:last-child {
  border-bottom: none;
}

.user-info {
  flex: 1;
  margin-left: 12px;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
}

.user-username {
  color: #8c8c8c;
  font-size: 12px;
}

.user-status {
  text-align: right;
}

.status-online {
  color: #52c41a;
  font-size: 11px;
  font-weight: 500;
}

.status-offline {
  color: #8c8c8c;
  font-size: 11px;
}

/* Scrollbar */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

/* Recent and Suggested sections */
.recent-section,
.suggested-section {
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 8px 0;
  margin-bottom: 8px;
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

.recent-icon {
  color: #bfbfbf;
  font-size: 14px;
}

.results-header {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.results-count {
  font-size: 12px;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mutual-info {
  color: #1890ff;
  font-size: 11px;
  margin-top: 2px;
}
</style>