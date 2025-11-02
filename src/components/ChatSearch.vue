<template>
  <div class="chat-search" :class="{ 'active': isSearching }">
    <!-- Search Input -->
    <div class="search-input-container">
      <a-input
        ref="searchInput"
        v-model:value="searchQuery"
        placeholder="Search messages..."
        class="search-input"
        @input="handleSearch"
        @keydown.escape="closeSearch"
        @keydown.enter="searchNext"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
        <template #suffix>
          <div class="search-controls">
            <span v-if="searchResults.length > 0" class="search-counter">
              {{ currentResultIndex + 1 }} of {{ searchResults.length }}
            </span>
            <a-button type="text" size="small" @click="searchPrevious" :disabled="searchResults.length === 0">
              <UpOutlined />
            </a-button>
            <a-button type="text" size="small" @click="searchNext" :disabled="searchResults.length === 0">
              <DownOutlined />
            </a-button>
            <a-button type="text" size="small" @click="closeSearch">
              <CloseOutlined />
            </a-button>
          </div>
        </template>
      </a-input>
    </div>

    <!-- Search Results -->
    <div v-if="searchQuery && searchResults.length === 0" class="no-results">
      No messages found for "{{ searchQuery }}"
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {
  SearchOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { useMessagesStore } from '../store/messages'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'result-selected'])

const messagesStore = useMessagesStore()
const searchInput = ref(null)
const searchQuery = ref('')
const currentResultIndex = ref(0)

// Computed
const isSearching = computed(() => props.visible)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  const messages = messagesStore.state.messages
  
  return messages.filter(message => 
    message.text && message.text.toLowerCase().includes(query)
  ).map((message, index) => ({
    ...message,
    searchIndex: index
  }))
})

// Watch for visibility changes
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    searchQuery.value = ''
    currentResultIndex.value = 0
  }
})

// Methods
function handleSearch() {
  currentResultIndex.value = 0
  if (searchResults.value.length > 0) {
    highlightResult(0)
  }
}

function searchNext() {
  if (searchResults.value.length === 0) return
  
  currentResultIndex.value = (currentResultIndex.value + 1) % searchResults.value.length
  highlightResult(currentResultIndex.value)
}

function searchPrevious() {
  if (searchResults.value.length === 0) return
  
  currentResultIndex.value = currentResultIndex.value === 0 
    ? searchResults.value.length - 1 
    : currentResultIndex.value - 1
  highlightResult(currentResultIndex.value)
}

function highlightResult(index) {
  const result = searchResults.value[index]
  if (result) {
    emit('result-selected', result)
  }
}

function closeSearch() {
  emit('close')
}
</script>

<style scoped>
.chat-search {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  z-index: 100;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.chat-search.active {
  transform: translateY(0);
}

.search-input-container {
  padding: 12px 16px;
}

.search-input {
  border-radius: 8px;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-counter {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
  min-width: 60px;
  text-align: center;
}

.no-results {
  padding: 12px 16px;
  color: #8c8c8c;
  font-size: 14px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

/* Search highlight styles */
:deep(.message-text) {
  position: relative;
}

:deep(.search-highlight) {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 500;
}

:deep(.search-highlight.current) {
  background-color: #ffc107;
  color: #000;
}
</style>