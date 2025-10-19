<template>
  <div class="user-search-input">
    <a-input-search
      v-model:value="inputValue"
      :placeholder="placeholder"
      size="large"
      :loading="loading"
      allow-clear
      @search="handleSearch"
      @input="handleInput"
      @clear="handleClear"
      @keydown="handleKeydown"
      class="search-input"
    >
      <template #prefix>
        <SearchOutlined class="search-icon" />
      </template>
    </a-input-search>
    
    <!-- Search suggestions dropdown -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <div class="suggestions-header">
        <span>Recent searches</span>
      </div>
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion.id"
        :class="['suggestion-item', { 'highlighted': highlightedIndex === index }]"
        @click="selectSuggestion(suggestion)"
        @mouseenter="highlightedIndex = index"
      >
        <a-avatar :src="suggestion.avatar" :size="32">
          {{ getUserInitials(suggestion.name) }}
        </a-avatar>
        <div class="suggestion-info">
          <div class="suggestion-name">{{ suggestion.name }}</div>
          <div class="suggestion-username">@{{ suggestion.username }}</div>
        </div>
        <ClockCircleOutlined class="suggestion-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import { getUserInitials } from '../utils/userHelpers.js'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search users...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  showSuggestions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:value', 'search', 'clear', 'select-suggestion'])

// Local state
const inputValue = ref(props.value)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// Computed
const suggestions = computed(() => {
  // Show recent searches as suggestions when input is focused but empty
  return props.suggestions.slice(0, 5)
})

// Watch for prop changes
watch(() => props.value, (newValue) => {
  inputValue.value = newValue
})

// Watch for input value changes
watch(inputValue, (newValue) => {
  emit('update:value', newValue)
})

// Event handlers
const handleInput = (e) => {
  let value = e.target.value
  
  // Basic input sanitization
  value = value.replace(/[<>\"'&\x00-\x1f\x7f-\x9f]/g, '')
  
  // Limit input length
  if (value.length > 100) {
    value = value.substring(0, 100)
  }
  
  inputValue.value = value
  
  // Show suggestions when input is empty and focused
  if (!value.trim() && suggestions.value.length > 0) {
    showSuggestions.value = true
    highlightedIndex.value = -1
  } else {
    showSuggestions.value = false
  }
  
  // Emit search for real-time search
  if (value.trim().length >= 2) {
    emit('search', value)
  }
}

const handleSearch = (value) => {
  if (value && value.trim().length >= 2) {
    emit('search', value)
    hideSuggestions()
  }
}

const handleClear = () => {
  inputValue.value = ''
  emit('clear')
  emit('update:value', '')
  hideSuggestions()
}

const handleKeydown = (e) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < suggestions.value.length) {
        selectSuggestion(suggestions.value[highlightedIndex.value])
      } else {
        handleSearch(inputValue.value)
      }
      break
    case 'Escape':
      hideSuggestions()
      break
  }
}

const selectSuggestion = (suggestion) => {
  inputValue.value = suggestion.name
  emit('update:value', suggestion.name)
  emit('select-suggestion', suggestion)
  hideSuggestions()
}

const showSuggestionsDropdown = () => {
  if (suggestions.value.length > 0 && !inputValue.value.trim()) {
    showSuggestions.value = true
    highlightedIndex.value = -1
  }
}

const hideSuggestions = () => {
  showSuggestions.value = false
  highlightedIndex.value = -1
}

// Focus and blur handlers
const handleFocus = () => {
  showSuggestionsDropdown()
}

const handleBlur = () => {
  // Delay hiding suggestions to allow click events
  setTimeout(() => {
    hideSuggestions()
  }, 200)
}

// Expose methods for parent component
defineExpose({
  focus: () => {
    nextTick(() => {
      const input = document.querySelector('.search-input input')
      if (input) input.focus()
    })
  },
  blur: () => {
    const input = document.querySelector('.search-input input')
    if (input) input.blur()
  }
})
</script>

<style scoped>
.user-search-input {
  position: relative;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.search-input {
  width: 100%;
  transition: all 0.2s ease-in-out;
}

.search-input:focus-within {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.search-icon {
  color: #bfbfbf;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 24px;
  right: 24px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-header {
  padding: 8px 12px;
  font-size: 12px;
  color: #8c8c8c;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background-color: #f5f5f5;
  transform: translateX(2px);
}

.suggestion-info {
  flex: 1;
  margin-left: 8px;
  min-width: 0;
}

.suggestion-name {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-username {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-icon {
  color: #bfbfbf;
  font-size: 14px;
}

/* Custom input styles */
:deep(.ant-input-search) {
  .ant-input {
    font-size: 16px;
    padding: 12px 16px;
    border-radius: 8px;
  }
  
  .ant-input-search-button {
    border-radius: 0 8px 8px 0;
  }
}

:deep(.ant-input-affix-wrapper) {
  padding: 12px 16px;
  border-radius: 8px;
  
  .ant-input {
    font-size: 16px;
  }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .user-search-input {
    padding: 12px 16px;
  }
  
  :deep(.ant-input-search) {
    .ant-input {
      font-size: 16px; /* Prevent zoom on iOS */
      padding: 10px 14px;
    }
  }
  
  :deep(.ant-input-affix-wrapper) {
    padding: 10px 14px;
  }
  
  .suggestions-dropdown {
    left: 16px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .user-search-input {
    padding: 8px 12px;
  }
  
  .suggestions-dropdown {
    left: 12px;
    right: 12px;
  }
}
</style>