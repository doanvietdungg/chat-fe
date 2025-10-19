# Design Document

## Overview

This design document outlines the implementation of user search and new chat creation functionality. The feature allows users to discover and connect with other users in the system, creating new conversations beyond existing chats. The design focuses on intuitive search experience with real-time results and seamless chat creation.

## Architecture

### Component Structure
```
User Search Components:
├── UserSearchModal.vue (Main search interface)
├── UserSearchInput.vue (Search input with suggestions)
├── UserSearchResults.vue (Search results display)
├── UserProfilePreview.vue (User profile popup)
├── NewChatButton.vue (Trigger for search modal)
├── RecentSearches.vue (Search history display)
├── SuggestedContacts.vue (Contact suggestions)
└── ContactManager.vue (Contact management)
```

### State Management
```javascript
// New stores for user search
stores/
├── userSearch.js (Search functionality and results)
├── contacts.js (Contact management)
├── users.js (User data and profiles)
└── chatCreation.js (New chat creation logic)
```

## Components and Interfaces

### 1. UserSearchModal.vue
```vue
<template>
  <a-modal
    v-model:open="visible"
    title="New Chat"
    width="500px"
    :footer="null"
    class="user-search-modal"
  >
    <div class="search-container">
      <!-- Search Input -->
      <UserSearchInput
        v-model:value="searchQuery"
        @search="performSearch"
        @clear="clearSearch"
        placeholder="Search users by name or username..."
      />
      
      <!-- Recent Searches (when no query) -->
      <RecentSearches
        v-if="!searchQuery && recentSearches.length"
        :searches="recentSearches"
        @select="selectFromRecent"
        @clear="clearSearchHistory"
      />
      
      <!-- Suggested Contacts (when no query) -->
      <SuggestedContacts
        v-if="!searchQuery && suggestedContacts.length"
        :contacts="suggestedContacts"
        @select="selectUser"
      />
      
      <!-- Search Results -->
      <UserSearchResults
        v-if="searchQuery"
        :results="searchResults"
        :loading="isSearching"
        @select="selectUser"
        @preview="showUserPreview"
      />
      
      <!-- User Profile Preview -->
      <UserProfilePreview
        v-if="previewUser"
        :user="previewUser"
        @close="closePreview"
        @start-chat="startChatWithUser"
        @add-contact="addToContacts"
      />
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserSearchStore } from '@/stores/userSearch'
import { useChatCreationStore } from '@/stores/chatCreation'

const userSearchStore = useUserSearchStore()
const chatCreationStore = useChatCreationStore()

const visible = ref(false)
const searchQuery = ref('')
const previewUser = ref(null)

const searchResults = computed(() => userSearchStore.searchResults)
const recentSearches = computed(() => userSearchStore.recentSearches)
const suggestedContacts = computed(() => userSearchStore.suggestedContacts)
const isSearching = computed(() => userSearchStore.isLoading)

// Debounced search
const performSearch = debounce(async (query) => {
  if (query.trim()) {
    await userSearchStore.searchUsers(query)
  }
}, 300)

const selectUser = async (user) => {
  await chatCreationStore.createOrOpenChat(user.id)
  userSearchStore.addToRecentSearches(user)
  visible.value = false
}

const startChatWithUser = async (user) => {
  await selectUser(user)
  previewUser.value = null
}
</script>
```

### 2. UserSearchResults.vue
```vue
<template>
  <div class="search-results">
    <div v-if="loading" class="loading-state">
      <a-spin size="small" />
      <span>Searching users...</span>
    </div>
    
    <div v-else-if="results.length === 0 && searchQuery" class="no-results">
      <UserOutlined class="no-results-icon" />
      <p>No users found</p>
      <p class="no-results-subtitle">Try searching with a different name or username</p>
    </div>
    
    <div v-else class="results-list">
      <div
        v-for="user in results"
        :key="user.id"
        class="user-result-item"
        @click="$emit('select', user)"
      >
        <div class="user-avatar">
          <a-avatar :src="user.avatar" :size="40">
            {{ user.name[0] }}
          </a-avatar>
          <div v-if="user.isOnline" class="online-indicator"></div>
        </div>
        
        <div class="user-info">
          <div class="user-name">
            {{ user.name }}
            <a-tag v-if="user.isContact" color="blue" size="small">Contact</a-tag>
          </div>
          <div class="user-username">@{{ user.username }}</div>
          <div v-if="user.mutualContacts" class="mutual-info">
            {{ user.mutualContacts }} mutual contacts
          </div>
        </div>
        
        <div class="user-actions">
          <a-button
            type="text"
            size="small"
            @click.stop="$emit('preview', user)"
          >
            <InfoCircleOutlined />
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-result-item:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
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
}

.user-name {
  font-weight: 500;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-username {
  color: #666;
  font-size: 14px;
}

.mutual-info {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}
</style>
```

### 3. UserProfilePreview.vue
```vue
<template>
  <div class="user-profile-preview">
    <div class="profile-header">
      <a-button
        type="text"
        size="small"
        @click="$emit('close')"
        class="close-btn"
      >
        <ArrowLeftOutlined />
      </a-button>
      <span>User Profile</span>
    </div>
    
    <div class="profile-content">
      <div class="profile-avatar">
        <a-avatar :src="user.avatar" :size="80">
          {{ user.name[0] }}
        </a-avatar>
        <div v-if="user.isOnline" class="online-status">
          <div class="online-dot"></div>
          <span>Online</span>
        </div>
        <div v-else class="offline-status">
          <span>Last seen {{ formatLastSeen(user.lastSeen) }}</span>
        </div>
      </div>
      
      <div class="profile-info">
        <h3>{{ user.name }}</h3>
        <p class="username">@{{ user.username }}</p>
        <p v-if="user.bio" class="bio">{{ user.bio }}</p>
        
        <div v-if="user.mutualContacts" class="mutual-contacts">
          <UsergroupAddOutlined />
          <span>{{ user.mutualContacts }} mutual contacts</span>
        </div>
      </div>
      
      <div class="profile-actions">
        <a-button
          type="primary"
          size="large"
          @click="$emit('start-chat', user)"
          block
        >
          <MessageOutlined />
          Start Chat
        </a-button>
        
        <a-button
          v-if="!user.isContact"
          @click="$emit('add-contact', user)"
          block
          class="add-contact-btn"
        >
          <UserAddOutlined />
          Add to Contacts
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
}

.profile-content {
  padding: 24px;
  text-align: center;
}

.profile-avatar {
  margin-bottom: 16px;
}

.online-status, .offline-status {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.online-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #52c41a;
  border-radius: 50%;
  margin-right: 4px;
}

.profile-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
```

### 4. NewChatButton.vue
```vue
<template>
  <a-button
    type="primary"
    @click="openUserSearch"
    class="new-chat-button"
  >
    <PlusOutlined />
    New Chat
  </a-button>
</template>

<script setup>
import { useUserSearchStore } from '@/stores/userSearch'

const userSearchStore = useUserSearchStore()

const openUserSearch = () => {
  userSearchStore.openSearchModal()
}
</script>
```

## Data Models

### User Model
```typescript
interface User {
  id: string
  name: string
  username: string
  email?: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen?: string
  isContact: boolean
  mutualContacts?: number
  mutualGroups?: number
}
```

### Search State Model
```typescript
interface UserSearchState {
  searchQuery: string
  searchResults: User[]
  recentSearches: User[]
  suggestedContacts: User[]
  isLoading: boolean
  isModalOpen: boolean
  selectedUser: User | null
}
```

### Contact Model
```typescript
interface Contact {
  id: string
  userId: string
  contactUserId: string
  addedAt: string
  label?: string
  isFavorite: boolean
}
```

## Store Implementation

### userSearch.js
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserSearchStore = defineStore('userSearch', () => {
  const searchQuery = ref('')
  const searchResults = ref([])
  const recentSearches = ref([])
  const suggestedContacts = ref([])
  const isLoading = ref(false)
  const isModalOpen = ref(false)

  // Mock API calls - replace with real API
  const searchUsers = async (query) => {
    isLoading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock search results
      searchResults.value = mockUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      )
    } finally {
      isLoading.value = false
    }
  }

  const addToRecentSearches = (user) => {
    const existing = recentSearches.value.findIndex(u => u.id === user.id)
    if (existing !== -1) {
      recentSearches.value.splice(existing, 1)
    }
    recentSearches.value.unshift(user)
    recentSearches.value = recentSearches.value.slice(0, 10)
    
    // Save to localStorage
    localStorage.setItem('recentUserSearches', JSON.stringify(recentSearches.value))
  }

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentUserSearches')
    if (saved) {
      recentSearches.value = JSON.parse(saved)
    }
  }

  const clearSearchHistory = () => {
    recentSearches.value = []
    localStorage.removeItem('recentUserSearches')
  }

  const openSearchModal = () => {
    isModalOpen.value = true
    loadSuggestedContacts()
  }

  const closeSearchModal = () => {
    isModalOpen.value = false
    searchQuery.value = ''
    searchResults.value = []
  }

  return {
    searchQuery,
    searchResults,
    recentSearches,
    suggestedContacts,
    isLoading,
    isModalOpen,
    searchUsers,
    addToRecentSearches,
    loadRecentSearches,
    clearSearchHistory,
    openSearchModal,
    closeSearchModal
  }
})
```

## Error Handling

### Search Failures
- Network error handling with retry options
- Empty state messaging for no results
- Loading state management
- Graceful degradation for offline mode

### User Feedback
- Real-time search feedback
- Loading indicators during search
- Success messages for contact additions
- Error messages for failed operations

## Performance Considerations

### Search Optimization
- Debounced search queries (300ms)
- Result caching for recent queries
- Pagination for large result sets
- Efficient filtering and sorting

### Memory Management
- Cleanup of search results on modal close
- Limited recent search history (10 items)
- Lazy loading of user avatars
- Efficient state updates

## Accessibility

### WCAG Compliance
- Keyboard navigation for search results
- Screen reader support for user information
- High contrast mode compatibility
- Focus management in modal
- Proper ARIA labels and roles

## Testing Strategy

### Component Testing
- Search input functionality
- Result display and interaction
- User profile preview
- Contact management operations

### Integration Testing
- Search to chat creation flow
- Contact addition workflow
- Recent searches persistence
- Modal state management