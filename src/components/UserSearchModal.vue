<template>
  <a-modal
    v-model:open="visible"
    title="New Chat"
    :width="modalWidth"
    :footer="null"
    class="user-search-modal"
    @cancel="handleClose"
    :centered="isMobile"
    :mask-closable="!isMobile"
  >
    <ErrorBoundary fallback-message="Failed to load search interface">
      <div class="search-container">
      <!-- Search Input -->
      <UserSearchInput
        v-model:value="searchQuery"
        @search="handleSearch"
        @clear="handleClearSearch"
        placeholder="Search users by name or username..."
      />
      
      <!-- Recent Searches (when no query) -->
      <RecentSearches
        v-if="!searchQuery && hasRecentSearches"
        :searches="recentSearches"
        :selected-index="selectedIndex"
        @select="handleSelectFromRecent"
        @clear="handleClearSearchHistory"
      />
      
      <!-- Suggested Contacts (when no query) -->
      <SuggestedContacts
        v-if="!searchQuery && hasSuggestedContacts"
        :contacts="suggestedContacts"
        :selected-index="selectedIndex"
        @select="handleSelectUser"
      />
      
      <!-- Search Results -->
      <UserSearchResults
        v-if="searchQuery"
        :results="searchResults"
        :loading="isSearching"
        :search-query="searchQuery"
        :total-results="totalResults"
        :can-load-more="canLoadMore"
        :selected-index="selectedIndex"
        :has-error="hasError"
        :error-message="errorMessage"
        :can-retry="canRetry"
        :retry-count="retryCount"
        :max-retries="maxRetries"
        @select="handleSelectUser"
        @preview="handleShowUserPreview"
        @load-more="handleLoadMore"
        @retry="handleRetrySearch"
        @dismiss-error="handleDismissError"
      />
      
      <!-- User Profile Preview -->
      <UserProfilePreview
        v-if="previewUser"
        :user="previewUser"
        @close="handleClosePreview"
        @start-chat="handleStartChatWithUser"
        @add-contact="handleAddToContacts"
        @remove-contact="handleRemoveFromContacts"
      />
      </div>
    </ErrorBoundary>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUserSearchStore } from '../store/userSearch.js'
import { useChatCreation } from '../composables/useChatCreation.js'
import { useContacts } from '../composables/useContacts.js'
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation.js'
import UserSearchInput from './UserSearchInput.vue'
import UserSearchResults from './UserSearchResults.vue'
import UserProfilePreview from './UserProfilePreview.vue'
import RecentSearches from './RecentSearches.vue'
import SuggestedContacts from './SuggestedContacts.vue'
import ErrorBoundary from './ErrorBoundary.vue'

const userSearchStore = useUserSearchStore()
const { createOrOpenChat } = useChatCreation()
const { addContact, removeContact, isContact } = useContacts()

// Local state
const previewUser = ref(null)

// Keyboard navigation
const navigationItems = computed(() => {
  if (searchQuery.value) {
    return searchResults.value
  } else if (hasRecentSearches.value) {
    return recentSearches.value
  } else if (hasSuggestedContacts.value) {
    return suggestedContacts.value
  }
  return []
})

const {
  selectedIndex,
  bindKeyboard,
  unbindKeyboard,
  reset: resetNavigation
} = useKeyboardNavigation(navigationItems, {
  onSelect: (item) => {
    handleSelectUser(item)
  },
  onEscape: () => {
    if (previewUser.value) {
      handleClosePreview()
    } else {
      handleClose()
    }
  }
})

// Computed properties from store
const visible = computed({
  get: () => userSearchStore.isModalOpen,
  set: (value) => {
    if (!value) {
      userSearchStore.closeSearchModal()
    }
  }
})

const searchQuery = computed({
  get: () => userSearchStore.searchQuery,
  set: (value) => {
    userSearchStore.searchQuery = value
  }
})

const searchResults = computed(() => userSearchStore.searchResults)
const recentSearches = computed(() => userSearchStore.recentSearches)
const suggestedContacts = computed(() => userSearchStore.suggestedContacts)
const isSearching = computed(() => userSearchStore.isLoading)
const hasRecentSearches = computed(() => userSearchStore.hasRecentSearches)
const hasSuggestedContacts = computed(() => userSearchStore.hasSuggestedContacts)
const totalResults = computed(() => userSearchStore.totalResults)
const canLoadMore = computed(() => userSearchStore.canLoadMore)
const hasError = computed(() => userSearchStore.hasError)
const errorMessage = computed(() => userSearchStore.error)
const canRetry = computed(() => userSearchStore.canRetry)
const retryCount = computed(() => userSearchStore.retryCount)
const maxRetries = computed(() => userSearchStore.maxRetries)

// Responsive design
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768
  }
  return false
})

const modalWidth = computed(() => {
  if (isMobile.value) {
    return '95vw'
  }
  return '500px'
})

// Event handlers
const handleSearch = (query) => {
  userSearchStore.debouncedSearch(query)
}

const handleClearSearch = () => {
  userSearchStore.clearSearch()
}

const handleSelectUser = async (user) => {
  try {
    await createOrOpenChat(user.id)
    userSearchStore.addToRecentSearches(user)
    userSearchStore.closeSearchModal()
  } catch (error) {
    console.error('Failed to create chat:', error)
    // Could show error message to user here
  }
}

const handleSelectFromRecent = (user) => {
  handleSelectUser(user)
}

const handleShowUserPreview = (user) => {
  previewUser.value = user
}

const handleClosePreview = () => {
  previewUser.value = null
}

const handleStartChatWithUser = async (user) => {
  await handleSelectUser(user)
  previewUser.value = null
}

const handleAddToContacts = async (user) => {
  try {
    await addContact(user.id)
    // Update user's contact status in search results
    const userInResults = searchResults.value.find(u => u.id === user.id)
    if (userInResults) {
      userInResults.isContact = true
    }
    // Update preview user if it's the same user
    if (previewUser.value && previewUser.value.id === user.id) {
      previewUser.value.isContact = true
    }
    // Could show success message here
  } catch (error) {
    console.error('Failed to add contact:', error)
    // Could show error message here
  }
}

const handleRemoveFromContacts = async (user) => {
  try {
    await removeContact(user.id)
    // Update user's contact status in search results
    const userInResults = searchResults.value.find(u => u.id === user.id)
    if (userInResults) {
      userInResults.isContact = false
    }
    // Update preview user if it's the same user
    if (previewUser.value && previewUser.value.id === user.id) {
      previewUser.value.isContact = false
    }
    // Could show success message here
  } catch (error) {
    console.error('Failed to remove contact:', error)
    // Could show error message here
  }
}

const handleClearSearchHistory = () => {
  userSearchStore.clearSearchHistory()
}

const handleLoadMore = () => {
  userSearchStore.loadMoreResults()
}

const handleRetrySearch = () => {
  userSearchStore.retrySearch()
}

const handleDismissError = () => {
  userSearchStore.clearError()
}

const handleClose = () => {
  userSearchStore.closeSearchModal()
  previewUser.value = null
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery && newQuery.trim().length >= 2) {
    handleSearch(newQuery)
  } else if (!newQuery) {
    userSearchStore.clearSearch()
  }
  resetNavigation()
})

// Watch for modal visibility changes
watch(visible, (isVisible) => {
  if (isVisible) {
    bindKeyboard()
    resetNavigation()
  } else {
    unbindKeyboard()
  }
})

// Lifecycle hooks
onMounted(() => {
  userSearchStore.init()
})

onUnmounted(() => {
  unbindKeyboard()
})
</script>

<style scoped>
.user-search-modal {
  .search-container {
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
  }
}

:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.ant-modal-body) {
  padding: 0;
}

:deep(.ant-modal-close) {
  top: 16px;
  right: 16px;
}

/* Animations */
.search-container {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transition for content changes */
.search-container > * {
  transition: all 0.2s ease-in-out;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .user-search-modal {
    :deep(.ant-modal) {
      margin: 0;
      max-width: none;
      top: 0;
      padding-bottom: 0;
    }
    
    :deep(.ant-modal-content) {
      border-radius: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    :deep(.ant-modal-body) {
      flex: 1;
      overflow: hidden;
    }
    
    .search-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}

@media (max-width: 480px) {
  .user-search-modal {
    :deep(.ant-modal-header) {
      padding: 12px 16px;
    }
    
    :deep(.ant-modal-title) {
      font-size: 16px;
    }
  }
}
</style>