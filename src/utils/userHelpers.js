/**
 * Format last seen time to human readable format
 * @param {string} lastSeen - ISO date string
 * @returns {string} - Formatted time string
 */
export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Never'
  
  const date = new Date(lastSeen)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString()
}

/**
 * Generate user initials from name
 * @param {string} name - User's full name
 * @returns {string} - User initials (max 2 characters)
 */
export function getUserInitials(name) {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate a random avatar color based on user ID
 * @param {string} userId - User ID
 * @returns {string} - Hex color code
 */
export function getAvatarColor(userId) {
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb'
  ]
  
  if (!userId) return colors[0]
  
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Validate user search query
 * @param {string} query - Search query
 * @returns {object} - Validation result
 */
export function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query is required' }
  }
  
  const trimmed = query.trim()
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Search query cannot be empty' }
  }
  
  if (trimmed.length < 1) {
    return { isValid: false, error: 'Search query must be at least 1 character long' }
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Search query is too long (maximum 100 characters)' }
  }
  
  // Check for potentially harmful characters
  const dangerousChars = /[<>\"'&\x00-\x1f\x7f-\x9f]/
  if (dangerousChars.test(trimmed)) {
    return { isValid: false, error: 'Search query contains invalid characters' }
  }
  
  // Check for only whitespace or special characters
  const validContentRegex = /[a-zA-Z0-9\u00C0-\u017F\u4e00-\u9fff]/
  if (!validContentRegex.test(trimmed)) {
    return { isValid: false, error: 'Search query must contain letters or numbers' }
  }
  
  // Check for SQL injection patterns (basic protection)
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i
  if (sqlPatterns.test(trimmed)) {
    return { isValid: false, error: 'Invalid search query format' }
  }
  
  return { isValid: true, query: trimmed }
}

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Term to highlight
 * @returns {string} - HTML string with highlighted terms
 */
export function highlightSearchTerm(text, searchTerm) {
  if (!text || !searchTerm) return text
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Sort users by relevance for search results
 * @param {Array} users - Array of users
 * @param {string} searchTerm - Search term
 * @returns {Array} - Sorted users
 */
export function sortUsersByRelevance(users, searchTerm) {
  if (!searchTerm) return users
  
  const term = searchTerm.toLowerCase()
  
  return users.sort((a, b) => {
    // Exact name match gets highest priority
    if (a.name.toLowerCase() === term) return -1
    if (b.name.toLowerCase() === term) return 1
    
    // Name starts with search term
    if (a.name.toLowerCase().startsWith(term) && !b.name.toLowerCase().startsWith(term)) return -1
    if (b.name.toLowerCase().startsWith(term) && !a.name.toLowerCase().startsWith(term)) return 1
    
    // Username exact match
    if (a.username.toLowerCase() === term) return -1
    if (b.username.toLowerCase() === term) return 1
    
    // Username starts with search term
    if (a.username.toLowerCase().startsWith(term) && !b.username.toLowerCase().startsWith(term)) return -1
    if (b.username.toLowerCase().startsWith(term) && !a.username.toLowerCase().startsWith(term)) return 1
    
    // Contacts get priority
    if (a.isContact && !b.isContact) return -1
    if (b.isContact && !a.isContact) return 1
    
    // Online users get priority
    if (a.isOnline && !b.isOnline) return -1
    if (b.isOnline && !a.isOnline) return 1
    
    // More mutual contacts get priority
    const aMutual = a.mutualContacts || 0
    const bMutual = b.mutualContacts || 0
    if (aMutual !== bMutual) return bMutual - aMutual
    
    // Alphabetical by name as final sort
    return a.name.localeCompare(b.name)
  })
}