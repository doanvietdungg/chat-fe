import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { debounce } from '../utils/debounce.js'
import { validateSearchQuery, sortUsersByRelevance } from '../utils/userHelpers.js'
import { useUsersStore } from './users'
import { contactService } from '../services/contactService.js'

// Mock user data for development
const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alice_j',
    email: 'alice@example.com',
    avatar: null,
    bio: 'Software developer passionate about Vue.js',
    isOnline: true,
    lastSeen: null,
    isContact: false,
    mutualContacts: 3,
    mutualGroups: 1
  },
  {
    id: '2',
    name: 'Bob Smith',
    username: 'bob_smith',
    email: 'bob@example.com',
    avatar: null,
    bio: 'Designer and coffee enthusiast',
    isOnline: false,
    lastSeen: '2024-01-15T10:30:00Z',
    isContact: true,
    mutualContacts: 5,
    mutualGroups: 2
  },
  {
    id: '3',
    name: 'Carol Davis',
    username: 'carol_d',
    email: 'carol@example.com',
    avatar: null,
    bio: 'Product manager at tech startup',
    isOnline: true,
    lastSeen: null,
    isContact: false,
    mutualContacts: 1,
    mutualGroups: 0
  },
  {
    id: '4',
    name: 'David Wilson',
    username: 'david_w',
    email: 'david@example.com',
    avatar: null,
    bio: 'Full-stack developer and tech blogger',
    isOnline: false,
    lastSeen: '2024-01-14T15:45:00Z',
    isContact: true,
    mutualContacts: 2,
    mutualGroups: 1
  },
  {
    id: '5',
    name: 'Eva Martinez',
    username: 'eva_m',
    email: 'eva@example.com',
    avatar: null,
    bio: 'UX researcher and design systems advocate',
    isOnline: true,
    lastSeen: null,
    isContact: false,
    mutualContacts: 4,
    mutualGroups: 3
  }
]

export const useUserSearchStore = defineStore('userSearch', () => {
  // State
  const searchQuery = ref('')
  const searchResults = ref([])
  const recentSearches = ref([])
  const suggestedContacts = ref([])
  const isLoading = ref(false)
  const isModalOpen = ref(false)
  const selectedUser = ref(null)
  const searchCache = ref(new Map()) // Cache for search results
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalResults = ref(0)
  const hasMoreResults = ref(false)
  const error = ref(null)
  const retryCount = ref(0)
  const maxRetries = ref(3)
  const lastSearchTime = ref(0)
  const searchCooldown = ref(500) // 500ms between searches
  const searchHistory = ref([]) // Track search frequency

  // Computed
  const hasResults = computed(() => searchResults.value.length > 0)
  const hasRecentSearches = computed(() => recentSearches.value.length > 0)
  const hasSuggestedContacts = computed(() => suggestedContacts.value.length > 0)
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value))
  const canLoadMore = computed(() => hasMoreResults.value && currentPage.value < totalPages.value)
  const hasError = computed(() => error.value !== null)
  const canRetry = computed(() => retryCount.value < maxRetries.value)

  // Actions
  const searchUsers = async (query, isRetry = false) => {
    try { console.debug('[userSearch] searchUsers called:', { query, isRetry, currentPage: currentPage.value, pageSize: pageSize.value }) } catch (_) {}
    // Clear previous error if not a retry
    if (!isRetry) {
      error.value = null
      retryCount.value = 0
    }

    // Validate search query
    const validation = validateSearchQuery(query)
    if (!validation.isValid) {
      error.value = validation.error
      searchResults.value = []
      return
    }

    // Rate limiting check
    const now = Date.now()
    if (!isRetry && now - lastSearchTime.value < searchCooldown.value) {
      // Too frequent searches, ignore this request
      return
    }

    // Check for search abuse (more than 10 searches per minute)
    if (!isRetry) {
      const oneMinuteAgo = now - 60000
      searchHistory.value = searchHistory.value.filter(time => time > oneMinuteAgo)
      
      if (searchHistory.value.length >= 10) {
        error.value = 'Too many search requests. Please wait a moment before searching again.'
        return
      }
      
      searchHistory.value.push(now)
      lastSearchTime.value = now
    }

    const cacheKey = validation.query.toLowerCase()
    try { console.debug('[userSearch] validated query:', cacheKey) } catch (_) {}
    
    // Check cache first (skip cache on retry)
    if (!isRetry && searchCache.value.has(cacheKey)) {
      const cachedResult = searchCache.value.get(cacheKey)
      // Check if cache is still valid (5 minutes)
      if (Date.now() - cachedResult.timestamp < 5 * 60 * 1000) {
        searchResults.value = cachedResult.results
        error.value = null
        return
      } else {
        // Remove expired cache entry
        searchCache.value.delete(cacheKey)
      }
    }

    isLoading.value = true
    
    try {
      // Call backend contacts search with pagination
      const page = Math.max(0, (currentPage.value || 1) - 1)
      const size = pageSize.value || 20
      const apiRes = await contactService.getContacts({ q: validation.query, page, size })

      const outer = apiRes?.data || apiRes
      const dataNode = outer?.data || outer

      const content = dataNode?.content || []
      const mapped = content.map(item => ({
        id: item.contactUserId || item.id,
        name: item.displayName || item.name || item.username,
        username: item.username,
        email: item.email,
        avatar: item.avatarUrl || null,
        isOnline: (item.presenceStatus || '').toUpperCase() === 'ONLINE',
        lastSeen: item.lastSeenAt || null,
        isContact: true,
        mutualContacts: item.mutualContactsCount || 0,
        _raw: item
      }))

      // Optionally sort client-side by relevance if backend doesn't
      const sortedUsers = sortUsersByRelevance(mapped, validation.query)

      // Pagination indicators from backend
      totalResults.value = dataNode?.totalElements ?? sortedUsers.length
      const isLast = dataNode?.last
      hasMoreResults.value = typeof isLast === 'boolean' ? !isLast : (sortedUsers.length >= size)

      // Cache by query (cache current page snapshot)
      searchCache.value.set(cacheKey, {
        results: sortedUsers,
        timestamp: Date.now()
      })
      if (searchCache.value.size > 50) {
        const firstKey = searchCache.value.keys().next().value
        searchCache.value.delete(firstKey)
      }

      // Merge into store list
      if (currentPage.value === 1) {
        searchResults.value = sortedUsers
      } else {
        searchResults.value = [...searchResults.value, ...sortedUsers]
      }
      
      // Clear error on success
      error.value = null
      retryCount.value = 0
      
    } catch (err) {
      console.error('Search failed:', err)
      
      // Set error message
      if (err.message.includes('Network')) {
        error.value = 'Network error. Please check your connection and try again.'
      } else if (err.message.includes('timeout')) {
        error.value = 'Search timed out. Please try again.'
      } else {
        error.value = 'Search failed. Please try again later.'
      }
      
      // Don't clear results on error if we have existing results
      if (currentPage.value === 1) {
        searchResults.value = []
      }
      
    } finally {
      isLoading.value = false
    }
  }

  const addToRecentSearches = (user) => {
    // Remove if already exists
    const existingIndex = recentSearches.value.findIndex(u => u.id === user.id)
    if (existingIndex !== -1) {
      recentSearches.value.splice(existingIndex, 1)
    }
    
    // Add to beginning
    recentSearches.value.unshift(user)
    
    // Limit to 10 items
    recentSearches.value = recentSearches.value.slice(0, 10)
    
    // Save to localStorage
    try {
      localStorage.setItem('recentUserSearches', JSON.stringify(recentSearches.value))
    } catch (error) {
      console.error('Failed to save recent searches:', error)
    }
  }

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentUserSearches')
      if (saved) {
        recentSearches.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
      recentSearches.value = []
    }
  }

  const clearSearchHistory = () => {
    recentSearches.value = []
    try {
      localStorage.removeItem('recentUserSearches')
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  const loadSuggestedContacts = () => {
    // Mock suggested contacts - prioritize contacts and frequently contacted users
    suggestedContacts.value = mockUsers
      .filter(user => user.isContact || user.mutualContacts > 2)
      .sort((a, b) => {
        // Prioritize contacts first, then by mutual contacts
        if (a.isContact && !b.isContact) return -1
        if (!a.isContact && b.isContact) return 1
        return (b.mutualContacts || 0) - (a.mutualContacts || 0)
      })
      .slice(0, 5)
  }

  const openSearchModal = () => {
    isModalOpen.value = true
    loadRecentSearches()
    loadSuggestedContacts()
  }

  const closeSearchModal = () => {
    isModalOpen.value = false
    searchQuery.value = ''
    searchResults.value = []
    selectedUser.value = null
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    resetPagination()
    clearError()
  }

  const clearSearchCache = () => {
    searchCache.value.clear()
  }

  const loadMoreResults = async () => {
    if (!canLoadMore.value || isLoading.value) return
    
    currentPage.value += 1
    await searchUsers(searchQuery.value)
  }

  const resetPagination = () => {
    currentPage.value = 1
    totalResults.value = 0
    hasMoreResults.value = false
  }

  const setPageSize = (size) => {
    pageSize.value = size
    resetPagination()
  }

  const retrySearch = async () => {
    if (!canRetry.value || !searchQuery.value) return
    
    retryCount.value += 1
    await searchUsers(searchQuery.value, true)
  }

  const clearError = () => {
    error.value = null
    retryCount.value = 0
  }

  const setSelectedUser = (user) => {
    selectedUser.value = user
  }

  const clearSelectedUser = () => {
    selectedUser.value = null
  }

  // Create debounced search function
  const debouncedSearch = debounce((query) => {
    resetPagination()
    searchUsers(query)
  }, 300)

  // Initialize store
  const init = () => {
    // Add mock users to users store
    const usersStore = useUsersStore()
    if (usersStore) {
      usersStore.addUsers(mockUsers)
    }
    
    loadRecentSearches()
    loadSuggestedContacts()
  }

  return {
    // State
    searchQuery,
    searchResults,
    recentSearches,
    suggestedContacts,
    isLoading,
    isModalOpen,
    selectedUser,
    searchCache,
    currentPage,
    pageSize,
    totalResults,
    hasMoreResults,
    error,
    retryCount,
    maxRetries,
    
    // Computed
    hasResults,
    hasRecentSearches,
    hasSuggestedContacts,
    totalPages,
    canLoadMore,
    hasError,
    canRetry,
    
    // Actions
    searchUsers,
    debouncedSearch,
    addToRecentSearches,
    loadRecentSearches,
    clearSearchHistory,
    loadSuggestedContacts,
    openSearchModal,
    closeSearchModal,
    clearSearch,
    clearSearchCache,
    loadMoreResults,
    resetPagination,
    setPageSize,
    retrySearch,
    clearError,
    setSelectedUser,
    clearSelectedUser,
    init
  }
})